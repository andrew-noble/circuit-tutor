#!/usr/bin/env python3

import os
import json
import datetime
from fastapi import FastAPI, HTTPException, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import AsyncOpenAI
from dotenv import load_dotenv
from schemas.circuit import Circuit
from prompts.generation_system_prompt import generation_system_prompt
from prompts.tutoring_system_prompt import tutoring_system_prompt
from pydantic import ValidationError
from fastapi.responses import JSONResponse
from CircuitDigraph import CircuitDigraph
from generate_layout import generate_layout
from schemas.circuit_with_layout import CircuitWithLayout
from circuit_logging import log_circuit_generation, log_circuit_tutoring
import time
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import logging

load_dotenv()

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# Pydantic models for request validation
class CircuitGenerationRequest(BaseModel):
    prompt: str

class CircuitTutorRequest(BaseModel):
    prompt: str
    circuit_data: CircuitWithLayout

class CircuitTutorResponse(BaseModel):
    tutor_response: str

app = FastAPI(title="Circuit Visualization API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# gpt-4o ~ 3s (but struggles with more complex circuits)
# o1 ~ 10s
# o3-mini ~ 15s
# o1-mini doesn't work bc no system message support

GENERATION_MODEL = "o3-mini"
TUTOR_MODEL = "o3-mini"

# Initialize OpenAI client
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@app.get("/test")
@limiter.limit("5/minute")
async def test(request: Request):
    return {"message": "Hello, World!"}

@app.post("/generate-circuit", response_model=CircuitWithLayout)
@limiter.limit("10/minute")
async def generate_circuit(request: Request, data: CircuitGenerationRequest):
    api_start_time = time.perf_counter()
    try:
        response = await client.beta.chat.completions.parse(
            model=GENERATION_MODEL,
            messages=[{"role": "system", "content": generation_system_prompt}, {"role": "user", "content": data.prompt}],
            response_format=Circuit
        )
        circuit_data_dict = json.loads(response.choices[0].message.content)
        api_duration = time.perf_counter() - api_start_time

        layout_time_start = time.perf_counter()

        circuit_graph = CircuitDigraph(circuit_data_dict)
        layout = generate_layout(circuit_graph)

        layout_time = time.perf_counter() - layout_time_start

        print(f"API duration: {api_duration} with model {GENERATION_MODEL}")
        print(f"Layout duration: {layout_time}")

        log_circuit_generation(
            endpoint="/generate-circuit",
            system_prompt=generation_system_prompt,
            user_prompt=data.prompt,
            response_data=circuit_data_dict,
            layout=layout,
            model=GENERATION_MODEL,
            api_duration=api_duration,
            layout_duration=layout_time
        )

        return CircuitWithLayout(**layout)
    except ValidationError as e:
        print(e)
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tutor-circuit", response_model=CircuitTutorResponse)
@limiter.limit("5/minute")
async def tutor_circuit(request: Request, data: CircuitTutorRequest):
    try:
        circuit_context = json.dumps(data.circuit_data.model_dump())
        
        response = await client.chat.completions.create(
            model=TUTOR_MODEL,
            messages=[
                {"role": "system", "content": tutoring_system_prompt},
                {"role": "user", "content": f"Circuit context: {circuit_context}\n\nUser question: {data.prompt}"}
            ]
        )
        response_content = response.choices[0].message.content

        log_circuit_tutoring(
            endpoint="/tutor-circuit",
            system_prompt=tutoring_system_prompt,
            user_prompt=data.prompt,
            response_data=response_content,
            model=TUTOR_MODEL
        )
        return CircuitTutorResponse(tutor_response=response_content)
    except ValidationError as e:
        print(e)
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
    

@app.get("/voltage-divider", response_model=CircuitWithLayout)
def send_voltage_divider(request: Request):
    try:
        with open("example_circuit_layouts/voltage_divider.json", "r") as f:
            data = json.load(f)
        return CircuitWithLayout(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/current-divider", response_model=CircuitWithLayout)
def send_current_divider(request: Request):
    try:
        with open("example_circuit_layouts/current_divider.json", "r") as f:
            data = json.load(f)
        return CircuitWithLayout(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/low-pass-filter", response_model=CircuitWithLayout)
def send_low_pass_filter(request: Request):
    try:
        with open("example_circuit_layouts/low_pass_filter.json", "r") as f:
            data = json.load(f)
        return CircuitWithLayout(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/resistor-network", response_model=CircuitWithLayout)
def send_resistor_network(request: Request):
    try:
        with open("example_circuit_layouts/resistor_network.json", "r") as f:
            data = json.load(f)
        return CircuitWithLayout(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/led-circuit", response_model=CircuitWithLayout)
def send_led_circuit(request: Request):
    try:
        with open("example_circuit_layouts/led_circuit.json", "r") as f:
            data = json.load(f)
        return CircuitWithLayout(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Configure logging manually
logging.basicConfig(
    format="[%(asctime)s] [%(levelname)s] - %(message)s",
    level=logging.DEBUG
)

# uvicorn is a webserver, sorta like node. (asynchronous server gateway node, asgn)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run('app:app', host="0.0.0.0", port=8000, reload=True, log_level="debug", access_log=True)
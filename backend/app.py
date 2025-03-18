#!/usr/bin/env python3

import os
import json
import datetime
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import AsyncOpenAI
from dotenv import load_dotenv
from schemas.circuit import Circuit
from circuit_prompt import CIRCUIT_SYSTEM_PROMPT
from pydantic import ValidationError
from fastapi.responses import JSONResponse
from CircuitDigraph import CircuitDigraph
from generate_layout import generate_layout
from schemas.circuit_with_layout import CircuitWithLayout
from circuit_logging import log_circuit_generation
from examples.voltage_divider import voltage_divider
from examples.current_divider import current_divider

load_dotenv()

# Pydantic models for request validation
class CircuitRequest(BaseModel):
    prompt: str

app = FastAPI(title="Circuit Visualization API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

MODEL = "o3-mini"

# Initialize OpenAI client
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@app.get("/test")
async def test():
    return {"message": "Hello, World!"}

@app.post("/generate-circuit", response_model=CircuitWithLayout)
async def generate_circuit(data: CircuitRequest):
    try:
        response = await client.beta.chat.completions.parse(
            model=MODEL,
            messages=[{"role": "system", "content": CIRCUIT_SYSTEM_PROMPT}, {"role": "user", "content": data.prompt}],
            response_format=Circuit
        )
        
        circuit_data_dict = json.loads(response.choices[0].message.content)

        # Convert to graph and generate layout
        circuit_graph = CircuitDigraph(circuit_data_dict)
        layout = generate_layout(circuit_graph)

        # Log the whole pipeline (prompting, generation, and layout)
        log_circuit_generation(
            endpoint="/generate-circuit",
            system_prompt=CIRCUIT_SYSTEM_PROMPT,
            user_prompt=data.prompt,
            response_data=circuit_data_dict,
            layout=layout
        )
        
        # Validate response using Pydantic
        return CircuitWithLayout(**layout)
        
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/voltage-divider", response_model=CircuitWithLayout)
def send_voltage_divider():
    try:
        return CircuitWithLayout(**voltage_divider)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/current-divider", response_model=CircuitWithLayout)
def send_current_divider():
    try:
        return CircuitWithLayout(**current_divider)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# uvicorn is a webserver, sorta like node. (asynchronous server gateway node, asgn)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run('app:app', host="0.0.0.0", port=8000, reload=True) 
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
from CircuitGraph import CircuitGraph

load_dotenv()

app = FastAPI(title="Circuit Visualization API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

MODEL = "gpt-4o"

# Simple logging function
def log_request_response(endpoint, system_prompt, user_prompt, response_data):
    log_file = "./logs/request_logs.json"
    os.makedirs(os.path.dirname(log_file), exist_ok=True)
    
    log_entry = {
        "timestamp": datetime.datetime.now().isoformat(),
        "endpoint": endpoint,
        "system_prompt": system_prompt,
        "user_prompt": user_prompt,
        "response": response_data
    }
    
    # Load existing logs if file exists
    if os.path.exists(log_file):
        try:
            with open(log_file, 'r') as f:
                logs = json.load(f)
        except json.JSONDecodeError:
            # If file is corrupted, start with empty list
            logs = []
    else:
        logs = []
    
    # Append new log entry
    logs.append(log_entry)
    
    # Write back to file
    with open(log_file, 'w') as f:
        json.dump(logs, f, indent=2)

# Initialize OpenAI client
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@app.get("/test")
async def test():
    return {"message": "Hello, World!"}

@app.post("/request-llm")
async def request_llm(data: dict = Body(...)):
    user_prompt = data["prompt"]
    
    response = await client.beta.chat.completions.parse(
        model=MODEL,
        messages=[{"role": "system", "content": CIRCUIT_SYSTEM_PROMPT}, {"role": "user", "content": user_prompt}],
        response_format=Circuit
    )
    
    response_content = response.choices[0].message.content
    
    # Log the request and response
    log_request_response(
        endpoint="/request-llm",
        system_prompt=CIRCUIT_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        response_data=response_content
    )
    
    return {"message": response_content}

@app.post("/request-circuit")
async def request_circuit(data: dict = Body(...)):
    user_prompt = data["prompt"]
    
    response = await client.beta.chat.completions.parse(
        model=MODEL,
        messages=[{"role": "system", "content": CIRCUIT_SYSTEM_PROMPT}, {"role": "user", "content": user_prompt}],
        response_format=Circuit
    )
    
    circuit_data_dict = json.loads(response.choices[0].message.content) #json received from openAI -> python dict
    circuit_data = Circuit(**circuit_data_dict)
    
    # Log the request and response
    log_request_response(
        endpoint="/request-circuit",
        system_prompt=CIRCUIT_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        response_data=circuit_data_dict
    )

    # convert to graph
    circuit_graph = CircuitGraph(circuit_data)
    circuit_graph.print_adjacency_list()

    return circuit_data_dict

# uvicorn is a webserver, sorta like node. (asynchronous server gateway node, asgn)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run('app:app', host="0.0.0.0", port=8000, reload=True) 
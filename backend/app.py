#!/usr/bin/env python3

import os
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import AsyncOpenAI
from dotenv import load_dotenv
import json
from schema import Circuit

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Circuit Visualization API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

SYSTEM_PROMPT = """
You are a specialized assistant that translates natural language descriptions of electrical circuits into JSON data structures suitable for D3.js visualization.

- Ensure all circuits are electrically complete
- Use standard component types: resistor, capacitor, inductor, voltage_source, current_source, ground
- Output only valid JSON—no explanations or extra text
"""

#simple schema
class ResponseLLM(BaseModel):
    data: str

# Initialize OpenAI client
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@app.get("/test")
async def test():
    return {"message": "Hello, World!"}

@app.post("/request-llm")
async def request_llm(data: dict = Body(...)):
    response = await client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": data["prompt"]}],
        response_format=ResponseLLM
    )
    return {"message": response.choices[0].message.content}

@app.post("/request-circuit")
async def request_circuit(data: dict = Body(...)):
    response = await client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": data["prompt"]}],
        response_format=Circuit
    )
    circuit_data = json.loads(response.choices[0].message.content)
    return circuit_data

# uvicorn is a webserver, sorta like node. (asynchronous server gateway node, asgn)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run('app:app', host="0.0.0.0", port=8000, reload=True) 
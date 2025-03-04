#!/usr/bin/env python3
import os
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
import json

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

# System prompt for D3-compatible circuit description
SYSTEM_PROMPT = """You are a specialized assistant that translates natural language descriptions of electrical circuits into JSON data structures suitable for D3.js visualization.

Output Requirements:

- Generate a JSON object containing:
  - "components": array of circuit components (resistors, capacitors, voltage sources, etc.)
    - each component should have: id, type, value, position {x, y}
  - "connections": array of wire connections between components
    - each connection should have: source (component id), target (component id)
  - "labels": array of text labels for components and values
    - each label should have: text, position {x, y}, target (component id)

Example format:
{
  "components": [
    {"id": "v1", "type": "voltage_source", "value": "5V", "position": {"x": 100, "y": 100}},
    {"id": "r1", "type": "resistor", "value": "1k", "position": {"x": 200, "y": 100}}
  ],
  "connections": [
    {"source": "v1", "target": "r1"}
  ],
  "labels": [
    {"text": "5V", "position": {"x": 90, "y": 90}, "target": "v1"}
  ]
}

- Ensure all circuits are electrically complete
- Use standard component types: resistor, capacitor, inductor, voltage_source, current_source, ground
- Position components in a logical layout for visualization
- Output only valid JSON—no explanations or extra text"""

# Initialize OpenAI client
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OpenAI API key not found in environment variables")

client = OpenAI(api_key=api_key)

# these are cool. They're from pydantic, which is essentially http type/format guardrails
class CircuitRequest(BaseModel):
    prompt: str
    model: str = "gpt-4"
    max_tokens: int = 1000

class CircuitResponse(BaseModel):
    circuit_data: dict
    raw_response: str

def chat_with_gpt(prompt, model="gpt-4", max_tokens=1000):
    """Send a request to the OpenAI API and return the response."""
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            max_tokens=max_tokens
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calling OpenAI API: {str(e)}")

def validate_circuit_data(content: str) -> dict:
    """Validate and parse the circuit JSON data."""
    try:
        # Clean up any markdown code block formatting
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        
        circuit_data = json.loads(content.strip())
        
        # Validate required fields
        required_fields = ["components", "connections", "labels"]
        for field in required_fields:
            if field not in circuit_data:
                raise ValueError(f"Missing required field: {field}")
        
        return circuit_data
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid JSON format: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Error validating circuit data: {str(e)}"
        )

# this decorator does a ton under the hood-- registers fnc at the endpoint, parses req and res against CircuitResponse model
@app.post("/generate-circuit", response_model=CircuitResponse)
async def generate_circuit(request: CircuitRequest = Body(...)):
    """Generate circuit visualization data from a natural language description."""
    # Call the LLM
    raw_response = chat_with_gpt(
        request.prompt,
        model=request.model,
        max_tokens=request.max_tokens
    )
    
    # Process the response
    try:
        circuit_data = validate_circuit_data(raw_response)
        return CircuitResponse(
            circuit_data=circuit_data,
            raw_response=raw_response
        )
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Error processing response: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

# uvicorn is a webserver, sorta like node. (asynchronous server gateway node)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 
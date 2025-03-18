from pydantic import BaseModel
from typing import Optional

class Component(BaseModel):
    id: str # e.g. "r1, c1"
    type: str  # e.g., "resistor", "capacitor"
    value: str
    pins: list[str] 

class Net(BaseModel):
    id: str
    connections: list[list[str, str]] # list of [component_id, pin] pairs

class Circuit(BaseModel):
    components: list[Component]
    nets: list[Net]
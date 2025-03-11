from pydantic import BaseModel
from typing import Optional

class Component(BaseModel):
    id: str # e.g. "r1, c1"
    type: str  # e.g., "resistor", "capacitor"
    value: str
    pins: list[str] 

class Net(BaseModel):
    id: str
    name: Optional[str]  # Optional: human-readable name like "VCC"
    connections: list[list[str, str]] # list of [component_id, pin] pairs

class Circuit(BaseModel):
    components: list[Component]
    nets: list[Net]
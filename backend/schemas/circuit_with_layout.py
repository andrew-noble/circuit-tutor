from pydantic import BaseModel
from typing import Optional

# Position class for components (with rotation)
class ComponentPosition(BaseModel):
    x: int
    y: int
    rotation: float = 0  # Default rotation is 0 degrees

# Nets won't need rotation, they're points (the net "hub")
class NetPosition(BaseModel):
    x: int
    y: int

class ComponentWithPosition(BaseModel):
    id: str  # e.g. "r1, c1"
    type: str  # e.g., "resistor", "capacitor"
    value: str
    pins: list[str]
    position: ComponentPosition

class NetWithPosition(BaseModel):
    id: str
    connections: list[list[str, str]]  # list of [component_id, pin] pairs
    position: NetPosition

class CircuitWithLayout(BaseModel):
    components: list[ComponentWithPosition]
    nets: list[NetWithPosition]
    # could add layout configurability options here
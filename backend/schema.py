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
    connections: list[list[str, str]]

class Circuit(BaseModel):
    components: list[Component]
    nets: list[Net]

# #-------------------------------------------------------

# # Position class for components (with rotation)
# class ComponentPosition(BaseModel):
#     x: int
#     y: int
#     rotation: float = 0  # Default rotation is 0 degrees

# #nets won't need rotation, they're points (the net "hub")
# class NetPosition(BaseModel):
#     x: int
#     y: int

# class ComponentWithPosition(BaseModel):
#     id: str
#     type: str
#     name: str
#     pins: list[str]
#     position: ComponentPosition

# class NetWithPosition(BaseModel):
#     id: str
#     name: str
#     connections: list[Connection]
#     position: NetPosition

# class CircuitWithLayout(BaseModel):
#     components: list[ComponentWithPosition]
#     nets: list[NetWithPosition]
#     # could add layout configurability options here
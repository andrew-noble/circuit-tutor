from pydantic import BaseModel

class Pin(BaseModel):
    id: str
    net: str  # The net/wire this pin connects to

class Component(BaseModel):
    id: str
    type: str
    pins: list[Pin]
    # position: dict  # for visualization, save for later if we allow non-deterministic layouting

class Net(BaseModel):
    id: str
    name: str
    components: list[Component]

class Label(BaseModel):
    text: str
    target: str

class Circuit(BaseModel):
    components: list[Component]
    nets: list[Net]
    labels: list[Label]


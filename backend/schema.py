from pydantic import BaseModel

class Component(BaseModel):
    id: str
    type: str  # e.g., "resistor", "capacitor"
    name: str  # e.g., "R1", "C1"
    pins: list[str]  # Just a list of pin names like ["Vin", "GND"]

class Connection(BaseModel):
    component: str
    pin: str

class Net(BaseModel):
    id: str
    name: str  # Optional: human-readable name like "VCC"
    connections: list[Connection]

class Label(BaseModel):
    id: str
    text: str  # Text for annotation (e.g., "5V" on a net)
    target: str  # Can reference a Net ID or Component ID

class Circuit(BaseModel):
    components: list[Component]
    nets: list[Net]
    labels: list[Label]

# class Pin(BaseModel):
#     id: str
#     net: str  # The net/wire this pin connects to

# class Component(BaseModel):
#     id: str
#     type: str
#     pins: list[Pin]
#     # position: dict  # for visualization, save for later if we allow non-deterministic layouting

# class Net(BaseModel):
#     id: str
#     name: str
#     components: list[Component]

# class Label(BaseModel):
#     text: str
#     target: str

# class Circuit(BaseModel):
#     components: list[Component]
#     nets: list[Net]
#     labels: list[Label]
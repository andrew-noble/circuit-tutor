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
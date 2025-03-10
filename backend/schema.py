from pydantic import BaseModel

class Component(BaseModel):
    id: str
    type: str  # e.g., "resistor", "capacitor"
    name: str  # e.g., "R1", "C1"
    pins: list[str]  # Just a list of pin names like ["Vin", "GND"]
    # conventionally, reversible components have pins a, b
    # voltage sources and current sources have + and -
    

class Connection(BaseModel):
    component: str
    pin: str

class Net(BaseModel):
    id: str
    name: str  # Optional: human-readable name like "VCC"
    connections: list[Connection]

# class Label(BaseModel):
#     id: str
#     text: str  # Text for annotation (e.g., "5V" on a net)
#     target: str  # Can reference a Net ID or Component ID

class Circuit(BaseModel):
    components: list[Component]
    nets: list[Net]
    # labels: list[Label]

# Position class for components (with rotation)
class ComponentPosition(BaseModel):
    x: int
    y: int
    rotation: float = 0  # Default rotation is 0 degrees

#nets won't need rotation, they're points (the net "hub")
class NetPosition(BaseModel):
    x: int
    y: int

class ComponentWithPosition(Component):
    position: ComponentPosition

class NetWithPosition(Net):
    position: NetPosition

class CircuitWithLayout(BaseModel):
    components: list[ComponentWithPosition]
    nets: list[NetWithPosition]
    # could add layout configurability options here
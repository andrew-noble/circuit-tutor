import networkx as nx
from schema import Circuit, Component, Net

"""This implements a simple bipartite graph representation of a circuit

- components and edges are both represented as nodes in the graph
- connections between components and nets are represented as edges in the graph
    - thus, edges must include a pin identifier

This arrangement allows for future extensions like multi-terminal components
(e.g. transformers, opamps, etc.). In a traditional circuit graph where edges
represent components, this would not be possible.
"""

class CircuitGraph():
    def __init__(self, circuit : Circuit):
        self.graph = nx.Graph()
        self.circuit = circuit
        self._build_graph()

    def _build_graph(self) -> None:
        """Builds a bipartite graph from the passed circuit definition"""
        # Add component nodes
        for component in self.circuit.components:
            self.graph.add_node(component.id, type='component', data=component)
        
        # Add net nodes and edges
        for net in self.circuit.nets:
            self.graph.add_node(net.id, type='net', data=net)
            # Add edges between nets and components
            for component_id, pin in net.connections:
                self.graph.add_edge(net.id, component_id, pin=pin)

    def add_component(self, component: Component) -> None:
        """Add a new component to the graph"""
        self.graph.add_node(component.id, type='component', data=component)

    def add_net(self, net: Net) -> None:
        """Add a new net to the graph"""
        self.graph.add_node(net.id, type='net', data=net)
        for component_id, pin in net.connections:
            self.graph.add_edge(net.id, component_id, pin=pin) #nets definitionally need an edge. 

    def print_adjacency_list(self) -> None:
        """Print adjacency list for debugging"""
        for node in self.graph.nodes():
            neighbors = list(self.graph.neighbors(node))
            node_type = self.graph.nodes[node]['type']
            print(f"{node} ({node_type}) -> {neighbors}")


# idea for later -- would be very easy to determine if parallel or series 
# by seeing if self.graph.neighbors(component_node_1) == self.graph.neighbors(component_node_2)
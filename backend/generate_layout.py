import networkx as nx
import math
from CircuitDigraph import CircuitDigraph
from collections import deque

def generate_layout(circuit: CircuitDigraph) -> dict:
    layout = []
    visited = set()
    queue = deque([("V1", 0)])  # Store node and y-position
    
    level_map = {"V1": 0}  # Maps nodes to their x-coordinate (level)
    current_level = 0
    
    while queue:
        current_node, y_pos = queue.popleft()
        
        if current_node in visited:
            continue
            
        visited.add(current_node)
        x_pos = level_map.get(current_node, current_level) #returns current_level if no curNode
        
        # Add current node to layout
        layout.append({**circuit.graph.nodes[current_node]["data"], "position": (x_pos, int(y_pos))})
        
        # Process neighbors
        neighbors = list(circuit.graph.neighbors(current_node))
        if neighbors:
            spacing = 2  # Vertical spacing between nodes
            
            # Calculate starting y position to center the neighbors
            start_y = -(len(neighbors) - 1) * spacing / 2
            
            for i, neighbor in enumerate(neighbors):
                if neighbor not in visited:
                    neighbor_y = start_y + i * spacing
                    
                    # Set the neighbor's level (x-coordinate)
                    # All neighbors of the same node share the same x-coordinate
                    next_level = x_pos + 1
                    level_map[neighbor] = next_level
                    
                    queue.append((neighbor, neighbor_y))
    
    return layout
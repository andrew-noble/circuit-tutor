import networkx as nx
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
        x_pos = level_map.get(current_node, current_level)
        
        # Add current node to layout
        node_data = circuit.graph.nodes[current_node]["data"]
        layout.append({**node_data, "position": (x_pos, int(y_pos))})
        
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
                    next_level = x_pos + 1
                    level_map[neighbor] = next_level
                    
                    queue.append((neighbor, neighbor_y))
    
    # Transform layout into a dictionary structure
    components = []
    nets = []
    
    for node in layout:
        x, y = node["position"]
        if "type" in node:  # This is a component
            components.append({
                "id": node["id"],
                "type": node["type"],
                "name": node.get("value", ""),
                "pins": node["pins"],
                "position": {"x": x, "y": y}
            })
        else:  # This is a net
            nets.append({
                "id": node["id"],
                "name": node.get("name", f"Net {node['id']}"),
                "connections": node["connections"],
                "position": {"x": x, "y": y}
            })
    
    # Note: this function guarantees sequential ordering of components and nets due to the bfs traversal
    return {
        "components": components,
        "nets": nets
    }
import networkx as nx
import math
from CircuitDigraph import CircuitDigraph
from collections import deque

def generate_layout(circuit : CircuitDigraph) -> dict:
    layout = []

    visited = set()

    for x, edge in enumerate(nx.bfs_edges(circuit.graph, "V1")):
        if edge[0] in visited:
            continue
        visited.add(edge[0])
        layout.append({**circuit.graph.nodes[edge[0]]["data"], "position": (x, 0)})
        neighbors = list(circuit.graph.neighbors(edge[0]))
        if len(neighbors) == 1:
            continue
        else:
            for i, neighbor in enumerate(neighbors):
                if neighbor in visited:
                    continue
                visited.add(neighbor)
                y = math.floor((i+1/2))*(-1)**i
                layout.append({**circuit.graph.nodes[neighbor]["data"], "position": (x, y)})

    return layout

    # # add voltage source dict to layout after augmenting with position
    # layout.append({**circuit.graph.nodes["V1"]["data"], "position": (0, 0)})

    # #record that we visited it
    # visited = set(["V1"])

    # #hardcode N1 as the next node to visit
    # queue = deque(["V1"])

    # x = 1 # since voltage source is at 0, need to start x coords at 1
    # while queue:
    #     current_node = queue.popleft()
    #     if current_node in visited:
    #         continue
    #     visited.add(current_node)

    #     #add the node to the layout
    #     layout.append({**circuit.graph.nodes[current_node]["data"], "position": (x, 0)})


    #     #add the neighbors to the queue
    #     for neighbor in circuit.graph.neighbors(current_node):
    #         if neighbor not in visited:
    #             queue.append(neighbor)

    # return layout
import math

# finds the voltage source in the circuit
def find_voltage_source(components: list[dict]) -> dict:
    vs_dict = next((c for c in components if c["type"] == "voltage_source"), None)
    return vs_dict

# finds the net connected to a specific component pin
def find_connected_net(nets: list[dict], component: dict, pin: str) -> dict:
    net_dict = next(
        (n for n in nets if any(
            conn["component_id"] == component["id"] and conn["pin"] == pin 
            for conn in n["connections"]
        )), 
        None
    )
    return net_dict

# finds components downstream of the passed net
def get_downstream_components(components: list[dict], net: dict) -> list[dict]:
    # the not in filters out the component immediately upstream
    component_ids = [conn["component_id"] for conn in net["connections"] if conn["pin"] not in ["+", "b"]]
    result = [c for c in components if c["id"] in component_ids]
    return result

# this will lay out a verticle ladder of parallel components
def calculate_component_position(x: int, i: int, rotation: int) -> dict:
    position = {
        "x": x,
        "y": 1 + math.floor((i+1)/2)*(-1)**(i), #this hack makes the vertical ladder by doing a 0,-1,1,-2,2,-3.. pattern
        "rotation": rotation
    }
    return position

def generateLayout(circuit_dict: dict) -> dict:
    print(f"DEBUG: Starting layout generation for circuit with {len(circuit_dict['components'])} components and {len(circuit_dict['nets'])} nets")
    output = {
        "components": [],
        "nets": []
    }
    
    # Find voltage source
    vs_dict = find_voltage_source(circuit_dict["components"])
    print(f"DEBUG: Found voltage source: {vs_dict['id']}")
    
    # Create positioned component directly from the dictionary
    print("DEBUG: Positioning voltage source at (0,0) with 90 degree rotation")
    output["components"].append({
        **vs_dict,  # Spread the component fields
        "position": {"x": 0, "y": 0, "rotation": 90}
    })
    print(f"DEBUG: Added voltage source {vs_dict['id']} to output")
    
    # Find the net connected to VS+
    print("DEBUG: Looking for net connected to voltage source + terminal")
    vs_plus_net_dict = find_connected_net(
        circuit_dict["nets"], 
        vs_dict, 
        "+"
    )
    print(f"DEBUG: Found VS+ net: {vs_plus_net_dict['id']}")
    
    # # Add positioned net
    # print("DEBUG: Positioning VS+ net at (0,1)")
    # output["nets"].append({
    #     **vs_plus_net_dict,
    #     "position": {"x": 0, "y": 1}
    # })
    # print(f"DEBUG: Added VS+ net {vs_plus_net_dict['id']} to output")

    curNet = vs_plus_net_dict

    # Process remaining nets and their connected components
    print("DEBUG: Processing remaining nets")
    for x in range(len(circuit_dict["nets"]) - 1):
        #we know last net is connected to ground, so stop short
        print(f"DEBUG: Processing net {x+1}/{len(circuit_dict['nets'])}: {curNet['id']}")
        
        # Find components connected to this net
        print(f"DEBUG: Finding components downstream of {curNet['id']}")
        component_dicts = get_downstream_components(circuit_dict["components"], curNet)
        print(f"DEBUG: Found {len(component_dicts)} components downstream of net {curNet['id']}")
        
        # Add positioned components
        for i, component_dict in enumerate(component_dicts):
            print(f"DEBUG: Positioning component {i+1}/{len(component_dicts)}: {component_dict['id']}")
            position = calculate_component_position(x, i, 0)
            print(f"DEBUG: Calculated position for {component_dict['id']}: {position}")
            
            output["components"].append({
                **component_dict,
                "position": position
            })
            print(f"DEBUG: Added component {component_dict['id']} to output")
        
        # Add positioned net
        print(f"DEBUG: Positioning net {curNet['id']} ahead to x = {x+2}")
        output["nets"].append({
            **curNet,
            "position": {"x": x - 1, "y": 1}
        })
        print(f"DEBUG: Added net {curNet['id']} to output")

        curNet = find_connected_net(circuit_dict["nets"], output["components"][-1], "b")
    
    return output





            

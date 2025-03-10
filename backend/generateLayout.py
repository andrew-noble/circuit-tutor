from schema import Circuit, CircuitWithLayout, ComponentWithPosition, NetWithPosition

def generateLayout(circuit: Circuit) -> CircuitWithLayout:
    print("layout function called with circuit:", circuit)
    components, nets = circuit.components, circuit.nets

    #init CircuitWithLayout
    result = CircuitWithLayout(components=[], nets=[])

    #find the voltage source (assume one, for now)
    vs = next((c for c in components if c.type == "voltage_source"), None)
    if not vs:
        raise ValueError("No voltage source found in circuit")
    
    print("found voltage source:", vs)

    #place voltage source at origin
    result.components.append(ComponentWithPosition(**vs, position={"x": 0, "y": 0}))
    
    #find the net that vs+ is connected to
    vs_plus_net = next((n for n in nets if vs.id in n.connections), None)
    if not vs_plus_net:
        raise ValueError("No net found for voltage source + terminal")
    
    print("found vs+ net:", vs_plus_net)

    prevComponent = vs
    curNet = vs_plus_net
    for x in range(len(nets)):
        
        # even though we get components and nets in array form, 
        # we cannot trust the llm to have put them in logical order

        print("processing net:", curNet)

        if len(curNet.connections) == 2:
            #LAYOUT SERIES COMPONENT
            #this net is connected to one resistor/component
            print("found series component connection")

            #find the component(s) that connect this net to the next one
            # this is so fugly i hate it, but it works
            component = next((c for c in components if c.id in curNet.connections & c.id != prevComponent.id), None)
            print("series component:", component)

            #place net down in front of current
            net = NetWithPosition(**curNet, position={"x": x + 1, "y": 0})
            result.nets.append(net)

            #place the next component 2 graph units to right
            component = ComponentWithPosition(**component, position={"x": x + 2, "y": 0}) #just move to right
            result.components.append(component)

            prevComponent = component


            

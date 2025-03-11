VOLTAGE_DIVIDER_EXAMPLE = {
    "components": [
        {
            "id": "R1",
            "type": "resistor",
            "value": "1k",
            "pins": ["a", "b"]
        },
        {
            "id": "R2",
            "type": "resistor",
            "value": "1k",
            "pins": ["a", "b"]
        },
        {
            "id": "V1",
            "type": "voltage_source",
            "value": "5V",
            "pins": ["+", "-"]
        }
    ],
    "nets": [
        {
            "id": "net1",
            "name": None,
            "connections": [
                ["V1", "+"],
                ["R1", "a"]
            ]
        },
        {
            "id": "net2",
            "name": None,
            "connections": [
                ["R1", "b"],
                ["R2", "a"]
            ]
        },
        {
            "id": "net3",
            "name": None,
            "connections": [
                ["R2", "b"],
                ["V1", "-"]
            ]
        }
    ]
}
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
            "id": "N1",
            "name": None,
            "connections": [
                ["V1", "+"],
                ["R1", "a"]
            ]
        },
        {
            "id": "N2",
            "name": None,
            "connections": [
                ["R1", "b"],
                ["R2", "a"]
            ]
        },
        {
            "id": "N3",
            "name": None,
            "connections": [
                ["R2", "b"],
                ["V1", "-"]
            ]
        }
    ]
}
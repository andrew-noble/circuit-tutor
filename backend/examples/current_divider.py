current_divider = {
  "components": [
    {
      "id": "V1",
      "type": "voltage_source",
      "value": "10V",
      "pins": [
        "+",
        "-"
      ],
      "position": {
        "x": 0,
        "y": 0,
        "rotation": 0.0
      }
    },
    {
      "id": "R1",
      "type": "resistor",
      "value": "1k",
      "pins": [
        "a",
        "b"
      ],
      "position": {
        "x": 2,
        "y": -1,
        "rotation": 0.0
      }
    },
    {
      "id": "R2",
      "type": "resistor",
      "value": "1k",
      "pins": [
        "a",
        "b"
      ],
      "position": {
        "x": 2,
        "y": 1,
        "rotation": 0.0
      }
    }
  ],
  "nets": [
    {
      "id": "N1",
      "connections": [
        [
          "V1",
          "+"
        ],
        [
          "R1",
          "a"
        ],
        [
          "R2",
          "a"
        ]
      ],
      "position": {
        "x": 1,
        "y": 0
      }
    },
    {
      "id": "N2",
      "connections": [
        [
          "V1",
          "-"
        ],
        [
          "R1",
          "b"
        ],
        [
          "R2",
          "b"
        ]
      ],
      "position": {
        "x": 3,
        "y": 0
      }
    }
  ]
}
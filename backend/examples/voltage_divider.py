voltage_divider = {
      "components": [
        {
          "id": "V1",
          "type": "voltage_source",
          "value": "5V",
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
          "value": "1kΩ",
          "pins": [
            "a",
            "b"
          ],
          "position": {
            "x": 2,
            "y": 0,
            "rotation": 0.0
          }
        },
        {
          "id": "R2",
          "type": "resistor",
          "value": "1kΩ",
          "pins": [
            "a",
            "b"
          ],
          "position": {
            "x": 4,
            "y": 0,
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
              "R1",
              "b"
            ],
            [
              "R2",
              "a"
            ]
          ],
          "position": {
            "x": 3,
            "y": 0
          }
        },
        {
          "id": "N3",
          "connections": [
            [
              "V1",
              "-"
            ],
            [
              "R2",
              "b"
            ]
          ],
          "position": {
            "x": 5,
            "y": 0
          }
        }
      ]
    }
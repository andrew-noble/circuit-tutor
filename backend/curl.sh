#!/bin/bash
curl -X POST http://localhost:8000/generate-circuit -H "Content-Type: application/json" -d '{"prompt": "A simple voltage divider"}' | jq

curl -X GET http://localhost:8000/current-divider -H "Content-Type: application/json" | jq

curl -X GET http://localhost:8000/voltage-divider -H "Content-Type: application/json" | jq

curl -X POST http://localhost:8000/tutor-circuit \
  -H "Content-Type: application/json" \
  -d "$(jq -c '. | {prompt: "What is the current through R1?", circuit_data: .}' examples/voltage_divider.json)" | jq

#!/bin/bash
curl -X POST http://localhost:8000/generate-circuit -H "Content-Type: application/json" -d '{"prompt": "A simple voltage divider"}' | jq

curl -X GET http://localhost:8000/current-divider -H "Content-Type: application/json" | jq

curl -X GET http://localhost:8000/voltage-divider -H "Content-Type: application/json" | jq
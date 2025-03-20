import os
import json
import datetime

# Simple logging function
def log_circuit_generation(endpoint, system_prompt, user_prompt, response_data, layout, model, api_duration, layout_duration):
    log_file = "./logs/generation_logs.jsonl"
    os.makedirs(os.path.dirname(log_file), exist_ok=True)
    
    log_entry = {
        "timestamp": datetime.datetime.now().isoformat(),
        "endpoint": endpoint,
        "model": model,
        "system_prompt": system_prompt,
        "user_prompt": user_prompt,
        "response": response_data,
        "layout": layout,
        "api_duration": api_duration,
        "layout_duration": layout_duration
    }
    
    # Append the new log entry
    with open(log_file, "a") as f:
        json.dump(log_entry, f)
        f.write("\n")  # Add newline to separate entries


def log_circuit_tutoring(endpoint, system_prompt, user_prompt, response_data, model):
    log_file = "./logs/tutoring_logs.jsonl"
    os.makedirs(os.path.dirname(log_file), exist_ok=True)

    log_entry = {
        "timestamp": datetime.datetime.now().isoformat(),
        "endpoint": endpoint,
        "model": model,
        "system_prompt": system_prompt,
        "user_prompt": user_prompt,
        "response": response_data
    }
    
    # Append the new log entry
    with open(log_file, "a") as f:
        json.dump(log_entry, f)
        f.write("\n")  # Add newline to separate entries


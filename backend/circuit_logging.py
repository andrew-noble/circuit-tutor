import os
import json
import datetime

# Simple logging function
def log_circuit_generation(endpoint, system_prompt, user_prompt, response_data, layout):
    log_file = "./logs/request_logs.json"
    os.makedirs(os.path.dirname(log_file), exist_ok=True)
    
    log_entry = {
        "timestamp": datetime.datetime.now().isoformat(),
        "endpoint": endpoint,
        "system_prompt": system_prompt,
        "user_prompt": user_prompt,
        "response": response_data,
        "layout": layout
    }
    
    # Load existing logs if file exists
    if os.path.exists(log_file):
        try:
            with open(log_file, 'r') as f:
                logs = json.load(f)
        except json.JSONDecodeError:
            # If file is corrupted, start with empty list
            logs = []
    else:
        logs = []    
    # Append new log entry
    logs.append(log_entry)

    # Write back to file
    with open(log_file, "w") as f:
        json.dump(logs, f, indent=2)

import json

def print_prompts_from_file(filename):
    print(f"\n=== Prompts from {filename} ===\n")
    with open(filename, 'r') as f:
        for line in f:
            try:
                entry = json.loads(line)
                if 'user_prompt' in entry:
                    print(f"Prompt: {entry['user_prompt']}")
                    print("-" * 50)
            except json.JSONDecodeError:
                continue

# Print prompts from both files
print_prompts_from_file('backend/logs/generation_logs.jsonl')
print_prompts_from_file('backend/logs/tutoring_logs.jsonl') 
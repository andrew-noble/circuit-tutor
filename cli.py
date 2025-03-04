#!/usr/bin/env python3
import argparse
import requests
import json
import sys

def main():
    parser = argparse.ArgumentParser(description="Command line client for Circuit Visualization API")
    parser.add_argument("prompt", nargs="?", help="The circuit description prompt")
    parser.add_argument("--model", "-m", default="gpt-4", 
                        help="The model to use (default: gpt-4)")
    parser.add_argument("--max-tokens", "-t", type=int, default=1000,
                        help="Maximum number of tokens in the response (default: 1000)")
    parser.add_argument("--output", "-o", help="Save the circuit data to a JSON file")
    parser.add_argument("--url", default="http://localhost:8000", 
                        help="API server URL (default: http://localhost:8000)")
    
    args = parser.parse_args()
    
    # Get prompt from command line or stdin
    prompt = args.prompt
    if not prompt and not sys.stdin.isatty():
        prompt = sys.stdin.read().strip()
    
    if not prompt:
        parser.print_help()
        return
    
    # Prepare request data
    request_data = {
        "prompt": prompt,
        "model": args.model,
        "max_tokens": args.max_tokens
    }
    
    # Send request to API
    try:
        response = requests.post(
            f"{args.url}/generate-circuit",
            json=request_data
        )
        
        if response.status_code != 200:
            print(f"Error: {response.status_code}")
            print(response.text)
            return
        
        result = response.json()
        
        # Print circuit data in a formatted way
        print(json.dumps(result["circuit_data"], indent=2))
        
        # Save to file if output is specified
        if args.output:
            filename = args.output
            if not filename.endswith('.json'):
                filename += '.json'
                
            with open(filename, 'w') as file:
                json.dump(result["circuit_data"], file, indent=2)
            print(f"Circuit data saved to {filename}")
            
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to API: {str(e)}")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    main() 
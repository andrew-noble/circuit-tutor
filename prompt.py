#!/usr/bin/env python3
import os
import sys
import argparse
from openai import OpenAI
from dotenv import load_dotenv

# System prompt for KiCad s-expression translation
SYSTEM_PROMPT = """You are a specialized assistant that translates natural language descriptions of electrical circuits into s-expressions for KiCad. 
Your purpose is to convert text descriptions into properly formatted s-expressions that can be used in KiCad to create electrical diagrams.
Only respond with the s-expression, nothing else."""

def setup_api_key():
    """Load API key from environment variables or prompt user for it."""
    load_dotenv()  # Load API key from .env file if it exists
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("OpenAI API key not found in environment variables.")
        api_key = input("Please enter your OpenAI API key: ")
        if not api_key:
            sys.exit("API key is required to continue.")
    
    return api_key

def chat_with_gpt(client, prompt, model="gpt-4o", max_tokens=1000):
    """Send a request to the OpenAI API and return the response."""
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            max_tokens=max_tokens
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Error: {str(e)}"

def main():
    parser = argparse.ArgumentParser(description="Command line interface for ChatGPT")
    parser.add_argument("prompt", nargs="?", help="The prompt to send to ChatGPT")
    parser.add_argument("--model", "-m", default="gpt-4o", 
                        help="The model to use (default: gpt-4o)")
    parser.add_argument("--max-tokens", "-t", type=int, default=1000,
                        help="Maximum number of tokens in the response (default: 1000)")
    parser.add_argument("--interactive", "-i", action="store_true",
                        help="Start an interactive chat session")
    
    args = parser.parse_args()
    
    # Set up the API key and client
    api_key = setup_api_key()
    client = OpenAI(api_key=api_key)
    
    if args.interactive:
        print("Starting interactive chat session with ChatGPT. Type 'exit' to quit.")
        print("--------------------------------------------------------------")
        print("This assistant translates natural language circuit descriptions into KiCad s-expressions.")
        
        conversation_history = [
            {"role": "system", "content": SYSTEM_PROMPT}
        ]
        
        while True:
            user_input = input("\nYou: ")
            if user_input.lower() in ["exit", "quit", "q"]:
                break
            
            conversation_history.append({"role": "user", "content": user_input})
            
            try:
                response = client.chat.completions.create(
                    model=args.model,
                    messages=conversation_history,
                    max_tokens=args.max_tokens
                )
                
                assistant_response = response.choices[0].message.content.strip()
                conversation_history.append({"role": "assistant", "content": assistant_response})
                
                print(f"\nChatGPT: {assistant_response}")
            except Exception as e:
                print(f"\nError: {str(e)}")
    
    elif args.prompt:
        response = chat_with_gpt(client, args.prompt, args.model, args.max_tokens)
        print(response)
    
    else:
        # If no prompt is provided and not in interactive mode, read from stdin
        if not sys.stdin.isatty():
            prompt = sys.stdin.read().strip()
            if prompt:
                response = chat_with_gpt(client, prompt, args.model, args.max_tokens)
                print(response)
        else:
            parser.print_help()

if __name__ == "__main__":
    main()

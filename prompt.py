#!/usr/bin/env python3
import os
import sys
import argparse
from openai import OpenAI
from dotenv import load_dotenv
from base_sch import BASE_SCHEMATIC  # Import the base schematic template

# System prompt for KiCad s-expression translation
SYSTEM_PROMPT = """You are a specialized assistant that translates natural language descriptions of electrical circuits into KiCad s-expressions for the purpose of generating explanatory schematics for students learning about circuits.

Output Requirements:

- Generate only symbol, wire, junction, no_connect, power, and label elements.
- Ensure all circuits are electrically complete, including necessary power (V+, GND).
- Reference component pins correctly in connections.
- Do not include kicad_sch, title_block, or paper.
- Output only raw s-expression code—no explanations, no formatting, no extra text.
- it is critical that output is kicad-complient such that it can be loaded into kicad without modification."""

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

def validate_and_clean_kicad_content(content):
    """Validate and clean KiCad s-expression content."""
    # Strip any markdown code block formatting
    content = content.strip()
    
    # Handle various markdown code block formats
    code_block_starts = ["```scheme", "```lisp", "```s-expression", "```", "```scm", "(circuit"]
    for start in code_block_starts:
        if content.startswith(start):
            content = content[len(start):].strip()
            break
    
    # Remove trailing code block markers
    if content.endswith("```"):
        content = content[:-3].strip()
    
    # Ensure the s-expression starts with a parenthesis
    if not content.strip().startswith("("):
        raise ValueError("The response doesn't appear to be a valid s-expression. It should start with '('")
        
    return content

def inject_into_base_schematic(content):
    """Inject the LLM-generated content into the base schematic template."""
    return BASE_SCHEMATIC.format(body=content)

def save_to_file(content, filename):
    """Save content to a file with the given filename."""
    try:
        # Validate and clean the content before saving
        cleaned_content = validate_and_clean_kicad_content(content)
        
        # Inject the cleaned content into the base schematic
        full_schematic = inject_into_base_schematic(cleaned_content)
        
        # Ensure the filename has the .kicad_sch extension
        if not filename.endswith('.kicad_sch'):
            filename += '.kicad_sch'
            
        with open(filename, 'w') as file:
            file.write(full_schematic)
        print(f"Response saved to {filename}")
    except Exception as e:
        print(f"Error saving to file: {str(e)}")
        sys.exit(1)  # Exit with error code

def main():
    parser = argparse.ArgumentParser(description="Command line interface for ChatGPT")
    parser.add_argument("prompt", nargs="?", help="The prompt to send to ChatGPT")
    parser.add_argument("--model", "-m", default="gpt-4o", 
                        help="The model to use (default: gpt-4o)")
    parser.add_argument("--max-tokens", "-t", type=int, default=1000,
                        help="Maximum number of tokens in the response (default: 1000)")
    parser.add_argument("--interactive", "-i", action="store_true",
                        help="Start an interactive chat session")
    parser.add_argument("--output", "-o", help="Save the response to a .kicad_sch file")
    
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
        
        #for extended conversations, not really important right now
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
        
        # Save to file if output is specified
        if args.output:
            save_to_file(response, args.output)
    
    else:
        # If no prompt is provided and not in interactive mode, read from stdin. This is for piping
        if not sys.stdin.isatty():
            prompt = sys.stdin.read().strip()
            if prompt:
                response = chat_with_gpt(client, prompt, args.model, args.max_tokens)
                print(response)
                
                # Save to file if output is specified
                if args.output:
                    save_to_file(response, args.output)
        else:
            parser.print_help()

if __name__ == "__main__":
    main()

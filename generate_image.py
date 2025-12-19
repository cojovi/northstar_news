import os
import sys
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO

# 1. Configuration
# Ensure you have 'GEMINI_API_KEY' set in your environment variables.
api_key = os.environ.get("GEMINI_API_KEY")

if not api_key:
    print("Error: GEMINI_API_KEY environment variable not found.")
    print("Please set it using: export GEMINI_API_KEY='your_key'")
    sys.exit(1)

# The model ID. User requested gemini-2.5-flash-image.
# If this fails, try "gemini-2.0-flash-exp"
# The model ID. Switching to gemini-2.0-flash-exp as 2.5 was not found.
MODEL_ID = "imagen-4.0-generate-001" 

def generate_image(prompt_text, output_filename="generated_image.png"):
    print(f"--- Connecting to Gemini API using model: {MODEL_ID} ---")
    
    try:
        client = genai.Client(api_key=api_key)
        
        print(f"Generating image for prompt: '{prompt_text}'...")
        
        # 2. The API Call
        # Corrected: generate_images (plural) and GenerateImagesConfig (plural)
        response = client.models.generate_images(
            model=MODEL_ID,
            prompt=prompt_text,
            config=types.GenerateImagesConfig(
                number_of_images=1,
            )
        )

        # 3. Handling the Response
        if response.generated_images:
            image_bytes = response.generated_images[0].image.image_bytes
            
            # Convert bytes to an image object
            image = Image.open(BytesIO(image_bytes))
            
            # Save to file
            image.save(output_filename)
            print(f"Success! Image saved to: {os.path.abspath(output_filename)}")
            
            # Open the image automatically
            try:
                if sys.platform == "win32":
                    os.startfile(output_filename)
                elif sys.platform == "darwin": # macOS
                    os.system(f"open {output_filename}")
                else: # Linux
                    os.system(f"xdg-open {output_filename}")
            except:
                pass 
        else:
            print("No image was returned. Check safety filters or prompt.")

    except Exception as e:
        print(f"\nAn error occurred:\n{e}")
        # Help usage if model is wrong
        if "404" in str(e) or "not found" in str(e).lower():
             print(f"\nTip: If the model '{MODEL_ID}' is not found, try checking your API key or quota. Available models: imagen-4.0-generate-001")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        user_prompt = " ".join(sys.argv[1:])
    else:
        user_prompt = input("Enter your image prompt: ")
    
    if user_prompt:
        generate_image(user_prompt)
    else:
        print("Prompt cannot be empty.")
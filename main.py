from fastapi import FastAPI, File, UploadFile, Form, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
# from pydantic import BaseModel
import base64
import os
# from groq import Groq
from openai import OpenAI
from PIL import Image
import io
# import uvicorn
from markdown import markdown
# from typing import Optional
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Palm Reading API",
    description="API for palm reading analysis",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://palm-reader-app-4aqy.onrender.com"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files directory
app.mount("/static", StaticFiles(directory="static"), name="static")

# Setup jinja2 templates
templates = Jinja2Templates(directory="templates")

# Function to encode the image to base64
def encode_image(image_bytes):
    return base64.b64encode(image_bytes).decode('utf-8')

# Function to process the image and get a palm reading
async def get_palm_reading(image_bytes, language="English"):
    # Encode image to base64
    base64_image = encode_image(image_bytes)
    
    # Get API key from environment variable
    # api_key = os.environ.get("GROQ_API_KEY")
    api_key = os.environ.get("OPENAI_API_KEY")
    
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ API key not found. Please set the GROQ_API_KEY environment variable.")
    
    # Create model client
    client = Groq(api_key=api_key)
    # client = OpenAI(api_key=api_key)

    # Prepare system prompt based on language
    # system_prompt = "You are a veteran palm reader. Provided to you is an image of a palm. Thoroughly analyze the palm lines, palm shape, and fingers. Based on your analysis provide a suitable palm reading report."
    system_prompt = """You are a seasoned palmistry expert with a practical, respectful style. Analyze the provided palm image and deliver a clear, insightful report. Cover the following visible features:

- **Major Lines**: example - Heart, Head, Life, and Fate Lines
- **Minor Lines**
- **Mounts**
- **Hand Shape & Proportions**: Personality traits and abilities.
- **Thumb Structure**: Willpower, logic, and decision-making.

Note: If any of the features are not visible, try to mention what it means as well.
Organize your report in sections. For any challenging signs, respond with care and offer constructive advice where possible."""

    if language == "Hindi":
        user_prompt = "Please analyze this palm image and give me a detailed analysis report in Hindi Language."
    else:
        user_prompt = "Please analyze this palm image and give me a detailed analysis report in English Language."
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": user_prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}",
                            }
                        },
                    ],
                }
            ],
            max_tokens=1024,
        )
        return response.choices[0].message.content

        # chat_completion = client.chat.completions.create(
        #     messages=[
        #         {
        #             "role": "system",
        #             "content": system_prompt
        #         },
        #         {
        #             "role": "user",
        #             "content": [
        #                 {"type": "text", "text": user_prompt},
        #                 {
        #                     "type": "image_url",
        #                     "image_url": {
        #                         "url": f"data:image/jpeg;base64,{base64_image}",
        #                     },
        #                 },
        #             ],
        #         }
        #     ],
        #     model="meta-llama/llama-4-scout-17b-16e-instruct",
        #     max_completion_tokens=1024,
        #     temperature=0.5,
        # )
        # return chat_completion.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during API call: {str(e)}")

# Route for the home page
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# API endpoint for palm reading
@app.post("/api/palm-reading/")
async def palm_reading_api(
    file: UploadFile = File(...),
    language: str = Form("English")
):
    try:
        # Read and validate the image
        contents = await file.read()
        
        # Check if the uploaded file is an image
        try:
            image = Image.open(io.BytesIO(contents))
            # Convert the image if necessary
            if image.format not in ["JPEG", "PNG", "GIF", "BMP", "WEBP", "TIFF"]:
                # Convert to JPEG
                img_byte_arr = io.BytesIO()
                image.save(img_byte_arr, format="JPEG")
                contents = img_byte_arr.getvalue()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")
        
        # Get the palm reading (ensure it returns raw markdown)
        raw_reading = await get_palm_reading(contents, language)
        reading = markdown(raw_reading)
        return {"reading": reading}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing the image: {str(e)}")

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# if __name__ == "__main__":
#     uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

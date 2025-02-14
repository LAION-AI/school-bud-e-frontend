import tempfile
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from markitdown import MarkItDown
import subprocess
import os
import uvicorn
from generate_video import generate_video_logic
from request_manager import unique_hash, RequestLogger
from fastapi.responses import StreamingResponse, JSONResponse
import asyncio
import multiprocessing_logging

multiprocessing_logging.install_mp_handler()

app = FastAPI(debug=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/pdf_to_markdown/")
async def pdf_to_markdown(request: Request):
    try:
        # Read the raw PDF bytes from the request body
        pdf_bytes = await request.body()
        if not pdf_bytes:
            raise HTTPException(status_code=400, detail="No PDF data received.")

        # Create a temporary file to save the PDF
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            tmp.write(pdf_bytes)
            tmp_path = tmp.name  # Get the temporary file path

        # Convert PDF to Markdown
        md = MarkItDown()
        result = md.convert(tmp_path)

        return {"content": result.text_content}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate_video/")
async def generate_video(request: Request):
    request_log = None
    try:
        # Parse JSON body
        body = await request.json()
        if 'prompt' not in body:
            raise HTTPException(status_code=400, detail="Prompt is required")
        
        prompt = body['prompt']
        if not isinstance(prompt, str):
            raise HTTPException(status_code=400, detail="Prompt must be a string")

        # Execute the notebook
        hash = unique_hash()
        # Create segments directory for this hash if it doesn't exist
        current_dir = os.path.dirname(os.path.abspath(__file__))
        hash_dir = os.path.join(current_dir, "segments", hash)
        os.makedirs(hash_dir, exist_ok=True)
        # Initialize request logger
        request_log = RequestLogger(request)
        
        # Start background task for video generation
        asyncio.create_task(asyncio.to_thread(generate_video_logic, prompt, hash_dir, request_log))
        
        # Return a streaming response that yields JSON objects
        async def json_stream():
            async for item in request_log.create_stream():
                yield JSONResponse(content=item).body + b"\n"
                
        return StreamingResponse(json_stream(), media_type="application/json")

    except subprocess.CalledProcessError as e:
        print(e)
        if request_log:
            request_log.close_stream()
        raise HTTPException(status_code=500, detail=f"Failed to generate video: {str(e)}")
    except Exception as e:
        print(e)
        if request_log:
            request_log.close_stream()
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@app.get("/media/image")
def get_image():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    image_path = os.path.join(current_dir, "image.webp")
    if not os.path.exists(image_path):
        raise HTTPException(status_code=404, detail="Image not found")
    with open(image_path, "rb") as f:
        image_bytes = f.read()
    return Response(content=image_bytes, media_type="image/webp")


@app.get("/media/audio/{filename}")
def get_audio(filename: str):
    current_dir = os.path.dirname(os.path.abspath(__file__))
    audio_path = os.path.join(current_dir, "tts_segments", filename)
    if not os.path.exists(audio_path):
        raise HTTPException(status_code=404, detail="Audio file not found")
    with open(audio_path, "rb") as f:
        audio_bytes = f.read()
    return Response(content=audio_bytes, media_type="audio/mpeg")

@app.post("/test-stream/")
async def test_stream():
    # Initialize request logger
    request_log = RequestLogger(None)
    
    # Log first message
    request_log.log("file", "/segments/hash2/segment_11.mp3")
    
    # Wait 2 seconds
    await asyncio.sleep(2)
    
    # Log second message
    request_log.log("file", "/segments/hash2/segment_12.mp3")

    # Return a streaming response that yields JSON objects
    async def json_stream():
        async for item in request_log.create_stream():
            yield JSONResponse(content=item).body + b"\n"
            
    return StreamingResponse(json_stream(), media_type="application/json")

@app.get("/segments/{hash}/{filename}")
def get_segment(filename: str, hash: str):
    current_dir = os.path.dirname(os.path.abspath(__file__))
    segments_dir = os.path.join(current_dir, "segments", hash)
    file_path = os.path.join(segments_dir, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    # Determine media type based on file extension
    if filename.endswith('.webp'):
        media_type = "image/webp"
    else:
        media_type = "audio/mpeg"
        
    with open(file_path, "rb") as f:
        file_bytes = f.read()
    return Response(content=file_bytes, media_type=media_type)

if __name__ == "__main__":
    # The command 'fastapi run dev' is not a valid command
    # To run a FastAPI app, you need to use uvicorn directly:
    # Command: uvicorn main:app --reload --host 0.0.0.0 --port 8083
    uvicorn.run(app, host="0.0.0.0", port=8083)

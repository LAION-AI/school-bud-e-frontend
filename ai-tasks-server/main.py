import tempfile
from fastapi import FastAPI, HTTPException, UploadFile, Request
from fastapi.middleware.cors import CORSMiddleware
from markitdown import MarkItDown
from pydantic import BaseModel
from tempfile import NamedTemporaryFile

app = FastAPI()

# Configure CORS
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

if __name__ == "__main__":
    print("Running")

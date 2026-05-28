import os
import io
import math
import json
import base64
import zipfile

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import qrcode

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.post("/generate")
async def generate_qr(
    file: UploadFile = File(...),
    chunk_size: int = Form(...),
    speed: float = Form(...)
):

    file_data = await file.read()

    file_name = file.filename
    file_size = len(file_data)

    total_chunks = math.ceil(file_size / chunk_size)

    qr_packets = []

    for i in range(total_chunks):

        start = i * chunk_size
        end = start + chunk_size

        chunk = file_data[start:end]

        encoded_chunk = base64.b64encode(chunk).decode()

        packet = {
            "filename": file_name,
            "seq": i,
            "total": total_chunks,
            "size": file_size,
            "data": encoded_chunk
        }

        json_text = json.dumps(packet)

        qr = qrcode.QRCode(
            version=5,
            box_size=10,
            border=2
        )

        qr.add_data(json_text)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")

        buffered = io.BytesIO()
        img.save(buffered, format="PNG")

        img_base64 = base64.b64encode(buffered.getvalue()).decode()

        qr_packets.append(img_base64)

    return JSONResponse({
        "success": True,
        "file_name": file_name,
        "file_size": file_size,
        "total_chunks": total_chunks,
        "speed": speed,
        "qrs": qr_packets
    })
from fastapi import FastAPI, Request, Form, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import random
from typing import List, Dict
import os
import asyncio
from feature.command import run_command
from feature.command import get_all_firewall_types, get_commands  # 새로 추가한 import

app = FastAPI()

# CORS 설정 추가
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "http://localhost:8000"],  # 필요한 출처만 명시
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 현재 디렉토리 경로 가져오기
current_dir = os.path.dirname(os.path.realpath(__file__))

# static 파일과 템플릿 디렉토리 설정
app.mount("/static", StaticFiles(directory=os.path.join(current_dir, "static")), name="static")
templates = Jinja2Templates(directory=os.path.join(current_dir, "templates"))

# 세마포어 생성 (최대 3개의 동시 작업 허용)
semaphore = asyncio.Semaphore(3)

@app.get("/")
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/process_data")
async def process_data(
    ip: str = Form(...),
    id: str = Form(...),
    pw: str = Form(...),
    firewall: str = Form(...),
    command: str = Form(...)
) -> Dict:
    async with semaphore:
        result = await run_command(ip, id, pw, firewall, command)
        print(f"Processing data for IP: {ip}, Firewall: {firewall}, Command: {command}")
        print(f"Result: {result}")
        
        if result["status"] == "error":
            raise HTTPException(status_code=400, detail=result["message"])
        
        return result
    
@app.get("/get_firewall_types")
async def get_firewall_types():
    return {"types": get_all_firewall_types()}

@app.get("/get_commands/{firewall_type}")
async def get_firewall_commands(firewall_type: str):
    commands = get_commands(firewall_type)
    return {"commands": commands}

@app.get("/semaphore_count")
async def get_semaphore_count():
    return {"available": semaphore._value}

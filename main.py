from fastapi import FastAPI, Request, Form, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import random
from typing import List, Dict
import os
import asyncio

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
) -> List[Dict]:
    async with semaphore:
        # 데이터 생성
        data = []
        actions = ['Allow', 'Deny']
        protocols = ['TCP', 'UDP', 'ICMP']

        for i in range(1, 51):
            data.append({
                "rule": i,
                "source": f"192.168.{random.randint(0, 255)}.{random.randint(0, 255)}",
                "destination": f"10.0.{random.randint(0, 255)}.{random.randint(0, 255)}",
                "port": random.randint(0, 65535),
                "protocol": random.choice(protocols),
                "action": random.choice(actions)
            })

        # 인위적인 지연 추가 (테스트 목적)
        await asyncio.sleep(2)

        print(f"Processing data for IP: {ip}, Firewall: {firewall}, Command: {command}")
        return data

@app.get("/semaphore_count")
async def get_semaphore_count():
    return {"available": semaphore._value}

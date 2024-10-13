from fastapi import APIRouter, HTTPException
from models import Task
from typing import List
import pandas as pd

router = APIRouter()

tasks = []

@router.post("/tasks/", response_model=Task)
async def create_task(task: Task):
    task.id = len(tasks) + 1
    task.status = "pending"
    tasks.append(task)
    return task

@router.get("/tasks/", response_model=List[Task])
async def read_tasks():
    return tasks

@router.get("/tasks/{task_id}", response_model=Task)
async def read_task(task_id: int):
    task = next((task for task in tasks if task.id == task_id), None)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.delete("/tasks/{task_id}")
async def delete_task(task_id: int):
    global tasks
    tasks = [task for task in tasks if task.id != task_id]
    return {"message": "Task deleted"}

@router.delete("/tasks/")
async def clear_tasks():
    global tasks
    tasks = []
    return {"message": "All tasks cleared"}

@router.post("/tasks/{task_id}/run")
async def run_task(task_id: int):
    task = next((task for task in tasks if task.id == task_id), None)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # 여기에 실제 작업 실행 로직을 구현하세요
    # 예시: 더미 데이터 생성
    df = pd.DataFrame({
        "Column1": range(10),
        "Column2": [f"Value{i}" for i in range(10)]
    })
    task.result = df.to_dict()
    task.status = "completed"
    return {"message": "Task completed"}

@router.get("/tasks/{task_id}/download")
async def download_task_result(task_id: int):
    task = next((task for task in tasks if task.id == task_id), None)
    if task is None or task.result is None:
        raise HTTPException(status_code=404, detail="Task or result not found")
    
    df = pd.DataFrame(task.result)
    # 엑셀 파일 생성 및 반환 로직 구현
    # (실제 구현에서는 파일을 생성하고 다운로드 가능한 응답을 반환해야 합니다)
    return {"message": "Excel file generated"}
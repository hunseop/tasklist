from pydantic import BaseModel

class Task(BaseModel):
    id: int
    ip: str
    user_id: str
    password: str
    command: str
    status: str
    result: dict = None
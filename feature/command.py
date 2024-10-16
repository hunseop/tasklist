import asyncio
import random
from typing import List, Dict
import pandas as pd

# 각 명령어에 대한 함수 정의
async def show_system_info():
    data = {"System Info": ["Version 1.0"], "Uptime": ["10 days"], "CPU": ["25%"], "Memory": ["60%"]}
    return pd.DataFrame(data)

async def show_interface_all():
    interfaces = ["eth0", "eth1", "wlan0"]
    data = {
        "Interface": interfaces,
        "Status": [random.choice(["Up", "Down"]) for _ in interfaces],
        "IP": [f"192.168.1.{random.randint(1, 254)}" for _ in interfaces]
    }
    return pd.DataFrame(data)

async def show_routing_route():
    data = {
        "Destination": [f"10.0.{i}.0/24" for i in range(5)],
        "Next Hop": [f"192.168.1.{random.randint(1, 254)}" for _ in range(5)],
        "Interface": [f"eth{random.randint(0, 1)}" for _ in range(5)]
    }
    return pd.DataFrame(data)

async def show_config_running():
    data = {"Config Line": [f"config line {i}" for i in range(1, 11)]}
    return pd.DataFrame(data)

async def show_version():
    data = {"Version": ["2.5.1"], "Build": ["12345"], "Release Date": ["2024-03-15"]}
    return pd.DataFrame(data)

async def show_ip_route():
    data = {
        "Protocol": [random.choice(["OSPF", "BGP", "Static"]) for _ in range(5)],
        "Network": [f"172.16.{i}.0/24" for i in range(5)],
        "Next Hop": [f"10.0.0.{random.randint(1, 254)}" for _ in range(5)]
    }
    return pd.DataFrame(data)

FIREWALL_COMMANDS = {
    "Paloalto": {
        "show system info": show_system_info,
        "show interface all": show_interface_all,
        "show routing route": show_routing_route,
        "show config running": show_config_running,
    },
    "MF2": {
        "show version": show_version,
        "show interface": show_interface_all,
        "show ip route": show_ip_route,
        "show running-config": show_config_running,
    },
    "NGF": {
        "show system": show_system_info,
        "show interface": show_interface_all,
        "show ip route": show_ip_route,
        "show configuration": show_config_running,
    }
}

def get_commands(firewall_type):
    return list(FIREWALL_COMMANDS.get(firewall_type, {}).keys())

def get_all_firewall_types():
    return list(FIREWALL_COMMANDS.keys())

async def run_command(host: str, username: str, password: str, firewall_type: str, command: str) -> Dict:
    print(f"Connecting to {host} ({firewall_type}) with username: {username}")
    print(f"Executing command: {command}")
    
    await asyncio.sleep(2)  # 실행 시간 시뮬레이션
    
    if firewall_type in FIREWALL_COMMANDS and command in FIREWALL_COMMANDS[firewall_type]:
        command_func = FIREWALL_COMMANDS[firewall_type][command]
        try:
            df = await command_func()
            return {
                "status": "success",
                "data": df.to_dict(orient='records'),
                "columns": df.columns.tolist(),
                "message": None
            }
        except Exception as e:
            return {
                "status": "error",
                "data": None,
                "columns": None,
                "message": str(e)
            }
    else:
        return {
            "status": "error",
            "data": None,
            "columns": None,
            "message": "Invalid firewall type or command"
        }
            
# 테스트를 위한 함수
async def test_run_command():
    result = await run_command("192.168.1.1", "admin", "password", "Paloalto", "show interface all")
    print("Test result:", result)

# 테스트 실행
if __name__ == "__main__":
    asyncio.run(test_run_command())

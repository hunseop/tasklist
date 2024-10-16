import asyncio
import random
from typing import List, Dict

# 각 명령어에 대한 함수 정의
async def show_system_info():
    return [{"System Info": "Version 1.0", "Uptime": "10 days", "CPU": "25%", "Memory": "60%"}]

async def show_interface_all():
    interfaces = ["eth0", "eth1", "wlan0"]
    return [{"Interface": interface, "Status": random.choice(["Up", "Down"]), "IP": f"192.168.1.{random.randint(1, 254)}"} for interface in interfaces]

async def show_routing_route():
    return [{"Destination": f"10.0.{i}.0/24", "Next Hop": f"192.168.1.{random.randint(1, 254)}", "Interface": f"eth{random.randint(0, 1)}"} for i in range(5)]

async def show_config_running():
    return [{"Config Line": f"config line {i}"} for i in range(1, 11)]

async def show_version():
    return [{"Version": "2.5.1", "Build": "12345", "Release Date": "2024-03-15"}]

async def show_ip_route():
    return [{"Protocol": random.choice(["OSPF", "BGP", "Static"]), "Network": f"172.16.{i}.0/24", "Next Hop": f"10.0.0.{random.randint(1, 254)}"} for i in range(5)]

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

async def run_command(host: str, username: str, password: str, firewall_type: str, command: str) -> List[Dict]:
    print(f"Connecting to {host} ({firewall_type}) with username: {username}")
    print(f"Executing command: {command}")
    
    # 실행 시간을 시뮬레이션하기 위한 지연
    await asyncio.sleep(2)
    
    # 해당 방화벽 타입과 명령어에 맞는 함수 실행
    if firewall_type in FIREWALL_COMMANDS and command in FIREWALL_COMMANDS[firewall_type]:
        command_func = FIREWALL_COMMANDS[firewall_type][command]
        result = await command_func()
        print(f"Command result: {result}")  # 결과 출력
        return result
    else:
        error_message = {"Error": "Invalid firewall type or command"}
        print(f"Error: {error_message}")  # 에러 메시지 출력
        return [error_message]

# 테스트를 위한 함수
async def test_run_command():
    result = await run_command("192.168.1.1", "admin", "password", "Paloalto", "show system info")
    print("Test result:", result)

# 테스트 실행
if __name__ == "__main__":
    asyncio.run(test_run_command())

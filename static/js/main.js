import { loadFirewallTypes, loadCommands } from './firewallManager.js';
import { createTaskItem, executeTask } from './taskManager.js';
import { isValidIP } from './utils.js';

document.addEventListener('DOMContentLoaded', function() {
    const taskList = document.getElementById('task-list');
    const runButton = document.getElementById('run-button');
    const firewallSelect = document.getElementById('firewall-select');
    const commandSelect = document.getElementById('command-select');
    let runningTasks = 0;
    const maxTasks = 3;
    const taskQueue = [];

    // 방화벽 타입 로드
    loadFirewallTypes(firewallSelect);

    // 방화벽 타입 선택 시 명령어 로드
    firewallSelect.addEventListener('change', function() {
        loadCommands(this.value, commandSelect);
    });

    function handleTaskCompletion() {
        runningTasks--;
        if (taskQueue.length > 0) {
            const nextTask = taskQueue.shift();
            runningTasks++;
            nextTask();
        }
    }

    runButton.addEventListener('click', function() {
        const ipInput = document.getElementById('ip-input').value;
        const id = document.getElementById('id-input').value;
        const pw = document.getElementById('pw-input').value;
        const firewall = firewallSelect.value;
        const command = commandSelect.value;

        if (!ipInput || !id || !pw || firewall === 'Select Firewall Type' || command === 'Select Command') {
            alert('모든 필드를 입력해주세요.');
            return;
        }

        const ipList = ipInput.split(',').map(ip => ip.trim());
        const validIPs = ipList.filter(ip => isValidIP(ip));

        if (validIPs.length === 0) {
            alert('유효한 IP 주소를 입력해주세요.');
            return;
        }

        validIPs.forEach(ip => {
            const taskItem = createTaskItem(ip, id, pw, firewall, command);
            taskList.insertBefore(taskItem, taskList.firstChild);
            if (runningTasks < maxTasks) {
                runningTasks++;
                executeTask(taskItem, ip, id, pw, firewall, command, handleTaskCompletion);
            } else {
                taskQueue.push(() => executeTask(taskItem, ip, id, pw, firewall, command, handleTaskCompletion));
            }
        });

        // 입력 필드 초기화
        document.getElementById('ip-input').value = '';
        document.getElementById('id-input').value = '';
        document.getElementById('pw-input').value = '';
        firewallSelect.selectedIndex = 0;
        commandSelect.selectedIndex = 0;
    });
});

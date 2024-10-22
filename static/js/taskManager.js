import { showResult, downloadExcel } from './resultViewer.js';

export function createTaskItem(ip, id, pw, firewall, command) {
    const taskItem = document.createElement('div');
    taskItem.className = 'task-item p-2 mb-2';
    taskItem.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <span class="task-name">${ip} - ${firewall} - ${command}</span>
            <div class="d-flex align-items-center">
                <div class="spinner me-2" style="display: none;"></div>
                <button class="btn btn-sm btn-outline-primary view-btn me-1" style="display: none;">View</button>
                <button class="btn btn-sm btn-outline-success download-btn me-1" style="display: none;">Download</button>
                <button class="btn btn-sm btn-outline-danger delete-btn">Delete</button>
            </div>
        </div>
        <div class="task-result mt-2" style="display: none;"></div>
    `;

    taskItem.querySelector('.delete-btn').addEventListener('click', function() {
        taskItem.remove();
    });

    return taskItem;
}

export function executeTask(taskItem, ip, id, pw, firewall, command, callback) {
    const spinner = taskItem.querySelector('.spinner');
    const viewBtn = taskItem.querySelector('.view-btn');
    const downloadBtn = taskItem.querySelector('.download-btn');
    const resultDiv = taskItem.querySelector('.task-result');

    spinner.style.display = 'inline-block';
    viewBtn.style.display = 'none';
    downloadBtn.style.display = 'none';

    const formData = new FormData();
    formData.append('ip', ip);
    formData.append('id', id);
    formData.append('pw', pw);
    formData.append('firewall', firewall);
    formData.append('command', command);

    fetch('/process_data', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        taskItem.dataset.result = JSON.stringify(data);

        spinner.style.display = 'none';
        viewBtn.style.display = 'inline-block';
        downloadBtn.style.display = 'inline-block';

        viewBtn.onclick = () => {
            resultDiv.style.display = resultDiv.style.display === 'none' ? 'block' : 'none';
            if (resultDiv.style.display === 'block') {
                showResult(resultDiv, JSON.parse(taskItem.dataset.result));
            }
        };

        downloadBtn.onclick = () => {
            downloadExcel(JSON.parse(taskItem.dataset.result).data, ip, firewall, command);
        };
    })
    .catch(error => {
        console.error('Error:', error);
        spinner.style.display = 'none';
        resultDiv.innerHTML = '<p class="text-danger">Failed to load data.</p>';
    })
    .finally(() => {
        if (callback) callback();
    });
}
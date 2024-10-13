document.addEventListener('DOMContentLoaded', function() {
    const taskList = document.getElementById('task-list');
    const runButton = document.getElementById('run-button');

    runButton.addEventListener('click', function() {
        const ipInput = document.getElementById('ip-input').value;
        const id = document.getElementById('id-input').value;
        const pw = document.getElementById('pw-input').value;
        const firewall = document.getElementById('firewall-select').value;
        const command = document.getElementById('command-select').value;

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
            executeTask(taskItem, ip, id, pw, firewall, command);
        });

        // 입력 필드 초기화
        document.getElementById('ip-input').value = '';
        document.getElementById('id-input').value = '';
        document.getElementById('pw-input').value = '';
        document.getElementById('firewall-select').selectedIndex = 0;
        document.getElementById('command-select').selectedIndex = 0;
    });

    function isValidIP(ip) {
        const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipRegex.test(ip);
    }

    function createTaskItem(ip, id, pw, firewall, command) {
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

    function executeTask(taskItem, ip, id, pw, firewall, command) {
        const spinner = taskItem.querySelector('.spinner');
        const viewBtn = taskItem.querySelector('.view-btn');
        const downloadBtn = taskItem.querySelector('.download-btn');
        const resultDiv = taskItem.querySelector('.task-result');

        // 스피너 표시
        spinner.style.display = 'inline-block';
        viewBtn.style.display = 'none';
        downloadBtn.style.display = 'none';

        // FormData 생성
        const formData = new FormData();
        formData.append('ip', ip);
        formData.append('id', id);
        formData.append('pw', pw);
        formData.append('firewall', firewall);
        formData.append('command', command);

        // API 호출
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
            // 데이터 처리 완료
            taskItem.dataset.result = JSON.stringify(data);

            // UI 업데이트
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
                downloadExcel(JSON.parse(taskItem.dataset.result), ip, firewall, command);
            };
        })
        .catch(error => {
            console.error('Error:', error);
            spinner.style.display = 'none';
            resultDiv.innerHTML = '<p class="text-danger">데이터를 불러오는 데 실패했습니다.</p>';
        });
    }

    function showResult(resultDiv, data) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            resultDiv.innerHTML = '<p class="text-warning">표시할 데이터가 없습니다.</p>';
            return;
        }

        // 스피너 추가 (중앙 정렬)
        resultDiv.innerHTML = '<div class="spinner-container"><div class="spinner mb-3"></div></div>';

        let tableHtml = `
            <table id="resultTable" class="table table-dark table-striped table-hover">
                <thead>
                    <tr>
                        ${Object.keys(data[0]).map(key => `<th>${key}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
        `;

        data.forEach(row => {
            tableHtml += '<tr>';
            Object.values(row).forEach(value => {
                tableHtml += `<td>${value}</td>`;
            });
            tableHtml += '</tr>';
        });

        tableHtml += '</tbody></table>';
        
        // 테이블 HTML 추가 (스피너 뒤에)
        resultDiv.innerHTML += tableHtml;

        // DataTables 초기화
        if ($.fn.DataTable.isDataTable('#resultTable')) {
            $('#resultTable').DataTable().destroy();
        }
        $('#resultTable').DataTable({
            pageLength: 30,
            lengthMenu: [[30, 50, 100, -1], [30, 50, 100, "All"]],
            responsive: true,
            ordering: false,
            scrollX: true,
            autoWidth: false,
            columnDefs: [
                { 
                    targets: '_all',
                    className: 'text-nowrap cell-scrollable',
                    width: '300px'
                }
            ],
            drawCallback: function() {
                // DataTables 초기화 완료 후 스피너 제거
                resultDiv.querySelector('.spinner-container').style.display = 'none';
            }
        });
    }

    function downloadExcel(data, ip, firewall, command) {
        // 현재 날짜를 YYYYMMDD 형식으로 가져오기
        const today = new Date();
        const date = today.getFullYear().toString() +
                    (today.getMonth() + 1).toString().padStart(2, '0') +
                    today.getDate().toString().padStart(2, '0');

        // 파일 이름 생성
        const fileName = `${date}_${ip}_${command}.xlsx`;

        // 워크북 생성
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);

        // 워크시트를 워크북에 추가
        XLSX.utils.book_append_sheet(wb, ws, "Results");
        
        // 엑셀 파일을 Blob으로 생성
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });

        // FileSaver.js를 사용하여 파일 저장 대화상자 표시
        saveAs(blob, fileName);
    }
});

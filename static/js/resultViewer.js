export function showResult(resultDiv, data) {
    if (!data || !data.data || data.data.length === 0) {
        resultDiv.innerHTML = '<p class="text-warning">There is no data to display.</p>';
        return;
    }

    console.log("Data received:", data);

    const tableId = 'resultTable_' + Date.now();

    resultDiv.innerHTML = '<div class="spinner-container"><div class="spinner mb-3"></div></div>';

    let tableHtml = `
        <table id="${tableId}" class="table table-dark table-striped table-hover">
            <thead>
                <tr>
                    ${data.columns.map(column => `<th>${column}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
    `;

    resultDiv.innerHTML += tableHtml;

    try {
        if ($.fn.DataTable.isDataTable(`#${tableId}`)) {
            $(`#${tableId}`).DataTable().destroy();
        }
        $(`#${tableId}`).DataTable({
            data: data.data,
            columns: data.columns.map(column => ({ title: column, data: column })),
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
                resultDiv.querySelector('.spinner-container').style.display = 'none';
            }
        });
    } catch (error) {
        console.error("Error initializing DataTable:", error);
        resultDiv.innerHTML += '<p class="text-danger">Error initializing table. Please check the console for details.</p>';
    }
}

export function downloadExcel(data, ip, firewall, command) {
    // XLSX와 FileSaver 라이브러리가 전역 범위에 있는지 확인
    if (typeof XLSX === 'undefined' || typeof saveAs === 'undefined') {
        console.error('XLSX or FileSaver library is not loaded');
        return;
    }

    const today = new Date();
    const date = today.getFullYear().toString() +
                (today.getMonth() + 1).toString().padStart(2, '0') +
                today.getDate().toString().padStart(2, '0');

    const fileName = `${date}_${ip}_${command}.xlsx`;

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    XLSX.utils.book_append_sheet(wb, ws, "Results");
    
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });

    saveAs(blob, fileName);
}

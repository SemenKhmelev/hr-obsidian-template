const data = require(app.vault.adapter.basePath + "/_scripts/data.js");

// Получаем текущего сотрудника
const empFile = input.dv.current().file.link;
const records = data.GetRawMetricsData(input.dv, empFile);

const metrics = data.metrics;

// Получаем последние значения по каждому метрику
function findLast(records, key) {
    for (const rec of records) {
        if (rec.props[key] !== undefined && rec.props[key] !== "") {
            return parseFloat(rec.props[key]) || 0;
        }
    }
    return 0;
}
const values = metrics.map(metric => findLast(records, metric));

// Подготавливаем canvas для Chart.js
const canvasId = "radar-chart-" + Math.floor(Math.random()*100000);

input.dv.el("canvas", "", {attr: {id: canvasId, width: 400, height: 400}});

// Подключаем Chart.js если не подключен
if (!window.Chart) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = drawRadar;
    document.head.appendChild(script);
} else {
    drawRadar();
}

function drawRadar() {
    const ctx = document.getElementById(canvasId).getContext('2d');
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: metrics,
            datasets: [{
                label: 'Показатели',
                data: values,
                fill: true,
                borderColor: 'rgba(55,99,132,1)',
                backgroundColor: 'rgba(54,162,235,0.2)',
                pointBackgroundColor: 'rgba(54,162,235,1)',
                pointBorderColor: '#fff',
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {display: false},
                title: {display: false},
            },
            scales: {
                r: {
                    min: 0,
                    max: 5,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

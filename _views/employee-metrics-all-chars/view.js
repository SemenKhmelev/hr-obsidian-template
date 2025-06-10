const data = require(app.vault.adapter.basePath + "/_scripts/data.js");
const employeePages = input.dv.pages('#employee and "Сотрудники"');
const employees = employeePages
    .sort(b => b.file.name)
    .map(emp => ({
        name: emp.file.name,
        records: data.GetRawMetricsData(input.dv, emp.file.link)
    }));

const metrics = data.metrics;

function findLast(records, key) {
    for (const rec of records) {
        if (rec.props[key] !== undefined && rec.props[key] !== "") {
            return parseFloat(rec.props[key]) || 0;
        }
    }
    return 0;
}

// Подготовим массив datasets для Chart.js
const datasets = employees.map((e, idx) => ({
    label: e.name,
    data: metrics.map(metric => findLast(e.records, metric)),
    fill: false,
    borderColor: `hsl(${(idx * 360 / employees.length) % 360}, 70%, 50%)`,
    backgroundColor: `hsla(${(idx * 360 / employees.length) % 360}, 70%, 50%, 0.15)`,
    pointBackgroundColor: `hsl(${(idx * 360 / employees.length) % 360}, 70%, 50%)`,
    pointBorderColor: '#fff',
    tension: 0.2
}));

const canvasId = "radar-overview-" + Math.floor(Math.random()*100000);
input.dv.el("canvas", "", {attr: {id: canvasId, width: 400, height: 400}});

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
            datasets: datasets
        },
        options: {
            responsive: true,
            plugins: {
                legend: {display: true, position: 'bottom'},
                title: {display: false},
            },
            scales: {
                r: {
                    min: 0,
                    max: 3,
                    ticks: { stepSize: 0.5 }
                }
            }
        }
    });
}

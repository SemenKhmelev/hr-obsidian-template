console.log(
    "\n#################################################\n" +
    "         EMPLOYEE METRICS AGGREGATION            " +
    "\n#################################################\n"
);

const data = require(app.vault.adapter.basePath + "/_scripts/data.js");
const employeeFile = input.dv.current().file.link;
const records = data.GetRawMetricsData(input.dv, employeeFile);

const areas = data.areas;
const metrics = data.metrics;
const metrics_ext = data.metrics_ext;

// Для таблицы: оборачиваем значение в ссылку на файл
function fileLinkCell(value, file) {
    if (!value) return "";
    if (!file) return value;
    return input.dv.span(`[[${file.path}|${value}]]`);
}

// ========================
// 1. Комментарий
// ========================

metrics_ext.forEach(metric => {
        const obj = data.findLastValueAndFile(records, metric);
        if (obj) {
             input.dv.paragraph(`**${metric}**: ${obj.value}`)}
});

// ========================
// 2. Таблица по областям
// ========================

input.dv.header(2, `Таблица производительности`);

input.dv.table(
    ["[[Памятка|Область]]", "Простые", "Средние", "Сложные", "Комментарий"],
    areas.map(area => {
        const simple   = data.findLastValueAndFile(records, `${area} - простые`);
        const middle   = data.findLastValueAndFile(records, `${area} - средние`);
        const complex  = data.findLastValueAndFile(records, `${area} - сложные`);
        const comment  = data.findLastValueAndFile(records, `${area} комментарий`);
        return [
            area,
            fileLinkCell(simple?.value, simple?.file),
            fileLinkCell(middle?.value, middle?.file),
            fileLinkCell(complex?.value, complex?.file),
            fileLinkCell(comment?.value, comment?.file)
        ];
    })
);

// ========================
// 3. Таблица по метрикам
// ========================

input.dv.header(2, `Таблица навыков`);

input.dv.table(
    ["[[Памятка|Показатель]]", "Значение"],
    metrics.map(metric => {
        const obj = data.findLastValueAndFile(records, metric);
        return [
            metric,
            fileLinkCell(obj?.value, obj?.file)
        ];
    })
);


const data = require(app.vault.adapter.basePath + "/_scripts/data.js");

// Стаж сотрудника сразу вверху страницы
const hireDate = input.dv.current()["Принят"];
const tenure = data.calcTenure(hireDate);
if (tenure) {
    input.dv.paragraph(`**Стаж:** ${tenure}`);
}

input.dv.header(1, "Зарплата, должность и связанные запросы");
await input.dv.view("views/employee-salary-report", {"dv": input.dv});

await input.dv.header(1, "Метрики");
await dv.view("views/employee-metrics-report", {"dv": input.dv});

await dv.view("views/employee-metrics-chart", {"dv": input.dv});

await  input.dv.header(1, "Лог всех упоминаний сотрудника");
await dv.view("views/backlink-journal", {"dv": input.dv});


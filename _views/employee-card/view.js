input.dv.header(1, "Зарплата, должность и связанные запросы")
await input.dv.view("views/employee-salary-report", {"dv": input.dv});

await input.dv.header(1, "Метрики");
await dv.view("views/employee-metrics-report", {"dv": input.dv});

await dv.view("views/employee-metrics-chart", {"dv": input.dv});

await  input.dv.header(1, "Лог всех упоминаний сотрудника");
await dv.view("views/backlink-journal", {"dv": input.dv});


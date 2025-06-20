console.log(
    "\n#################################################\n" +
    "   GLOBAL METRICS & AREAS SUMMARY (NO NESTED)    " +
    "\n#################################################\n"
);

const data = require(app.vault.adapter.basePath + "/_scripts/data.js");
const container = input.dv.container;

const employeePages = input.dv.pages('#employee and "Сотрудники"');
const employees = employeePages
    .sort(b => b.file.name)
    .map(emp => ({
        name: emp.file.name,
        link: emp.file.link,
        records: data.GetRawMetricsData(input.dv, emp.file.link)
    }));

const areas = data.areas;
const metrics = data.metrics;

// Получение последних значений по ключу
function findLast(records, key) {
    for (const rec of records) {
        if (rec.props[key] !== undefined && rec.props[key] !== "") {
            return rec.props[key];
        }
    }
    return "n";
}


// Выровнять значение до N символов (по левому краю)
function pad(val, len = 5) {
    val = val === undefined || val === "" ? "n" : String(val);
    return val.padEnd(len, " ");
}

// ====================
// СВОДНАЯ ТАБЛИЦА
// ====================

const headers = ["[[Памятка|Область / Показатель]]"].concat(
    employees.map(e => `[[${e.name}]]`).array()
);

// 1. Первая группа строк — по областям
const areaRows = areas.map(area => {
    const row = [area];
    for (const e of employees) {
        var simple  = data.colorize(pad(findLast(e.records, `${area} - простые`)));
        var middle  = data.colorize(pad(findLast(e.records, `${area} - средние`)));
        var complex = data.colorize(pad(findLast(e.records, `${area} - сложные`)));
        

        row.push(`${simple} | ${middle} | ${complex}`);
    }
    return row;
});

// 2. Вторая группа строк — показатели (метрики)
const metricRows = metrics.map(metric => {
    const row = [metric];
    for (const e of employees) {
        row.push(data.colorizeGradient(findLast(e.records, metric)));
    }
    return row;
});

// // 3. Общий комментарий
// const commentRow = ["**Общий комментарий**"];
// for (const e of employees) {
//     commentRow.push(findLast(e.records, "Общий комментарий"));
// }

// Собираем
const tableRows = [
    ...areaRows,
    ...metricRows,
    //commentRow
];

// Рендер таблицы только один раз!
input.dv.header(2, "Сводная таблица по областям и показателям сотрудников");

input.dv.paragraph("Значения разбиты на группы задач 'простые|средние|сложные'")

await input.dv.table(headers, tableRows);


const utils = require(app.vault.adapter.basePath + "/_scripts/markdown-utils.js");

const getMarkdown = () => {
    const h = headers.map(utils.plainify);
    const rows = tableRows.map(r => r.map(utils.plainify));
    return dv.markdownTable(h, rows);
};

input.dv.el(
    "div",
    utils.createMarkdownControls({
        getMarkdown,
        fileName: "global-metrics.md"
    })
);

const tables  = container.querySelectorAll(".table-view-table");
 const lastTable = tables[tables.length - 1];
  if (lastTable) {
    lastTable.classList.add("gs-global-metrics-table");
  } 

// 3. Памятка
  
const path = "Памятка";
await dv.header(3, `[[${path}]]:`);

const page = input.dv.page(path)
const content = await input.dv.io.load(page.file.path);
await input.dv.paragraph(content);


// 3. Коммеентрии по каждому сотруднику

input.dv.header(2, "Актуальные комментарии по сотрудникам:");
for (const e of employees) {

    input.dv.header(3, `[[${e.name}]]`); 
    input.dv.paragraph(findLast(e.records, "Общий комментарий"));     
}



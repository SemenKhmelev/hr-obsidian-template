console.log(
    "\n#################################################\n" +
    "         GLOBAL SALARY SUMMARY REPORT            " +
    "\n#################################################\n"
);

const data = require(app.vault.adapter.basePath + "/_scripts/data.js");

const employeePages = input.dv.pages('#employee and "Сотрудники"');
const allResults = [];

for (const emp of employeePages) {
    const empLink = emp.file.link;
    const records = data.GetRawMetricsData(input.dv, empLink);
    const tenure = data.calcTenure(emp["Принят"]);

    // Ищем последнее значение для ЗП и запроса
    const salaryObj = data.findLastValueAndFile(records, "Зарплата");
    const increaseObj = data.findLastValueAndFile(records, "Запрос на повышение");
    const increaseCommentObj = data.findLastValueAndFile(records, "Запрос на повышение - комментарий");
    const salaryCommentObj = data.findLastValueAndFile(records, "Зарплата - комментарий");

    // Формируем строку
    allResults.push({
        name: emp.file.name,
        link: empLink,
        tenure,
        salary: salaryObj ? salaryObj.value : "",
        salaryFile: salaryObj ? salaryObj.file : null,
        increase: increaseObj ? increaseObj.value : "",
        increaseFile: increaseObj ? increaseObj.file : null,
        increaseComment: increaseCommentObj ? increaseCommentObj.value : (salaryCommentObj ? salaryCommentObj.value : ""),
    });
}

// Функции для вычисления суммы и медианы (только числовые значения)
function sum(arr) {
    return arr.reduce((acc, v) => acc + (parseFloat(v) || 0), 0);
}
function median(arr) {
    const nums = arr.map(v => parseFloat(v)).filter(x => !isNaN(x)).sort((a, b) => a - b);
    if (!nums.length) return "";
    const mid = Math.floor(nums.length / 2);
    return nums.length % 2 ? nums[mid] : ((nums[mid - 1] + nums[mid]) / 2).toFixed(2);
}

// Ссылки на файлы для значений ЗП/запроса
function fileLinkCell(value, file) {
    if (!value) return "";
    if (!file) return value;
    return input.dv.span(`[[${file.path}|${value}]]`);
}

// Собираем финальную таблицу
const rows = allResults.sort((a, b) => !b.name.localeCompare(a.name)).map(res => [
    input.dv.span(`[[${res.name}]]`),
    fileLinkCell(res.salary, res.salaryFile),
    fileLinkCell(res.increase, res.increaseFile),
    res.tenure || "",
    res.increaseComment || "",
]);

// Добавляем строки СУММА и МЕДИАННА
const salaries = allResults.map(r => r.salary).filter(x => x !== "");
// Для каждой строки используем: если нет increase — подставляем salary
const increasesOrSalaries = allResults.map(r => (r.increase && r.increase !== "") ? r.increase : r.salary).filter(x => x !== "");

// Строки сумм и медианы теперь используют increasesOrSalaries для колонки "Запрос на ЗП"
rows.push(
    [
        "**СУММА**",
        "",
        salaries.length ? sum(salaries) : "",
        increasesOrSalaries.length ? sum(increasesOrSalaries) : "",
        "",
    ],
    [
        "**МЕДИАННА**",
        "",
        salaries.length ? median(salaries) : "",
        increasesOrSalaries.length ? median(increasesOrSalaries) : "",
        "",
    ]
);

// Рендерим таблицу
input.dv.header(2, "Сводная таблица зарплат и запросов сотрудников");

input.dv.table(
    ["Cотрудник", "Текущая ЗП", "Запрос на ЗП", "Стаж", "Комментарий к запросу"],
    rows
);

const utils = require(app.vault.adapter.basePath + "/_scripts/markdown-utils.js");

const getMarkdown = () => {
    const h = [
        "Cотрудник",
        "Текущая ЗП",
        "Запрос на ЗП",
        "Стаж",
        "Комментарий к запросу",
    ];
    const headers = h.map(utils.plainify);
    const rowsPlain = rows.map(r => r.map(utils.plainify));
    return dv.markdownTable(headers, rowsPlain);
};

input.dv.el(
    "div",
    utils.createMarkdownControls({
        getMarkdown,
        fileName: "salary-summary.md",
    })
);

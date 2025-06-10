
console.log("Загрузка _scripts/data.js")

function GetRawMetricsData(dvarg, employeeLink) {

    console.log("Запрос GetRawMetricsData из файла:" + dvarg.current().file)

    employeePage = dvarg.page(employeeLink.path);

    // Находим все страницы с тегом "hr-action", которые содержат ListItem, ссылающийся на нужное имя
    const pages = employeePage.file.inlinks
         .where(link => {
             // Проверяем, есть ли list с name == employeeName
             return dvarg.array(dvarg.page(link.path).tags).includes("hr-action") 
         }).map(link => dvarg.page(link.path));

    // Собираем массив объектов для каждого такого listItem
    let allRecords = [];
    for (let page of pages) {
        // Дата — из имени файла (ожидается шаблон yyyy-mm-dd - ...)
        // const dateMatch = page.file.name.match(/^(\d{4}-\d{2}-\d{2})/);
        // const date = dateMatch ? dateMatch[1] : "0000-00-00";
        date = page.file.day;

        for (let li of (page.file.lists || [])) {
            if (li.name.path !== employeeLink.path) continue;
            allRecords.push({
                date,
                props: li, // карта свойств, можно deep clone если надо
                page: page.file.link
            });
        }
    }

    // Сортируем по дате (свежее выше)
    allRecords.sort((a, b) => b.date - a.date);
    return allRecords;
}

const areas = [
    "Backend",
    "Frontend GWT",
    "Frontend React",
    "Документация",
    "CI/DevOps",
    "Browser cmd"
];
const metrics = [
    "Тестирование",
    "Передача знаний/Обучение",
    "Глубина планирования / видение сути проблем",
    "Инициативность",
    "Генератор идей",
    "Коммуникабельность",
    "Социальный капитал",
];

const metrics_ext = ["Общий комментарий"]

const salaryFields = [
    "Зарплата",
    "Зарплата - комментарий",
    "Запрос на повышение",
    "Запрос на повышение - комментарий",
    "Должность",
    "Должность - комментарий"
];

exports.default = (arg) => {console.log(arg)}
exports.GetRawMetricsData = GetRawMetricsData;

exports.areas = areas;
exports.metrics = metrics;
exports.salaryFields = salaryFields;
exports.metrics_ext = metrics_ext;
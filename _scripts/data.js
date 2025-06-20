
console.log("Загрузка _scripts/data.js")

function GetRawMetricsData(dvarg, employeeLink) {

    console.log("Запрос GetRawMetricsData из файла:" + dvarg.current().file)

    const employeePage = dvarg.page(employeeLink.path);

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
        const date = page.file.day;

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

/**Для каждой области допустимо добавлять  комментарий постфиксом к названию " - комментарий"*/
const areas = [
    "Архитектурно-интеграционная",
    "Backend",
    "Frontend GWT",
    "Frontend React",
    "Документация",
    "CI/DevOps",
    "Browser cmd",
    "GS-automation"
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

function colorize(value) {
    // Привести к строке, удалить пробелы и невидимые символы по краям
    let str = (value ?? "").toString().trim();

    // Дополнительно убрать не-числовые символы в начале и конце
    // Например, можно убрать всё, кроме цифр, точки и вопроса
    let stripped = str.replace(/^[^\d\.\?]+|[^\d\.\?]+$/g, '');

    // Обработка пустых, null и невалидных значений
    if (!stripped || stripped === "n" || stripped === "?") {
        return `<span style="color:gray;font-size:smaller">${str}</span>`;
    }

    // Вырезаем вопрос — только для сравнения, не для отображения
    let numPart = stripped.replace(/\?/g, '');
    let num = parseFloat(numPart);

    // Если это не число — серое и мелким шрифтом
    if (isNaN(num)) {
        return `<span style="color:gray;font-size:smaller">${str}</span>`;
    }

    // Окрас по условию
    if (num < 1) {
        return `<span style="color:rgb(248, 0, 0)">${str}</span>`;
    } else if (num >= 1) {
        return `<span style="color:rgb(3, 59, 241); font-weight:bold;">${str}</span>`;
    } else {
        return str;
    }
}

function colorizeGradient(value) {
    // Привести к строке и убрать пробелы и спецсимволы по краям
    let str = (value ?? "").toString().trim();
    let stripped = str.replace(/^[^\d\.\?]+|[^\d\.\?]+$/g, '');

    // Не число/некорректно
    if (!stripped || stripped === "n" || stripped === "?") {
        return `<span style="color:gray;font-size:smaller">${str}</span>`;
    }

    // Извлекаем число для сравнения
    let numPart = stripped.replace(/\?/g, '');
    let num = parseFloat(numPart);

    if (isNaN(num)) {
        return `<span style="color:gray;font-size:smaller">${str}</span>`;
    }

    // Границы
    if (num < 0) num = 0;
    if (num > 5) num = 5;

    // Градиент: 0 (красный #d32f2f), 2.5 (жёлтый #fbc02d), 5 (зелёныйrgb(14, 241, 25))
    let color, weight = "";
    if (num <= 2.5) {
        // Красный -> Жёлтый
        let t = num / 2.5;
        color = interpolateColor("#d32f2f", "#fbc02d", t);
    } else {
        // Жёлтый -> Зелёный
        let t = (num - 2.5) / 2.5;
        color = interpolateColor("#fbc02d", "#388e3c", t);
        if (num === 5) weight = "font-weight:bold;";
    }

    return `<span style="color:${color};${weight}">${str}</span>`;
}

// Вспомогательная функция для интерполяции цветов в HEX
function interpolateColor(a, b, t) {
    // a и b — строки в виде "#rrggbb"
    const ah = a.replace('#', ''), bh = b.replace('#', '');
    const ar = parseInt(ah.substr(0,2),16), ag = parseInt(ah.substr(2,2),16), ab = parseInt(ah.substr(4,2),16);
    const br = parseInt(bh.substr(0,2),16), bg = parseInt(bh.substr(2,2),16), bb = parseInt(bh.substr(4,2),16);
    const rr = Math.round(ar + (br-ar)*t), rg = Math.round(ag + (bg-ag)*t), rb = Math.round(ab + (bb-ab)*t);
    return `#${rr.toString(16).padStart(2,"0")}${rg.toString(16).padStart(2,"0")}${rb.toString(16).padStart(2,"0")}`;
}



exports.default = (arg) => {console.log(arg)}
exports.GetRawMetricsData = GetRawMetricsData;

exports.areas = areas;
exports.metrics = metrics;
exports.salaryFields = salaryFields;
exports.metrics_ext = metrics_ext;
exports.colorize = colorize;
exports.colorizeGradient = colorizeGradient;

// Подсчет стажа работы в формате "N г. M мес." по дате найма
function calcTenure(hireDate) {
    if (!hireDate) return "";
    const start = new Date(hireDate);
    if (isNaN(start.getTime())) return "";
    const today = new Date();
    const monthsTotal = (today.getFullYear() - start.getFullYear()) * 12 +
                        (today.getMonth() - start.getMonth());
    if (monthsTotal < 0) return "";
    const years = Math.floor(monthsTotal / 12);
    const months = monthsTotal % 12;
    return `${years > 0 ? years + " г. " : ""}${months} мес.`;
}

exports.calcTenure = calcTenure;

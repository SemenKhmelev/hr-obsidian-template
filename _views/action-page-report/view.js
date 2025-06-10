console.log(
    "\n#################################################\n" +
    "      START HR ACTION REPORT VIEW BUILD           " +
    "\n#################################################\n"
);

var data = require(app.vault.adapter.basePath + "/_scripts/data.js");

const lists = input.dv.current().file.lists;

console.log("🔥 ВСЕ list-items:", lists);

// Отбираем только топ-level элементы с key === "name"
const entries = lists.filter(li => li.name);

console.log("🔥 ОТСЕЯННЫЕ entries:", entries);

const areas = data.areas;
const metrics = data.metrics;
const metrics_ext = data.metrics_ext;

// Рендерим для каждой записи
for (let entry of entries) {
    console.log("🔥 ОБРАБОТКА entry:", entry);
    const record = { name: entry.name };
    console.log("   • name =", record.name);

    console.log("🔥 СФОРМИРОВАН record:", record);

    // Рендерим результат
    input.dv.header(2, `Сотрудник: ${record.name}`);

    input.dv.table(
        ["[[Памятка|Область]]", "Простые", "Средние", "Сложные", "Комментарий"],
        areas.map(area => [
            area,
            entry[`${area} - простые`]   || "",
            entry[`${area} - средние`]   || "",
            entry[`${area} - сложные`]   || "",
            entry[`${area} комментарий`] || ""
        ])
    );

    input.dv.table(
        ["[[Памятка|Показатель]]", "Значение"],
        metrics.map(metric => [metric, entry[metric] || ""])
    );

    metrics_ext.forEach(metric => {
         if (entry[metric]) {
            input.dv.paragraph(`**${metric}**: ${entry[metric] || ""}`)}
    });
    
}

// ===== Дальше можешь добавить любые визуализации, графики, если требуется =====

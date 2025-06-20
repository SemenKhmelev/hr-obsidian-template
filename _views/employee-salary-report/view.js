console.log(
    "\n#################################################\n" +
    "        EMPLOYEE SALARY & POSITION REPORT         " +
    "\n#################################################\n"
);

const data = require(app.vault.adapter.basePath + "/_scripts/data.js");

const employeeFile = input.dv.current().file.link;
const records = data.GetRawMetricsData(input.dv, employeeFile);

const fields = data.salaryFields;

// Оборачиваем значение в ссылку на файл
function fileLinkCell(value, file) {
    if (!value) return "";
    if (!file) return value;
    return input.dv.span(`[[${file.path}|${value}]]`);
}

// Готовим данные для таблицы
const fieldData = fields
    .filter(fld => fld.indexOf(" - комментарий") === -1)
    .map(fld => {
        const obj = data.findLastValueAndFile(records, fld);
        const commentObj = data.findLastValueAndFile(records, fld + " - комментарий");
        return [
            fld,
            fileLinkCell(obj?.value, obj?.file),
            obj?.date || "",
            commentObj?.value || ""
        ];
    });

input.dv.header(2, "Зарплата, должность и связанные запросы");
input.dv.table(
    ["Имя свойства", "Значение", "Дата правки", "Комментарий"],
    fieldData
);

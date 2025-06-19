// Найдём все страницы с тегами #artifact и #focus
const pages = input.dv.pages('#artifact and #focus')
// Сортировка по дате файла (file.day) — от новых к старым
.sort(p => p.file.day, 'desc');

if (!pages.length) {
await input.dv.paragraph("⚠️ Не найдено артефактов с тегом #focus");
return;
}

const latest = pages[0];

// Заголовок
await dv.header(2, `Последняя статья #focus: [[${latest.file.name}]]`);

// Загрузим содержимое и покажем первые 10 строк как превью

const content = await input.dv.io.load(latest.file.path);
const page = input.dv.page(latest.file.path)
const preview = content.split("\n").slice(0, 20).join("\n");
await input.dv.paragraph(preview);
// await input.dv.paragraph(
//       "```markdown\n" +
//       preview +
//       "\n```"
//     );


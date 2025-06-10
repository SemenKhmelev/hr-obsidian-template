console.log("\n====================\nSTART BACKLINK JOURNAL VIEW\n====================\n");

const current = input.dv.current().file.path;
const backlinks = input.dv.pages()
    .where(p => p.file.outlinks && p.file.outlinks.some(link => link.path === current));

// Извлекаем дату из имени файла, либо используем дату создания
function extractDate(file) {
    const title = file.file.name;
    const match = title.match(/^(\d{8,12})/);
    if (match) {
        const dateStr = match[1];
        let year = parseInt(dateStr.slice(0, 4));
        let month = parseInt(dateStr.slice(4, 6)) - 1;
        let day = parseInt(dateStr.slice(6, 8));
        let hour = parseInt(dateStr.slice(8, 10) || "0");
        let minute = parseInt(dateStr.slice(10, 12) || "0");
        return new Date(year, month, day, hour, minute);
    } else {
        return file.file.ctime;
    }
}

Promise.all(
    backlinks.map(async f => {
        return {
            file: f,
            date: extractDate(f),
            content: await input.dv.io.load(f.file.path)
        };
    })
).then(entries => {
    entries.sort((a, b) => b.date - a.date);

    for (const e of entries) {
        // Создаём обёртку-элемент для всего блока
        const wrapper = document.createElement("div");
        wrapper.style.marginBottom = "24px";

        // Заголовок
        const header = input.dv.paragraph(`[[${e.file.file.name}]]`);
        header.style.fontSize = "1.2em";
        header.style.fontWeight = "bold";
        wrapper.appendChild(header);

        // Превью содержимого
        const lines = e.content.split("\n");
        const preview = lines.slice(0, 25).join("\n");

        const pre = document.createElement("pre");
        pre.textContent = preview;
        wrapper.appendChild(pre);

        // Кнопка "Показать всё"
        if (lines.length > 23) {
            const btn = document.createElement("button");
            btn.textContent = "Показать всё";
            btn.style.marginTop = "6px";

            btn.onclick = () => {
                pre.textContent = e.content;
                btn.remove();
            };

            wrapper.appendChild(btn);
        }

        // Добавляем wrapper в Dataview
        input.dv.el("div", wrapper);
    }
});

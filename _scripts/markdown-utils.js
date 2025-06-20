function stripLinks(text) {
    return String(text).replace(/\[\[([^\]]+)\]\]/g, (_, inner) => {
        const i = inner.indexOf("|");
        return i >= 0 ? inner.slice(i + 1) : inner;
    });
}

function stripTags(text) {
    return String(text).replace(/<[^>]*>/g, "");
}

function plainify(value) {
    if (value && typeof value === "object") {
        if ("textContent" in value) {
            value = value.textContent;
        } else {
            value = String(value);
        }
    }
    return stripTags(stripLinks(value));
}

function createMarkdownControls(opts) {
    const controls = document.createElement("div");

    const exportBtn = document.createElement("button");
    exportBtn.textContent = "💾 Скачать таблицу как маркдаун файл";
    exportBtn.style.marginRight = "6px";
    controls.appendChild(exportBtn);

    const copyBtn = document.createElement("button");
    copyBtn.textContent = "📋 Скопировать таблица как маркдаун";
    controls.appendChild(copyBtn);

    exportBtn.addEventListener("click", () => {
        const link = document.createElement("a");
        link.href =
            "data:text/markdown;charset=utf-8," +
            encodeURIComponent(opts.getMarkdown());
        link.download = opts.fileName;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        const original = exportBtn.textContent;
        exportBtn.textContent = "✅ Скачано!";
        exportBtn.disabled = true;
        setTimeout(() => {
            exportBtn.textContent = original;
            exportBtn.disabled = false;
        }, 1000);
    });

    copyBtn.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(opts.getMarkdown());
            const original = copyBtn.textContent;
            copyBtn.textContent = "✅ Скопировано!";
            copyBtn.disabled = true;
            setTimeout(() => {
                copyBtn.textContent = original;
                copyBtn.disabled = false;
            }, 1000);
        } catch (e) {
            console.error("Copy failed", e);
        }
    });

    return controls;
}

exports.stripLinks = stripLinks;
exports.stripTags = stripTags;
exports.plainify = plainify;
exports.createMarkdownControls = createMarkdownControls;

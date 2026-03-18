function runOlp() {
    const code = document.getElementById("editor").value;
    const lines = code.split("\n");
    const output = document.getElementById("output");

    output.innerHTML = ""; // On vide la zone d'exécution

    let currentFont = "Arial"; // Police par défaut

    lines.forEach(line => {

        line = line.trim();

        // --- SFG <Police> ---
        if (line.startsWith("SFG <")) {
            const font = line.match(/SFG <(.*?)>/);
            if (font) {
                currentFont = font[1];
            }
        }

        // --- AERT = couleur SFG <police> "Texte" ((lien)) ---
        if (line.startsWith("AERT")) {

            const color = line.match(/AERT = (\w+)/);
            const font = line.match(/SFG <(.*?)>/);
            const text = line.match(/"(.*?)"/);
            const link = line.match(/\(\((.*?)\)\)/);

            const btn = document.createElement("button");

            if (text) btn.textContent = text[1];
            if (color) btn.style.color = color[1];
            if (font) btn.style.fontFamily = font[1];
            else btn.style.fontFamily = currentFont;

            if (link) {
                btn.onclick = () => {
                    window.open(link[1], "_blank");
                };
            }

            output.appendChild(btn);
        }

        // --- Texte simple entre guillemets ---
        if (line.startsWith("\"")) {
            const text = line.match(/"(.*?)"/);
            if (text) {
                const p = document.createElement("p");
                p.textContent = text[1];
                p.style.fontFamily = currentFont;
                output.appendChild(p);
            }
        }

    });
}

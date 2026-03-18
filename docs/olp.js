document.getElementById("runBtn").onclick = runOlp;
document.getElementById("exampleBtn").onclick = toggleExamples;

function toggleExamples() {
  document.getElementById("examples-menu").classList.toggle("hidden");
}

function loadExample(name) {
  fetch(`examples/${name}.olp`)
    .then(r => r.text())
    .then(t => {
      document.getElementById("editor").value = t;
      toggleExamples();
    });
}

function runOlp() {
  const code = document.getElementById("editor").value;
  const html = interpretOlp(code);

  const iframe = document.getElementById("preview");
  iframe.contentDocument.open();
  iframe.contentDocument.write(html);
  iframe.contentDocument.close();
}

function interpretOlp(content) {
  const lines = content.split(/\r?\n/);

  let font = "Arial";
  let body = "";
  let backgroundStyle = "";
  let lastImagePath = null;

  const sizeMap = { A: 400, B: 300, C: 200, D: 150, E: 100 };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("SFG")) {
      const m = trimmed.match(/SFG\s*<(.*?)>/);
      if (m) font = m[1];
    }

    else if (trimmed.startsWith("XTOI")) {
      const m = trimmed.match(/XTOI\s*=\s*"(.+?)"/);
      if (m) body += `<div>${m[1]}</div>`;
    }

    else if (trimmed.startsWith("SER")) {
      const m = trimmed.match(/SER\s*"(.+?)"/);
      if (m) body += `<div>${m[1]}</div>`;
    }

    else if (trimmed.startsWith("AERT")) {
      const m = trimmed.match(/AERT\s*=\s*(\w+)\s*"(.+?)"(?:\s*::\s*\(\((.+?)\)\))?/);
      if (m) {
        const color = m[1];
        const text = m[2];
        const link = m[3];

        if (link) {
          body += `<button style="background:${color};padding:10px;border:none;color:white;border-radius:6px;margin:5px;" onclick="window.open('${link}')">${text}</button>`;
        } else {
          body += `<button style="background:${color};padding:10px;border:none;color:white;border-radius:6px;margin:5px;">${text}</button>`;
        }
      }
    }

    else if (trimmed.startsWith("AATR")) {
      const m = trimmed.match(/AATR\s*\(\((.+?)\)\)\s*"(.+?)"/);
      if (m) {
        const link = m[1];
        const text = m[2];
        body += `<button style="background:green;padding:10px;border:none;color:white;border-radius:6px;margin:5px;" onclick="window.open('${link}')">${text}</button>`;
      }
    }

    else if (trimmed.startsWith("TOLP")) {
      const m = trimmed.match(/TOLP\s*=\s*"(.+?)"\s*taille::\s*([A-E])\s*@(.+?)@/);
      if (m) {
        const fileName = m[1];
        const sizeLetter = m[2];
        const location = m[3];

        let imgPath = fileName;
        const px = sizeMap[sizeLetter];

        lastImagePath = imgPath;

        body += `<img src="${imgPath}" style="width:${px}px;margin:10px 0;">`;
      }
    }

    else if (trimmed.startsWith("LBG")) {
      body += `<input type="text" style="padding:10px;font-size:16px;margin:5px 0;width:300px;"><br>`;
    }

    else if (trimmed.startsWith("WLO")) {
      let value = trimmed.split("=")[1].trim();

      if (/^[a-zA-Z]+$/.test(value) || value.startsWith("#")) {
        backgroundStyle = `background:${value};background-size:cover;`;
      }
      else if (value.startsWith("\"")) {
        let img = value.replace(/"/g, "");
        backgroundStyle = `background-image:url('${img}');background-size:cover;`;
      }
      else if (value.startsWith("((")) {
        let link = value.replace("((", "").replace("))", "");
        backgroundStyle = `background-image:url('${link}');background-size:cover;`;
      }
      else if (["A","B","C","D","E"].includes(value)) {
        if (lastImagePath) {
          backgroundStyle = `background-image:url('${lastImagePath}');background-size:cover;`;
        }
      }
    }
  }

  return `
  <html>
  <head>
    <style>
      body {
        font-family: "${font}";
        padding: 20px;
        ${backgroundStyle}
      }
    </style>
  </head>
  <body>
    ${body}
  </body>
  </html>
  `;
}

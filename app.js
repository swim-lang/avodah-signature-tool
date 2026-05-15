const LOGIN = {
  username: "avodah",
  password: "signature2026",
};

const state = {
  authenticated: window.localStorage.getItem("avodah-signature-authenticated") === "true",
  loginError: "",
  templateHtml: "",
  status: "",
  variation: "classic",
  data: {
    name: "Sean Cohen",
    title: "Founder & Principal Attorney",
    addressLine1: "1234 Madison Avenue, Suite 500",
    addressLine2: "New York, NY 10016",
    phone: "+1 (212) 555-0123",
    email: "sean@avodahlegal.com",
    website: "https://www.avodahlegal.com/",
  },
};

const fields = [
  ["name", "Name", "text"],
  ["title", "Title", "text"],
  ["addressLine1", "Address line 1", "text"],
  ["addressLine2", "Address line 2", "text"],
  ["phone", "Phone", "text"],
  ["website", "Logo link", "url"],
];

const variations = [
  ["classic", "Classic"],
  ["compact", "Compact"],
  ["minimal", "Minimal"],
];

const app = document.querySelector("#app");

fetch("signature-template.html")
  .then((response) => {
    if (!response.ok) throw new Error("Template failed to load.");
    return response.text();
  })
  .then((html) => {
    state.templateHtml = html;
    render();
  })
  .catch(() => {
    state.status = "The signature template could not be loaded.";
    render();
  });

render();

function render() {
  app.innerHTML = state.authenticated ? renderBuilder() : renderLogin();
  bindEvents();
}

function renderLogin() {
  return `
    <section class="login-page">
      <div class="login-panel">
        <div class="login-title">
          <div>
            <p class="eyebrow">Avodah</p>
            <h1>Signature Access</h1>
          </div>
          <div class="lock" aria-hidden="true">#</div>
        </div>
        <form id="login-form">
          <div class="field">
            <label for="username">Username</label>
            <input id="username" autocomplete="username" />
          </div>
          <div class="field">
            <label for="password">Password</label>
            <input id="password" type="password" autocomplete="current-password" />
          </div>
          ${state.loginError ? `<p class="error">${escapeHtml(state.loginError)}</p>` : ""}
          <button class="button primary" type="submit">Enter</button>
        </form>
        <p class="hint">Use the credentials provided by Anchovies to continue.</p>
      </div>
    </section>
  `;
}

function renderBuilder() {
  const signatureHtml = getSignatureHtml();
  const previewDocument = buildSignatureDocument(signatureHtml);

  return `
    <header class="app-header">
      <div>
        <p class="eyebrow">Avodah</p>
        <h1>Email Signature Builder</h1>
      </div>
      <button class="button" id="logout" type="button">Sign out</button>
    </header>
    <section class="shell">
      <div class="sidebar">
        <section class="panel">
          <div class="panel-header">
            <h2>Details</h2>
            <button class="button" id="reset" type="button">Reset</button>
          </div>
          <div class="form-grid">
            ${fields.map(([key, label, type]) => renderField(key, label, type)).join("")}
          </div>
        </section>
        <section class="panel">
          <div class="panel-header"><h2>Variation</h2></div>
          <div class="variation-grid">
            ${variations
              .map(
                ([id, label]) =>
                  `<button class="variation-button ${state.variation === id ? "active" : ""}" data-variation="${id}" type="button">${label}</button>`,
              )
              .join("")}
          </div>
        </section>
        <section class="panel">
          <div class="panel-header"><h2>Export</h2></div>
          <div class="actions">
            <button class="button primary" id="copy-rich" type="button">Copy for Outlook</button>
            <button class="button" id="copy-source" type="button">Copy HTML</button>
            <button class="button" id="download" type="button">Download HTML</button>
          </div>
        </section>
      </div>
      <section class="preview-panel">
        <div class="preview-header">
          <div>
            <h2>Preview</h2>
            <p class="preview-subtitle">Outlook: Settings, Accounts, Signatures, paste.</p>
          </div>
          <p class="status">${escapeHtml(state.status || state.variation)}</p>
        </div>
        <div class="preview-stage">
          <iframe title="Avodah email signature preview" srcdoc="${escapeAttribute(previewDocument)}"></iframe>
        </div>
      </section>
    </section>
  `;
}

function renderField(key, label, type) {
  return `
    <div class="field">
      <label for="${key}">${label}</label>
      <input id="${key}" data-field="${key}" type="${type}" value="${escapeAttribute(state.data[key])}" />
    </div>
  `;
}

function bindEvents() {
  const loginForm = document.querySelector("#login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const username = document.querySelector("#username").value.trim();
      const password = document.querySelector("#password").value;

      if (username === LOGIN.username && password === LOGIN.password) {
        window.localStorage.setItem("avodah-signature-authenticated", "true");
        state.authenticated = true;
        state.loginError = "";
      } else {
        state.loginError = "That username and password did not match.";
      }

      render();
    });
  }

  document.querySelector("#logout")?.addEventListener("click", () => {
    window.localStorage.removeItem("avodah-signature-authenticated");
    state.authenticated = false;
    state.status = "";
    render();
  });

  document.querySelector("#reset")?.addEventListener("click", () => {
    state.variation = "classic";
    state.status = "";
    state.data = {
      name: "Sean Cohen",
      title: "Founder & Principal Attorney",
      addressLine1: "1234 Madison Avenue, Suite 500",
      addressLine2: "New York, NY 10016",
      phone: "+1 (212) 555-0123",
      email: "sean@avodahlegal.com",
      website: "https://www.avodahlegal.com/",
    };
    render();
  });

  document.querySelectorAll("[data-field]").forEach((input) => {
    input.addEventListener("input", () => {
      state.data[input.dataset.field] = input.value;
      state.status = "";
      render();
      document.querySelector(`[data-field="${input.dataset.field}"]`)?.focus();
    });
  });

  document.querySelectorAll("[data-variation]").forEach((button) => {
    button.addEventListener("click", () => {
      state.variation = button.dataset.variation;
      state.status = "";
      render();
    });
  });

  document.querySelector("#copy-rich")?.addEventListener("click", () => {
    copyRichHtml(getSignatureHtml());
  });

  document.querySelector("#copy-source")?.addEventListener("click", () => {
    navigator.clipboard.writeText(getSignatureHtml()).then(() => {
      state.status = "HTML source copied.";
      render();
    });
  });

  document.querySelector("#download")?.addEventListener("click", () => {
    const blob = new Blob([buildSignatureDocument(getSignatureHtml())], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = getExportFileName(state.data.name);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  });
}

function getSignatureHtml() {
  if (!state.templateHtml) return "";

  const document = new DOMParser().parseFromString(state.templateHtml, "text/html");
  const table = document.querySelector("table");
  const cells = table.querySelectorAll("td");
  const logoCell = cells[0];
  const infoCell = cells[1];
  const paragraphs = infoCell.querySelectorAll("p");

  replaceBrandArtwork(logoCell, infoCell);

  paragraphs[0].textContent = state.data.name.trim();
  paragraphs[1].textContent = state.data.title.trim();
  paragraphs[2].textContent = "";

  appendContactLine(document, paragraphs[2], state.data.addressLine1);
  appendContactLine(document, paragraphs[2], state.data.addressLine2);
  appendContactLine(document, paragraphs[2], state.data.phone);

  if (state.variation === "compact" || state.variation === "minimal") {
    infoCell.querySelector("div")?.remove();
  }

  if (state.variation === "minimal") {
    logoCell.setAttribute("style", "vertical-align:middle;padding:0;border-right:0;");
    infoCell.setAttribute("style", "vertical-align:middle;padding:0 0 0 20px;");
    const logo = logoCell.querySelector("img");
    logo?.setAttribute("width", "52");
    logo?.setAttribute("height", "48");
    logo?.setAttribute("style", "display:block;margin-right:14px;border:0;outline:none;text-decoration:none;");
    paragraphs[0].setAttribute(
      "style",
      "font-family:'Times New Roman',Times,serif;font-size:22px;font-weight:400;line-height:1.1;margin:0 0 2px 0;color:#2d1b22;letter-spacing:0.01em;",
    );
    paragraphs[1].setAttribute(
      "style",
      "font-family:'Poppins','Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 8px 0;color:#2d1b22;opacity:0.85;",
    );
  }

  return table.outerHTML;
}

function replaceBrandArtwork(logoCell, infoCell) {
  logoCell.textContent = "";
  const href = normalizeWebsite(state.data.website);
  const logoLink = logoCell.ownerDocument.createElement("a");
  logoLink.href = href;
  logoLink.target = "_blank";
  logoLink.rel = "noopener";
  logoLink.setAttribute("style", "display:inline-block;text-decoration:none;border:0;outline:none;");

  const logo = logoCell.ownerDocument.createElement("img");
  logo.src = assetUrl("assets/avodah-lion.png");
  logo.width = 70;
  logo.height = 64;
  logo.alt = "Avodah";
  logo.setAttribute("style", "display:block;margin-right:14px;border:0;outline:none;text-decoration:none;");
  logoLink.append(logo);
  logoCell.append(logoLink);

  const wordmarkContainer = infoCell.querySelector("div");
  if (!wordmarkContainer) return;

  wordmarkContainer.textContent = "";
  const wordmark = infoCell.ownerDocument.createElement("img");
  wordmark.src = assetUrl("assets/avodah-wordmark.png");
  wordmark.width = 110;
  wordmark.height = 17;
  wordmark.alt = "Avodah";
  wordmark.setAttribute("style", "display:block;border:0;outline:none;text-decoration:none;");
  const wordmarkLink = infoCell.ownerDocument.createElement("a");
  wordmarkLink.href = href;
  wordmarkLink.target = "_blank";
  wordmarkLink.rel = "noopener";
  wordmarkLink.setAttribute("style", "display:inline-block;text-decoration:none;border:0;outline:none;");
  wordmarkLink.append(wordmark);
  wordmarkContainer.append(wordmarkLink);
}

function appendContactLine(document, container, value) {
  const text = value.trim();
  if (!text) return;
  appendBreak(container);
  container.append(document.createTextNode(text));
}

function appendBreak(container) {
  if (container.childNodes.length > 0) {
    container.append(container.ownerDocument.createElement("br"));
  }
}

function buildSignatureDocument(signatureHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Avodah Email Signature</title>
</head>
<body style="margin:0;padding:40px;background:#ffffff;">
${signatureHtml}
</body>
</html>`;
}

function copyRichHtml(signatureHtml) {
  if (navigator.clipboard?.write && window.ClipboardItem) {
    const item = new ClipboardItem({
      "text/html": new Blob([signatureHtml], { type: "text/html" }),
      "text/plain": new Blob([signatureHtml], { type: "text/plain" }),
    });
    navigator.clipboard.write([item]).then(() => {
      state.status = "Signature copied for Outlook.";
      render();
    });
    return;
  }

  navigator.clipboard.writeText(signatureHtml).then(() => {
    state.status = "HTML source copied.";
    render();
  });
}

function getExportFileName(name) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return slug ? `avodah-${slug}-signature.html` : "avodah-signature.html";
}

function assetUrl(path) {
  return new URL(path, window.location.href).href;
}

function normalizeWebsite(website) {
  const trimmed = website.trim();
  if (!trimmed) return "https://www.avodahlegal.com/";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function displayWebsite(website) {
  return normalizeWebsite(website).replace(/^https?:\/\//i, "").replace(/\/$/g, "");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

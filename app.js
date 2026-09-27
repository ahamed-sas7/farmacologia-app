let farmaci = [];
let categoriaAttiva = "Tutte";

const listEl = document.getElementById("drugList");
const searchEl = document.getElementById("searchInput");
const chipsEl = document.getElementById("categoryChips");
const countEl = document.getElementById("resultCount");
const overlayEl = document.getElementById("detailOverlay");
const cardEl = document.getElementById("detailCard");
const badgeEl = document.getElementById("offlineBadge");

fetch("data/farmaci.json")
  .then(r => r.json())
  .then(data => {
    farmaci = data;
    renderChips();
    render();
  })
  .catch(() => {
    listEl.innerHTML = "<p>Impossibile caricare i dati. Verifica che il file data/farmaci.json esista.</p>";
  });

function renderChips() {
  const categorie = ["Tutte", ...new Set(farmaci.map(f => f.categoria))];
  chipsEl.innerHTML = "";
  categorie.forEach(cat => {
    const chip = document.createElement("button");
    chip.className = "chip" + (cat === categoriaAttiva ? " active" : "");
    chip.textContent = cat;
    chip.onclick = () => { categoriaAttiva = cat; render(); renderChips(); };
    chipsEl.appendChild(chip);
  });
}

function render() {
  const query = searchEl.value.trim().toLowerCase();
  const filtrati = farmaci.filter(f => {
    const matchCategoria = categoriaAttiva === "Tutte" || f.categoria === categoriaAttiva;
    const matchTesto = !query || f.nome.toLowerCase().includes(query) || f.classe.toLowerCase().includes(query);
    return matchCategoria && matchTesto;
  });

  countEl.textContent = filtrati.length + (filtrati.length === 1 ? " farmaco trovato" : " farmaci trovati");
  listEl.innerHTML = "";

  filtrati.forEach(f => {
    const li = document.createElement("li");
    li.className = "drug-item";
    li.innerHTML = `
      <div class="names">
        <span class="nome">${f.nome}</span>
        <span class="classe">${f.classe}</span>
      </div>
      <span class="tag">${f.categoria}</span>
    `;
    li.onclick = () => showDetail(f);
    listEl.appendChild(li);
  });
}

function showDetail(f) {
  cardEl.innerHTML = `
    <button class="close-btn" onclick="closeDetail()">Chiudi</button>
    <h2>${f.nome}</h2>
    <p class="classe-line">${f.classe}</p>
    ${sezione("Meccanismo d'azione", f.meccanismo)}
    ${sezione("Indicazioni", f.indicazioni)}
    ${sezione("Farmacocinetica", f.farmacocinetica)}
    ${sezione("Effetti avversi", f.effetti_avversi)}
    ${sezione("Controindicazioni", f.controindicazioni)}
    ${sezione("Interazioni", f.interazioni)}
  `;
  overlayEl.classList.add("open");
}

function sezione(titolo, testo) {
  if (!testo) return "";
  return `<section><h3>${titolo}</h3><p>${testo}</p></section>`;
}

function closeDetail() {
  overlayEl.classList.remove("open");
}

overlayEl.addEventListener("click", e => { if (e.target === overlayEl) closeDetail(); });
searchEl.addEventListener("input", render);

function updateOfflineBadge() {
  if (navigator.onLine) {
    badgeEl.textContent = "In linea";
    badgeEl.classList.remove("offline");
  } else {
    badgeEl.textContent = "Offline — funziona comunque";
    badgeEl.classList.add("offline");
  }
}
window.addEventListener("online", updateOfflineBadge);
window.addEventListener("offline", updateOfflineBadge);
updateOfflineBadge();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
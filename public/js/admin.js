const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://xv-invitation-backend-2nul.onrender.com";

const BASE_INVITE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:5500/public/index.html"
    : "https://golden-profiterole-8523b0.netlify.app/";


let adminData = [];

// -------------------------
// Cargar datos del panel
// -------------------------
async function loadAdminData() {
  const res = await fetch(`${API_URL}/api/admin/rsvps`);
  const data = await res.json();

  adminData = data.items;

  if (data.totalInvitations > 0) {
    const importSection = document.getElementById("import-section");
    if (importSection) importSection.style.display = "none";
  }

  document.getElementById("admin-summary").innerHTML = `
        <p>Total invitaciones: <strong>${data.totalInvitations}</strong></p>
        <p>Confirmadas: <strong>${data.confirmedInvitations}</strong></p>
        <p>Pendientes: <strong>${data.pendingInvitations}</strong></p>
        <p>Total asistentes confirmados: <strong>${data.totalGuestsConfirmed}</strong></p>
    `;

  renderTable(adminData);
}

// -------------------------
// Configurar importación CSV
// -------------------------
async function setupImport() {
  const importBtn = document.getElementById("import-btn");
  const fileInput = document.getElementById("csv-file");
  const resultEl = document.getElementById("import-result");

  if (!importBtn || !fileInput) return;

  importBtn.onclick = async () => {
    const file = fileInput.files[0];
    if (!file) {
      resultEl.textContent = "Selecciona un archivo CSV.";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    resultEl.textContent = "Importando…";

    try {
      const res = await fetch(`${API_URL}/api/admin/import/csv`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        resultEl.innerHTML = `
            <p style="color:#c62828;">❌ ${data.message}</p>
            <ul>
            ${(data.errors || [])
              .map((e) => `<li>Fila ${e.row}: ${e.reason}</li>`)
              .join("")}
            </ul>
        `;
        return;
      }

      resultEl.innerHTML = `
        <p style="color:#2e7d32;">
            ✅ Importación completada.
            Nuevos registros: <strong>${data.nuevos}</strong>
        </p>
        `;

      // 🔄 Recargar datos del panel
      loadAdminData();
    } catch (err) {
      resultEl.textContent = "Error al importar el archivo.";
    }
  };
}

// -------------------------
// Configurar exportación CSV
// -------------------------
function setupExport() {
  const btn = document.getElementById("export-btn");
  console.log("setupExport ejecutado", btn);

  if (!btn) return;

  btn.onclick = () => {
    console.log("✅ Click en export");
    window.open(`${urlA}/api/admin/export/rsvps.xlsx`, "_blank");
  };
}

function setupFilters() {
  const buttons = document.querySelectorAll(".filter-btn");

  buttons.forEach((btn) => {
    btn.onclick = () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;

      if (filter === "all") {
        renderTable(adminData);
      }

      if (filter === "confirmed") {
        renderTable(adminData.filter((i) => i.confirmed));
      }

      if (filter === "pending") {
        renderTable(adminData.filter((i) => !i.confirmed));
      }
    };
  });
}

function setupExportQRs() {
  const btn = document.getElementById("export-qrs-btn");
  console.log("setupExportQRs ejecutado", btn);
  if (!btn) return;

  btn.onclick = () => {
    window.open(`${API_URL}/api/admin/export/qrs.zip`, "_blank");
  };
}

function setupExportCards() {
  const btn = document.getElementById("export-cards-btn");
  if (!btn) return;

  btn.onclick = () => {
    window.open(`${API_URL}/api/admin/export/cards.pdf`, "_blank");
  };
}

// -------------------------
// Inicialización del panel
// -------------------------
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ admin.js cargado");
  loadAdminData();
  setupImport();
  setupExport();
  setupFilters();
  setupExportQRs();
  setupExportCards();
});

// -------------------------
// Renderizar tabla de RSVPs
// -------------------------

function renderTable(items) {
  const tbody = document.querySelector("#admin-table tbody");
  tbody.innerHTML = "";

  items.forEach((item) => {
    const tr = document.createElement("tr");
    const inviteLink = `${BASE_INVITE_URL}?inv=${item.id}`;
    tr.innerHTML = `
        <td>${item.displayName}</td>
        <td>${item.type}</td>
        <td>${item.confirmed ? "✅ Confirmado" : "⏳ Pendiente"}</td>
        <td>${item.totalGuests}</td>
        <td>
            <a href="${inviteLink}" target="_blank">
                Abrir
            </a>
        </td>
      `;
    tbody.appendChild(tr);
  });
}

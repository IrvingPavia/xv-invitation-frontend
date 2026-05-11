
// =======================
// Manejar respuestas RSVP
// =======================


export function initRSVP(invitation) {
  const minusBtn = document.getElementById("minus");
  const plusBtn = document.getElementById("plus");
  const countEl = document.getElementById("guest-count");
  const counterWrapper = document.querySelector(".rsvp__counter");
  const noteEl = document.getElementById("rsvp-note");
  const confirmBtn = document.getElementById("confirm-btn");
  const successEl = document.getElementById("rsvp-success");
  const companionsWrapper = document.getElementById("companions-wrapper");
  const errorEl = document.getElementById("rsvp-error");
  const availableEl = document.getElementById("available-passes");

  
  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://xv-invitation-backend-2nul.onrender.com";

  console.log("Elementos clave:", {
    minusBtn,
    plusBtn,
    countEl,
    counterWrapper,
    noteEl,
    confirmBtn,
    successEl,
    companionsWrapper,
    errorEl,
  });
  if (!confirmBtn || !successEl) return;

  // ✅ CASO: ya está confirmado
  if (invitation.confirmation?.status === "confirmed") {
    showConfirmedSummary(invitation);
    return; // ⛔ no inicializamos RSVP normal
  }

  const max = invitation.maxGuests;
  availableEl.textContent = max;
  let count = 1;

  // ✅ INVITACION FAMILIAR (sin contador, solo botón de confirmar)
  if (invitation.type === "family") {
    counterWrapper.style.display = "none";
    
    noteEl.textContent = "Esta invitación es válida para tu grupo familiar. Por favor confirma la asistencia de tu familia completa.";  
    confirmBtn.onclick = async () => {
      await saveRSVP([]);
      showConfirmedSummary(invitation);
    };
    return;
  }

  // ✅ INVITADO ÚNICO
  if (max === 1 || invitation.type == "family") {
    counterWrapper.style.display = "none";
    noteEl.textContent = "Esta invitación es válida solo para ti";

    confirmBtn.onclick = async () => {
      await saveRSVP([]);
      showConfirmedSummary(invitation);
    };
    return;
  }

  // ---- FLUJO NORMAL ----
  noteEl.textContent = `Puedes confirmar hasta ${max} personas (incluyéndote)`;
  countEl.textContent = count;

  function renderCompanionsInputs() {
    // ✅ Guardar valores actuales
    const existingValues = Array.from(
      companionsWrapper.querySelectorAll("input")
    ).map((input) => input.value);
    console.log("companiansWrapper:", companionsWrapper);
    console.log(
      "Renderizando inputs para acompañantes. Valores actuales:",
      existingValues
    );

    companionsWrapper.innerHTML = "";
    // ✅ Solo para invitado individual
    if (invitation.type !== "individual") return;
    // ✅ Número de acompañantes = total - 1 (invitado principal)
    const companionsCount = count - 1;
    // ✅ Si no hay acompañantes, no se muestra nada
    if (companionsCount <= 0) return;
    console.log("Renderizando inputs para acompañantes:", companionsCount);
    for (let i = 0; i < companionsCount; i++) {
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = `Nombre y apellido del acompañante ${i + 1}`;
      input.classList.add("rsvp__guest-input");
      // ✅ Restaurar valor si existía
      if (existingValues[i]) {
        input.value = existingValues[i];
      }
      input.addEventListener("input", () => {
        input.classList.remove("error");
        errorEl.textContent = "";
      });

      companionsWrapper.appendChild(input);
    }
  }

  minusBtn.onclick = () => {
    if (count > 1) {
      count--;
      countEl.textContent = count;
      renderCompanionsInputs();
    }
  };

  plusBtn.onclick = () => {
    if (count < max) {
      count++;
      countEl.textContent = count;
      renderCompanionsInputs();
    }
  };

  confirmBtn.onclick = async (e) => {
    const inputs = companionsWrapper.querySelectorAll("input");
    const companions = [];

    const errorEl = document.getElementById("rsvp-error");
    errorEl.textContent = "";

    let hasError = false;
    inputs.forEach((input) => {
      if (!input.value.trim()) {
        input.classList.add("error");
        hasError = true;
      } else {
        input.classList.remove("error");
      }
    });

    if (hasError) {
      errorEl.textContent =
        "Por favor completa el nombre de todos los acompañantes.";
      return;
    }

    inputs.forEach((input) => {
      companions.push({
        name: input.value,
      });
    });

    await saveRSVP(companions);
    showConfirmedSummary({
      ...invitation,
      confirmation: { status: "confirmed", companions },
    });
  };

  async function saveRSVP(companions) {
    await fetch(`${API_URL}/api/invitations/${invitation.id}/rsvp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companions }),
    });
  }

  function showConfirmedSummary(invitation) {
    counterWrapper.style.display = "none";
    confirmBtn.style.display = "none";
    companionsWrapper.innerHTML = "";
    noteEl.textContent = "";

    successEl.innerHTML = "";

    successEl.innerHTML = `
    <div class="rsvp-summary">
      <div class="rsvp-summary__icon">✉️</div>

      <h3 class="rsvp-summary__title">
        Asistencia confirmada
      </h3>

      <p class="rsvp-summary__principal">
        ${invitation.displayName}
      </p>

      ${
        invitation.confirmation?.companions?.length
          ? `
            <ul class="rsvp-summary__companions">
              ${invitation.confirmation.companions
                .map((c) => `<li>${c.name}</li>`)
                .join("")}
            </ul>
          `
          : ""
      }
    </div>
    `;
  }
}

  


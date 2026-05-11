// =======================
// MOCK DATA (solo para desarrollo)
// =======================

export async function initInvitation(urlServer) {
  const params = new URLSearchParams(window.location.search);
  const invitationId = params.get("inv");
  const urlInvitation = `${urlServer}/api/invitations/${invitationId}`;

  const nameEl = document.getElementById("invitation-name");
  const noteEl = document.getElementById("invitation-note");
  const listEl = document.getElementById("guest-list");
  
  if (!nameEl || !noteEl || !listEl) {
    console.warn("Elementos de invitación no encontrados");
    return null;
  }

  if (!invitationId) {
    nameEl.textContent = "Estás cordialmente invitado";
    noteEl.textContent = "";
    listEl.innerHTML = "";
    return null;
  }

  try {
    const res = await fetch(urlInvitation);
    if (!res.ok) throw new Error("Invitación no encontrada");
    const invitation = await res.json();

    // ✅ Render UI
    nameEl.textContent = invitation.displayName || "";
    noteEl.textContent = invitation.note || "";

    noteEl.textContent =
      `Esta invitación es válida para ${invitation.maxGuests} ` +
      (invitation.maxGuests === 1 ? "persona" : "personas");

    // ✅ Mostrar lista solo si hay más de un invitado
    if (invitation.guests && invitation.guests.length > 1) {
      console.log("Mostrando lista de invitados:", invitation.guests);
      invitation.guests.forEach((guest) => {
        console.log("Agregando invitado a la lista:", guest.name);
        const li = document.createElement("li");

        li.textContent = guest.name;
        li.classList.add("reveal-item");
        li.classList.add("list");

        listEl.appendChild(li);
      });
    } else {
      listEl.innerHTML = "";
    }

      // listEl.innerHTML = "";
      // if (Array.isArray(invitation.guests)) {
      //   invitation.guests.forEach(g => {
      //     const li = document.createElement("li");
      //     li.textContent = g.name;
      //     listEl.appendChild(li);
      //   });
      // }
  
    // ✅ IMPORTANTE: devolver la invitación COMPLETA
    return invitation;

  } catch (error) {
    console.error("Error cargando invitación:", error);
    nameEl.textContent = "Estás cordialmente invitado";
    noteEl.textContent = "";
    listEl.innerHTML = "";
    return null;
  }
}

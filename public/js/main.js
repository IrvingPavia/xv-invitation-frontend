import { initCountdown } from "./countdown.js";
import { initInvitation } from "./invitation.js";
import { initRSVP } from "./rsvp.js";

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://xv-invitation-backend-2nul.onrender.com";

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

// Forzar siempre scroll arriba al cargar
window.scrollTo(0, 0);

document.addEventListener("DOMContentLoaded", async () => {
  document.body.style.opacity = "1";
  window.scrollTo({ top: 0, behavior: "instant" });
  await loadSection("invitation");
  await loadSection("details");
  await loadSection("location");
  // await loadSection("countdown");
  await loadSection("rsvp");

  // Intro
  loadIntro();

  // Countdown
  initCountdown();

  const invitation = await initInvitation(API_URL);
  console.log("Invitación cargada:", invitation);
  if (invitation) {
    initRSVP(invitation);
  }
});



async function loadSection(name) {
  const res = await fetch(`./sections/${name}.html`);
  if (!res.ok) {
    console.error("No se pudo cargar", name);
    return;
  }
  const html = await res.text();
  document.getElementById("app")
    .insertAdjacentHTML("beforeend", html);

  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    {
      threshold: 0.35,
    }
  );

  document.querySelectorAll(".fade-up").forEach((el) => {
    observer.observe(el);
  });

}

function loadIntro() {
  const intro = document.getElementById("hero-intro");
  window.scrollTo(0, 0);
  if (!intro) return;

  setTimeout(() => {
    intro.style.transition = "opacity 1.2s ease";
    intro.style.opacity = "0";

    setTimeout(() => {
      intro.remove();
    }, 1200);
  }, 4050);
}


const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

const menuBtn = document.getElementById("menu-btn");
const menu = document.getElementById("menu");
menuBtn.addEventListener("click", () => {
  menu.classList.toggle("active");
});

document.querySelectorAll(".menu-content a").forEach((link) => {
  link.addEventListener("click", () => {
    menu.classList.remove("active");
  });
});


document.addEventListener("click", (e) => {
  const menu = document.getElementById("menu");
  const menuBtn = document.getElementById("menu-btn");

  // Si el menú está abierto y haces click fuera
  if (
    menu.classList.contains("active") &&
    !menu.contains(e.target) &&
    !menuBtn.contains(e.target)
  ) {
    menu.classList.remove("active");
  }
});

// ========================
// AUDIO CINEMATOGRAFICO
// ========================

const soundBtn = document.getElementById("sound-btn");

const audio = new Audio("./assets/mp3/sountrack_bg.mp3");
audio.loop = true;
audio.volume = 0; // inicia en silencio

let isMuted = false;
let audioStarted = false;


function startAudio() {
  audio
    .play()
    .then(() => {
      fadeInAudio();

      soundBtn.classList.add("is-playing");

      audioStarted = true;
    })
    .catch(() => {});
}

// 🎬 1. Iniciar audio UNA sola vez (cuando el usuario interactúa)
function startAudioOnce() {
  if (!audioStarted) {
      audio
        .play()
        .then(() => {
          fadeInAudio();
          console.log("Audio iniciado ✅");
        })
        .catch((err) => {
          console.log("Error al reproducir:", err);
        });
    audioStarted = true;
  }
}

// 🎬 2. Fade IN cinematográfico
function fadeInAudio() {
  console.log("Fade In Audio ✅");
  let targetVolume = 0.6; // volumen final (ajustable)
  let step = 0.02;

  let fadeInterval = setInterval(() => {
    if (audio.volume < targetVolume) {
      audio.volume += step;
    } else {
      clearInterval(fadeInterval);
    }
  }, 120);
}

function fadeOutAudio() {
  let fade = setInterval(() => {
    if (audio.volume > 0.05) {
      audio.volume -= 0.05;
    } else {
      audio.pause();
      clearInterval(fade);
    }
  }, 100);
}

// 🎬 4. Control manual del botón
soundBtn.addEventListener("click", () => {
  // 🎬 PRIMER CLICK → activar audio
  if (!audioStarted) {
    startAudio();

    soundBtn.classList.add("is-playing");
    soundBtn.classList.remove("is-muted");
    return;
  }

  // 🔁 luego solo mute/unmute
  isMuted = !isMuted;

  soundBtn.classList.toggle("is-muted", isMuted);

  if (isMuted) {
    startAudio();
  } else {
    fadeOutAudio();
  }
});


const scrollBar = document.getElementById("scrollTopBar");
window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    scrollBar.classList.add("active");
  } else {
    scrollBar.classList.remove("active");
  }
});

scrollBar.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});


const scrollIndicator = document.querySelector(".scroll-indicator");
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    scrollIndicator.style.opacity = "0";
  } else {
    scrollIndicator.style.opacity = "1";
  }
});



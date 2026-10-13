
"use strict";

// ── MÚSICA DE FUNDO (toca no carregamento e sincroniza entre páginas) ─────────
(function () {
  const audio = document.getElementById("bg-audio");
  if (!audio) return;

  audio.volume = 0.18;
  audio.loop = true;

  // Restaura a posição salva da música (compartilhada entre convite e confirmação)
  function applySavedTime() {
    const savedTime = parseFloat(localStorage.getItem("audioTime"));
    if (!isNaN(savedTime) && isFinite(savedTime) && savedTime > 0) {
      try {
        if (!audio.duration || savedTime < audio.duration) {
          audio.currentTime = savedTime;
        } else {
          audio.currentTime = savedTime % audio.duration;
        }
      } catch (_) {}
    }
  }

  applySavedTime();
  if (audio.readyState < 1) {
    audio.addEventListener("loadedmetadata", applySavedTime, { once: true });
    audio.addEventListener("canplay", applySavedTime, { once: true });
  }

  function startMusic() {
    if (!audio.paused) return;

    audio.volume = 0.18;
    audio.loop = true;
    applySavedTime();

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Bloqueio de autoplay estrito pelo navegador até primeira interação
      });
    }
  }

  // Inicia imediatamente ao carregar a página sem precisar interagir
  startMusic();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startMusic);
  }
  window.addEventListener("load", startMusic);
  window.addEventListener("pageshow", startMusic);

  // Fallback caso o navegador bloqueie autoplay antes de qualquer interação
  const userEvents = ["pointerdown", "touchstart", "click", "keydown", "scroll"];
  function handleInteraction() {
    if (audio.paused) {
      startMusic();
    }
  }

  userEvents.forEach((eventName) => {
    document.addEventListener(eventName, handleInteraction, { passive: true });
  });

  // Salva a posição continuamente para manter sincronizado com a confirmação
  audio.addEventListener("timeupdate", () => {
    if (!audio.paused && audio.currentTime > 0) {
      localStorage.setItem("audioTime", audio.currentTime.toString());
    }
  });

  const saveAudioTime = () => {
    if (!audio.paused && audio.currentTime > 0) {
      localStorage.setItem("audioTime", audio.currentTime.toString());
    }
  };

  window.addEventListener("pagehide", saveAudioTime);
  window.addEventListener("beforeunload", saveAudioTime);
})();

// ── NAVEGAÇÃO SPA (convite ↔ confirmação sem recarregar) ─────────────────────
const inviteSection = document.querySelector(".page");
const confirmSection = document.getElementById("confirm-section");
const confirmBtn = document.getElementById("confirmBtn");
const backBtn = document.getElementById("backToInvite");

function showConfirm() {
  if (!inviteSection || !confirmSection) return;
  closeModal();
  inviteSection.style.display = "none";
  confirmSection.style.display = "flex";
  window.scrollTo(0, 0);
}

function showInvite() {
  if (!inviteSection || !confirmSection) return;
  confirmSection.style.display = "none";
  inviteSection.style.display = "flex";
  if (modal) {
    modal.style.removeProperty("display");
  }
  window.scrollTo(0, 0);
}

if (confirmBtn) {
  confirmBtn.addEventListener("click", showConfirm);
}

if (backBtn) {
  backBtn.addEventListener("click", showInvite);
}

// ── MODAL MENSAGEM DOS PAIS ──────────────────────────────────────────────────
const modal = document.getElementById("modal");
const openBtn = document.getElementById("storyBtn");
const closeBtn = document.getElementById("closeModal");
const backdrop = document.getElementById("modalBackdrop");

function openModal() {
  if (!modal) return;

  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  if (!modal) return;

  modal.classList.remove("open");
  document.body.style.overflow = "";
}

if (openBtn) {
  openBtn.addEventListener("click", openModal);
}

if (closeBtn) {
  closeBtn.addEventListener("click", closeModal);
}

if (backdrop) {
  backdrop.addEventListener("click", closeModal);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});

// ── FORMULÁRIO DE CONFIRMAÇÃO ────────────────────────────────────────────────

// Contador + / −
const countInput = document.getElementById("guest-count");
const decreaseBtn = document.getElementById("decreaseBtn");
const increaseBtn = document.getElementById("increaseBtn");

if (decreaseBtn && countInput) {
  decreaseBtn.addEventListener("click", () => {
    const value = parseInt(countInput.value, 10);
    if (value > 1) {
      countInput.value = value - 1;
    }
  });
}

if (increaseBtn && countInput) {
  increaseBtn.addEventListener("click", () => {
    const value = parseInt(countInput.value, 10);
    if (value < 10) {
      countInput.value = value + 1;
    }
  });
}

// Opções de presença
const radioCards = document.querySelectorAll(".radio-card");

radioCards.forEach((card) => {
  const input = card.querySelector("input[type='radio']");
  if (!input) return;

  const syncState = () => {
    card.classList.toggle("selected", input.checked);
  };

  input.addEventListener("change", syncState);
  syncState();
});

// Formulário → WhatsApp
const rsvpForm = document.getElementById("rsvp-form");

if (rsvpForm) {
  rsvpForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const feedback = document.getElementById("form-feedback");

    const name = document.getElementById("guest-name").value.trim();
    const phone = document.getElementById("guest-phone").value.trim();
    const count = countInput ? countInput.value : "1";
    const attendance = document.querySelector('input[name="attendance"]:checked')?.value || "Sim";

    if (!name || !phone) {
      if (feedback) {
        feedback.textContent = "Por favor, preencha nome e telefone.";
        feedback.className = "feedback error";
      }
      return;
    }

    const lion = "\uD83E\uDD81";
    let msg = "Olá! " + lion + " Confirmação de presença - 1º Aninho do Miguel:\n\n";
    msg += `*Nome:* ${name}\n`;
    msg += `*Telefone:* ${phone}\n`;
    msg += `*Pessoas:* ${count}\n`;
    msg += `*Presença:* ${attendance}\n`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://api.whatsapp.com/send?phone=556196642823&text=${encoded}`, "_blank");

    if (feedback) {
      feedback.textContent = "Mensagem aberta no WhatsApp! ✓";
      feedback.className = "feedback success";
    }
  });
}

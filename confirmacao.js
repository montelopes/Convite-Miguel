
"use strict";

// ── MÚSICA DE FUNDO (toca do início no carregamento e reinicia ao voltar) ────
(function () {
  const audio = document.getElementById("bg-audio");
  if (!audio) return;

  // Limpa qualquer posição salva residual anterior
  try {
    localStorage.removeItem("audioTime");
    sessionStorage.removeItem("audioTime");
  } catch (_) {}

  audio.volume = 0.18;
  audio.loop = true;
  try {
    audio.currentTime = 0;
  } catch (_) {}

  function startMusic() {
    if (document.hidden) return;

    audio.volume = 0.18;
    audio.loop = true;

    if (!audio.paused) return;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Bloqueio de autoplay estrito pelo navegador até primeira interação
      });
    }
  }

  function stopAndResetMusic() {
    audio.pause();
    try {
      audio.currentTime = 0;
    } catch (_) {}
  }

  // Inicia imediatamente ao carregar a página
  startMusic();

  if (audio.readyState < 3) {
    audio.addEventListener("canplay", () => {
      if (audio.paused) {
        startMusic();
      }
    }, { once: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      startMusic();
    });
  }
  window.addEventListener("load", () => {
    if (audio.paused) {
      startMusic();
    }
  });
  window.addEventListener("pageshow", () => {
    try {
      audio.currentTime = 0;
    } catch (_) {}
    startMusic();
  });

  // Ao sair do navegador, minimizar ou trocar de aba: pausa e zera a música
  // Ao retornar para o convite/navegador: recomeça do início
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAndResetMusic();
    } else {
      try {
        audio.currentTime = 0;
      } catch (_) {}
      startMusic();
    }
  });

  window.addEventListener("pagehide", stopAndResetMusic);
  window.addEventListener("beforeunload", stopAndResetMusic);

  // Fallback caso o navegador bloqueie autoplay antes de qualquer interação
  const userEvents = ["pointerdown", "touchstart", "click", "keydown", "scroll"];
  function handleInteraction() {
    if (audio.paused) {
      try {
        audio.currentTime = 0;
      } catch (_) {}
      startMusic();
    }
  }

  userEvents.forEach((eventName) => {
    document.addEventListener(eventName, handleInteraction, { passive: true });
  });
})();


// ── CONTADOR + / − ───────────────────────────────────────────────────────────

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


// ── OPÇÕES DE PRESENÇA ───────────────────────────────────────────────────────

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


// ── FORMULÁRIO → WHATSAPP ────────────────────────────────────────────────────

const rsvpForm = document.getElementById("rsvp-form");

if (rsvpForm) {
  rsvpForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const feedback = document.getElementById("form-feedback");

    const name = document
      .getElementById("guest-name")
      .value
      .trim();

    const phone = document
      .getElementById("guest-phone")
      .value
      .trim();

    const count = countInput
      ? countInput.value
      : "1";

    const attendance =
      document.querySelector(
        'input[name="attendance"]:checked'
      )?.value || "Sim";

    if (!name || !phone) {
      if (feedback) {
        feedback.textContent =
          "Por favor, preencha nome e telefone.";

        feedback.className =
          "feedback error";
      }

      return;
    }

    const lion = "\uD83E\uDD81";
    let msg =
      "Olá! " + lion + " Confirmação de presença - 1º Aninho do Miguel:\n\n";

    msg += `*Nome:* ${name}\n`;
    msg += `*Telefone:* ${phone}\n`;
    msg += `*Pessoas:* ${count}\n`;
    msg += `*Presença:* ${attendance}\n`;


    const encoded = encodeURIComponent(msg);

    window.open(
      `https://api.whatsapp.com/send?phone=556196642823&text=${encoded}`,
      "_blank"
    );


    if (feedback) {
      feedback.textContent =
        "Mensagem aberta no WhatsApp! ✓";

      feedback.className =
        "feedback success";
    }
  });
}

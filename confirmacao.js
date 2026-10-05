
"use strict";

// ── MÚSICA DE FUNDO ──────────────────────────────────────────────────────────
const audio = document.getElementById("bg-audio");

if (audio) {
  let started = false;

  // Restaura a posição salva da música
  const savedTime = parseFloat(localStorage.getItem("audioTime"));
  if (!isNaN(savedTime)) {
    audio.currentTime = savedTime;
  }

  function startMusic() {
    if (started) return;

    started = true;

    audio.volume = 0.18;
    audio.loop = true;

    audio.play().catch(() => {
      // O navegador pode bloquear o áudio até uma interação do usuário.
      started = false;
    });
  }

  // Salva a posição da música periodicamente
  setInterval(() => {
    if (started && !audio.paused) {
      localStorage.setItem("audioTime", audio.currentTime);
    }
  }, 500);

  // Salva a posição ao sair da página
  window.addEventListener("beforeunload", () => {
    if (started) {
      localStorage.setItem("audioTime", audio.currentTime);
    }
  });

  // Inicia a música quando o visitante interagir com a página
  ["pointerdown", "touchstart", "keydown", "scroll"].forEach((eventName) => {
    document.addEventListener(eventName, startMusic, {
      passive: true,
      once: true
    });
  });
}


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

    const note = document
      .getElementById("guest-note")
      .value
      .trim();


    if (!name || !phone) {
      if (feedback) {
        feedback.textContent =
          "Por favor, preencha nome e telefone.";

        feedback.className =
          "feedback error";
      }

      return;
    }


    let msg =
      "Olá! 🦁 Confirmação de presença - 1º Aninho do Miguel:\n\n";

    msg += `*Nome:* ${name}\n`;
    msg += `*Telefone:* ${phone}\n`;
    msg += `*Pessoas:* ${count}\n`;
    msg += `*Presença:* ${attendance}\n`;

    if (note) {
      msg += `*Obs:* ${note}\n`;
    }


    const encoded = encodeURIComponent(msg);

    window.open(
      `https://wa.me/5561996985008?text=${encoded}`,
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

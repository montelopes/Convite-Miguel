
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


// ── SELEÇÃO DE QUANTIDADE E ACOMPANHANTES ──────────────────────────────────
const guestCountSelect = document.getElementById("guest-count");
const companionField = document.getElementById("companion-field");
const companionInput = document.getElementById("companion-names");
const companionLabel = document.getElementById("companion-label");
const companionHint = document.getElementById("companion-hint");
const guestNameInput = document.getElementById("guest-name");
const guestPhoneInput = document.getElementById("guest-phone");
const radioCards = document.querySelectorAll(".radio-card");

function updateGuestAndCompanionsUI() {
  if (!guestCountSelect) return;

  const countVal = guestCountSelect.value;
  const count = parseInt(countVal, 10);
  const attendance = document.querySelector('input[name="attendance"]:checked')?.value || "Sim";

  if (countVal) {
    guestCountSelect.classList.remove("placeholder-active");
  } else {
    guestCountSelect.classList.add("placeholder-active");
  }

  // Se não puder ir ou não tiver selecionado quantidade > 1, oculta acompanhantes
  if (attendance === "Não" || !count || count <= 1) {
    if (companionField) {
      companionField.style.display = "none";
      companionField.classList.remove("is-visible");
    }
    return;
  }

  // Se selecionou mais de 1 pessoa e confirmou presença
  if (companionField) {
    companionField.style.display = "flex";
    companionField.classList.add("is-visible");

    const companionsCount = count - 1;
    if (companionsCount === 1) {
      if (companionLabel) companionLabel.innerHTML = 'Nome do acompanhante <span class="required-mark">*</span>';
      if (companionInput) companionInput.placeholder = "Nome completo de quem vai com você";
      if (companionHint) companionHint.textContent = "1 acompanhante além de você.";
    } else {
      if (companionLabel) companionLabel.innerHTML = 'Nome dos acompanhantes <span class="required-mark">*</span>';
      if (companionInput) companionInput.placeholder = "Ex: Maria Silva, Pedro Santos...";
      if (companionHint) companionHint.textContent = `${companionsCount} acompanhantes além de você. Digite os nomes completos.`;
    }
  }
}

if (guestCountSelect) {
  guestCountSelect.addEventListener("change", () => {
    guestCountSelect.classList.remove("input-error");
    updateGuestAndCompanionsUI();
  });
}

if (companionInput) {
  companionInput.addEventListener("input", () => {
    companionInput.classList.remove("input-error");
  });
}

if (guestNameInput) {
  guestNameInput.addEventListener("input", () => {
    guestNameInput.classList.remove("input-error");
  });
}

if (guestPhoneInput) {
  guestPhoneInput.addEventListener("input", () => {
    guestPhoneInput.classList.remove("input-error");
  });
}

// ── OPÇÕES DE PRESENÇA ───────────────────────────────────────────────────────
radioCards.forEach((card) => {
  const input = card.querySelector("input[type='radio']");
  if (!input) return;

  const syncState = () => {
    card.classList.toggle("selected", input.checked);
    updateGuestAndCompanionsUI();
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

    // Limpa erros visuais anteriores
    [guestNameInput, guestPhoneInput, guestCountSelect, companionInput].forEach((el) => {
      if (el) el.classList.remove("input-error");
    });

    const name = guestNameInput ? guestNameInput.value.trim() : "";
    const phone = guestPhoneInput ? guestPhoneInput.value.trim() : "";
    const count = guestCountSelect ? guestCountSelect.value : "";
    const companionNames = companionInput ? companionInput.value.trim() : "";
    const attendance = document.querySelector('input[name="attendance"]:checked')?.value || "Sim";

    if (!name) {
      if (feedback) {
        feedback.textContent = "Por favor, preencha seu nome completo.";
        feedback.className = "feedback error";
      }
      if (guestNameInput) {
        guestNameInput.classList.add("input-error");
        guestNameInput.focus();
      }
      return;
    }

    if (!phone) {
      if (feedback) {
        feedback.textContent = "Por favor, preencha seu telefone.";
        feedback.className = "feedback error";
      }
      if (guestPhoneInput) {
        guestPhoneInput.classList.add("input-error");
        guestPhoneInput.focus();
      }
      return;
    }

    if (attendance === "Sim") {
      if (!count) {
        if (feedback) {
          feedback.textContent = "Por favor, selecione a quantidade de pessoas.";
          feedback.className = "feedback error";
        }
        if (guestCountSelect) {
          guestCountSelect.classList.add("input-error");
          guestCountSelect.focus();
        }
        return;
      }

      const numCount = parseInt(count, 10);
      if (numCount > 1 && !companionNames) {
        if (feedback) {
          feedback.textContent = numCount === 2
            ? "Por favor, informe o nome do seu acompanhante."
            : "Por favor, informe o nome dos acompanhantes que irão com você.";
          feedback.className = "feedback error";
        }
        if (companionInput) {
          companionInput.classList.add("input-error");
          companionInput.focus();
        }
        return;
      }
    }

    const lion = "\uD83E\uDD81";
    let msg = "Olá! " + lion + " Confirmação de presença - 1º Aninho do Miguel:\n\n";
    msg += `*Nome:* ${name}\n`;
    msg += `*Telefone:* ${phone}\n`;

    if (attendance === "Não") {
      msg += `*Presença:* Não poderei ir\n`;
    } else {
      msg += `*Presença:* Sim, confirmo presença\n`;
      msg += `*Total de pessoas:* ${count}\n`;
      if (parseInt(count, 10) > 1 && companionNames) {
        const labelComp = parseInt(count, 10) === 2 ? "Acompanhante" : "Acompanhantes";
        msg += `*${labelComp}:* ${companionNames}\n`;
      }
    }

    const encoded = encodeURIComponent(msg);
    window.open(
      `https://api.whatsapp.com/send?phone=556196642823&text=${encoded}`,
      "_blank"
    );

    if (feedback) {
      feedback.textContent = "Mensagem aberta no WhatsApp! ✓";
      feedback.className = "feedback success";
    }
  });
}

updateGuestAndCompanionsUI();


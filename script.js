
"use strict";

(function () {
  const audio = document.getElementById("bg-audio");

  if (!audio) return;

  let started = false;

  function startMusic() {
    if (started) return;

    audio.volume = 0.18;
    audio.loop = true;

    audio.play()
      .then(() => {
        started = true;
      })
      .catch(() => {});
  }

  ["pointerdown", "touchstart", "keydown", "scroll"].forEach((eventName) => {
    document.addEventListener(eventName, startMusic, {
      passive: true,
      once: true
    });
  });
})();

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

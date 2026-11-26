document.addEventListener("DOMContentLoaded", () => {
  /* =========================================================
     1. PRECARGA DEL VIDEO DEL SOBRE Y TRANSICIÓN DE APERTURA
     ========================================================= */
  const introOverlay = document.getElementById("introOverlay");
  const envelopeVideo = document.getElementById("envelopeVideo");
  const sealTrigger = document.getElementById("sealTrigger");
  const loaderBox = document.getElementById("loaderBox");
  const loaderBar = document.getElementById("loaderBar");
  const loaderText = document.getElementById("loaderText");
  const tapPrompt = document.getElementById("tapPrompt");
  const introHint = document.getElementById("introHint");

  let isReady = false;
  let isOpened = false;

  function enableSeal() {
    if (isReady) return;
    isReady = true;
    loaderBar.style.width = "100%";
    loaderText.textContent = "Cargando 100%";
    setTimeout(() => {
      loaderBox.classList.add("hidden");
      tapPrompt.classList.remove("is-hidden");
      sealTrigger.disabled = false;
    }, 250);
  }

  // Monitorear progreso real de descarga/buffer del video
  function updateBufferProgress() {
    if (!envelopeVideo.duration || isReady) return;
    try {
      if (envelopeVideo.buffered.length > 0) {
        const bufferedEnd = envelopeVideo.buffered.end(envelopeVideo.buffered.length - 1);
        const pct = Math.min(100, Math.round((bufferedEnd / envelopeVideo.duration) * 100));
        loaderBar.style.width = `${pct}%`;
        loaderText.textContent = `Cargando ${pct}%`;
        if (pct >= 95) enableSeal();
      }
    } catch (_) {
      // Ignorar si aún no hay rangos disponibles
    }
  }

  envelopeVideo.addEventListener("progress", updateBufferProgress);
  envelopeVideo.addEventListener("canplaythrough", enableSeal);

  // Respaldo por si el navegador limita eventos de buffer en móvil
  let fallbackPct = 0;
  const fallbackTimer = setInterval(() => {
    if (isReady) {
      clearInterval(fallbackTimer);
      return;
    }
    fallbackPct = Math.min(92, fallbackPct + 12);
    if (parseInt(loaderBar.style.width || "0", 10) < fallbackPct) {
      loaderBar.style.width = `${fallbackPct}%`;
      loaderText.textContent = `Cargando ${fallbackPct}%`;
    }
    if (envelopeVideo.readyState >= 3 || fallbackPct >= 92) {
      clearInterval(fallbackTimer);
      enableSeal();
    }
  }, 220);

  // Al tocar el sello: reproducir video del sobre
  function openEnvelope() {
    if (isOpened) return;
    isOpened = true;
    introHint.classList.add("hide-hint");

    envelopeVideo.play().catch(() => {
      finishIntro();
    });
  }

  sealTrigger.addEventListener("click", openEnvelope);
  introOverlay.addEventListener("click", (e) => {
    if (isReady && !isOpened && e.target !== sealTrigger) {
      openEnvelope();
    }
  });

  // Revelar invitación justo antes de terminar el video (o al terminar)
  let revealTriggered = false;
  function finishIntro() {
    if (revealTriggered) return;
    revealTriggered = true;
    introOverlay.classList.add("fade-out");
    document.body.classList.remove("locked");
    triggerInitialReveals();
  }

  envelopeVideo.addEventListener("timeupdate", () => {
    if (
      envelopeVideo.duration &&
      envelopeVideo.currentTime >= envelopeVideo.duration - 0.45
    ) {
      finishIntro();
    }
  });

  envelopeVideo.addEventListener("ended", finishIntro);

  /* =========================================================
     2. CUENTA REGRESIVA EN VIVO
     ========================================================= */
  const countdownGrid = document.getElementById("countdownGrid");
  const cdDays = document.getElementById("cdDays");
  const cdHours = document.getElementById("cdHours");
  const cdMinutes = document.getElementById("cdMinutes");
  const cdSeconds = document.getElementById("cdSeconds");

  if (countdownGrid) {
    const targetDate = new Date(countdownGrid.dataset.target).getTime();

    function updateCountdown() {
      const now = Date.now();
      const diff = Math.max(0, targetDate - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      cdDays.textContent = String(days).padStart(2, "0");
      cdHours.textContent = String(hours).padStart(2, "0");
      cdMinutes.textContent = String(minutes).padStart(2, "0");
      cdSeconds.textContent = String(seconds).padStart(2, "0");
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  /* =========================================================
     3. ANIMACIONES DE APARICIÓN AL HACER SCROLL
     ========================================================= */
  const revealEls = document.querySelectorAll(".reveal");

  function triggerInitialReveals() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealEls.forEach((el) => observer.observe(el));
  }

  /* =========================================================
     4. PERSONALIZACIÓN DESDE LA URL (?dr=clave o /consejo)
     ========================================================= */
  const invitados = {
    espinoza: "Dr. Luis Ernesto Espinoza",
    aguirre: "Dr. Alfredo Aguirre",
    sandoval: "Dra. Ana Gloria Sandoval",
    sanchez: "Dr. Roberto Edmundo Sánchez Ochoa",
    consejo: {
      saludo: "Estimado",
      nombre: "Consejo Técnico",
      mensaje: "Es un honor invitarlos a nuestra jornada 18° de GyO.",
      titulo: "Invitación para el Consejo Técnico — Jornada 18° de GyO"
    }
  };

  const rutasEspeciales = {
    consejo: "consejo",
    "consejo-tecnico": "consejo"
  };

  const params = new URLSearchParams(window.location.search);
  const pathSlug = window.location.pathname.replace(/^\/+|\/+$/g, "").toLowerCase();
  const hashSlug = window.location.hash.replace(/^#/, "").toLowerCase().trim();
  const drParam = (params.get("dr") || "").toLowerCase().trim();
  const clave = drParam || rutasEspeciales[pathSlug] || rutasEspeciales[hashSlug] || "";

  if (Object.hasOwn(invitados, clave)) {
    const entrada = invitados[clave];
    const salutationEl = document.getElementById("inviteSalutation");
    const guestEl = document.getElementById("inviteGuest");
    const messageEl = document.getElementById("inviteMessage");

    let saludo;
    let nombre;
    let mensaje;
    let titulo;

    if (typeof entrada === "string") {
      const esDoctora = /^dra\.?\b|^doctora\b/i.test(entrada);
      saludo = esDoctora ? "Estimada" : "Estimado";
      nombre = entrada;
      mensaje = `Es un honor ${esDoctora ? "invitarla" : "invitarlo"} a nuestra jornada 18° de GyO.`;
      titulo = `Invitación para ${entrada} — Jornada 18° de GyO`;
    } else {
      saludo = entrada.saludo;
      nombre = entrada.nombre;
      mensaje = entrada.mensaje;
      titulo = entrada.titulo || `Invitación para ${entrada.nombre} — Jornada 18° de GyO`;
    }

    if (salutationEl) salutationEl.textContent = saludo;
    if (guestEl) guestEl.textContent = nombre;
    if (messageEl) messageEl.textContent = mensaje;
    document.title = titulo;
  }
});

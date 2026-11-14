// Configuração central de atendimento (WhatsApp oficial Team Lobo)
const WHATSAPP_NUMBER = "5511992890538";

// 1. Preenchimento automático dos links de WhatsApp
document.querySelectorAll("[data-wa]").forEach((el) => {
  const message = el.getAttribute("data-wa");
  el.href = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;
  el.target = "_blank";
  el.rel = "noopener noreferrer";
});

// 2. Alternância de Tema Claro / Escuro com persistência
const themeToggle = document.getElementById("theme-toggle");
const metaTheme = document.getElementById("meta-theme-color");

function updateMetaTheme(theme) {
  if (metaTheme) {
    metaTheme.setAttribute("content", theme === "light" ? "#F8FAFC" : "#0A0D12");
  }
}

updateMetaTheme(document.documentElement.getAttribute("data-theme"));

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("tl-theme", next);
    updateMetaTheme(next);
  });
}

// 3. Menu Mobile
const menuToggle = document.getElementById("menu-toggle");
const mainNav = document.getElementById("main-nav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// 4. Barra de progresso de leitura
const progressBar = document.querySelector(".scroll-progress");
window.addEventListener(
  "scroll",
  () => {
    if (!progressBar) return;
    const doc = document.documentElement;
    const maxScroll = doc.scrollHeight - doc.clientHeight || 1;
    const ratio = Math.min(Math.max(doc.scrollTop / maxScroll, 0), 1);
    progressBar.style.transform = `scaleX(${ratio})`;
  },
  { passive: true }
);

// 5. Reveal suave ao entrar na viewport (IntersectionObserver)
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealElements = document.querySelectorAll(".reveal");

if (prefersReducedMotion) {
  revealElements.forEach((el) => el.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  revealElements.forEach((el) => revealObserver.observe(el));
}

// 6. Contadores numéricos animados
const counters = document.querySelectorAll("[data-count]");

function animateCounter(el) {
  const target = Number(el.dataset.count);
  const prefix = el.dataset.prefix || "";
  if (prefersReducedMotion) {
    el.textContent = prefix + target;
    return;
  }

  const duration = 1300;
  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = prefix + Math.round(target * eased);
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

counters.forEach((counter) => counterObserver.observe(counter));

// 7. Ano automático no rodapé
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

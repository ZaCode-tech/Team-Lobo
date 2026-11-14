const WHATSAPP = "5511992890538"; // WhatsApp para novos alunos (o mesmo do site atual)
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const root = document.documentElement;

// WhatsApp com mensagem pronta
document.querySelectorAll("[data-wa]").forEach((a) => {
  a.href = `https://api.whatsapp.com/send?phone=${WHATSAPP}&text=${encodeURIComponent(a.dataset.wa)}`;
  a.target = "_blank"; a.rel = "noopener noreferrer";
});

// Modo claro/escuro com revelação circular (View Transitions)
const themeBtn = document.querySelector(".theme");
const apply = (t) => { root.dataset.theme = t; try { localStorage.setItem("tl-theme", t); } catch (e) {} };
themeBtn.addEventListener("click", (e) => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  if (!document.startViewTransition || reduce) return apply(next);
  const x = e.clientX, y = e.clientY, r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  document.startViewTransition(() => apply(next)).ready.then(() =>
    root.animate({ clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
      { duration: 600, easing: "ease-in", pseudoElement: "::view-transition-new(root)" }));
});

// Título revelado palavra por palavra
document.querySelectorAll("[data-split]").forEach((el) => {
  el.innerHTML = el.textContent.trim().split(/\s+/).map((w, i) => `<span class="w" style="--i:${i}"><span>${w}</span></span>`).join(" ");
});

// Contadores
const run = (el) => {
  const end = +el.dataset.count, pre = el.dataset.prefix || "";
  if (reduce) { el.textContent = pre + end; return; }
  const t0 = performance.now();
  const tick = (t) => { const p = Math.min((t - t0) / 1400, 1); el.textContent = pre + Math.round(end * (1 - (1 - p) ** 3)); if (p < 1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
};
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } }), { threshold: 0.6 });
document.querySelectorAll("[data-count]").forEach((c) => io.observe(c));

// Luz que segue o cursor nos cartões
document.querySelectorAll(".plan, .card").forEach((c) => c.addEventListener("pointermove", (e) => {
  const r = c.getBoundingClientRect();
  c.style.setProperty("--x", e.clientX - r.left + "px"); c.style.setProperty("--y", e.clientY - r.top + "px");
}));

if (!reduce) {
  document.querySelectorAll(".mag").forEach((b) => {
    b.addEventListener("pointermove", (e) => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.2}px,${(e.clientY - r.top - r.height / 2) * 0.3}px)`; });
    b.addEventListener("pointerleave", () => (b.style.transform = ""));
  });
  const stage = document.querySelector(".stage");
  stage.parentElement.addEventListener("pointermove", (e) => {
    const r = stage.getBoundingClientRect();
    stage.style.setProperty("--tx", ((e.clientX - r.left) / r.width - 0.5).toFixed(2));
    stage.style.setProperty("--ty", ((e.clientY - r.top) / r.height - 0.5).toFixed(2));
  });
  stage.parentElement.addEventListener("pointerleave", () => { stage.style.setProperty("--tx", 0); stage.style.setProperty("--ty", 0); });
}

/* ===== Hero: a rolagem controla a fase da lua e quem aparece =====
   lua cheia = lobo · minguante = homem, depois mulher */
const pin = document.querySelector(".pin");
const carve = document.querySelector(".carve");
const names = ["wolf", "man", "woman"];
const figs = names.map((n) => document.querySelector(".fig." + n));
const label = document.querySelector(".phase");
const text = { wolf: "Lua cheia · O lobo", man: "Minguante · Ele", woman: "Minguante · Ela" };
const LOOP = 42;
const KEYS = {
  u:     [[0, 1], [4, 1], [10, 0], [15, 0], [21, 1], [25, 1], [31, 0], [36, 0], [42, 1]],
  wolf:  [[0, 1], [4.5, 1], [7, 0], [17.5, 0], [20, 1], [25.5, 1], [28, 0], [38.5, 0], [41, 1], [42, 1]],
  man:   [[0, 0], [6.5, 0], [9.5, 1], [15, 1], [17.5, 0], [42, 0]],
  woman: [[0, 0], [27.5, 0], [30.5, 1], [36, 1], [38.5, 0], [42, 0]],
};
const ease = (x) => x * x * (3 - 2 * x);
const sample = (k, t) => {
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) { const [t0, v0] = k[i - 1], [t1, v1] = k[i]; return v0 + (v1 - v0) * ease((t - t0) / (t1 - t0)); }
  return k[k.length - 1][1];
};
const blur = innerWidth < 700 ? 8 : 14;
let current = "";
const render = (t) => {
  const u = sample(KEYS.u, t);
  carve.setAttribute("transform", `translate(${(14 + 246 * u).toFixed(1)} ${(-5 - 85 * u).toFixed(1)})`);
  let best = ["wolf", 0];
  figs.forEach((el, i) => {
    const o = sample(KEYS[names[i]], t);
    el.style.visibility = o < 0.01 ? "hidden" : "visible";
    el.style.opacity = o.toFixed(3);
    el.style.filter = o > 0.995 ? "none" : `blur(${((1 - o) * blur).toFixed(1)}px) brightness(${(1 + (1 - o) * 1.2).toFixed(2)})`;
    if (o > best[1]) best = [names[i], o];
  });
  if (best[0] !== current && best[1] > 0.5) { current = best[0]; label.textContent = text[current]; }
};
render(0);
if (!reduce) {
  let ticking = false;
  const onScroll = () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const r = pin.getBoundingClientRect();
      render(Math.min(1, Math.max(0, -r.top / (r.height - innerHeight))) * LOOP);
      ticking = false;
    });
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

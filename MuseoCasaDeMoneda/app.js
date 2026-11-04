// 1. Importamos los datos desde el archivo piezas.js
import { PIECES, BACKS } from "./monedas.js";

/* ============ Generadores de ilustraciones (SVG) ============ */
let _id = 0;
const uid = (p) => `${p}${++_id}`;

const PAL = {
  oro: ["#fbe9b4", "#d4a94c", "#7a5218"],
  plata: ["#fafafa", "#b3b3b8", "#5b5b61"],
  cobre: ["#f6c39b", "#bb6a3f", "#5a2813"],
  bronce: ["#e9cf92", "#a9803a", "#4e3714"],
  bimetal: ["#f3f3f3", "#a8a8ad", "#4f4f55"],
};

/* ============ Hero: capa de monedas y billetes flotantes ============ */
const heroLayers = document.getElementById("heroLayers");
const heroItems = [
  // [indice pieza, left%, top%, ancho px, rot, opacidad, blur, profundidad, dy, dur]
  [0, 4, 12, 220, -14, 0.55, 0, 0.06, -26, 15],
  [8, 62, 6, 360, 8, 0.35, 2, 0.03, -18, 18],
  [4, 82, 18, 190, 16, 0.6, 0, 0.08, -30, 13],
  [10, 70, 58, 330, -9, 0.5, 1, 0.05, -22, 17],
  [1, 14, 64, 230, 10, 0.65, 0, 0.09, -28, 14],
  [9, 0, 36, 340, 12, 0.28, 3, 0.02, -14, 20],
  [2, 40, 82, 150, -22, 0.55, 1, 0.07, -26, 12],
  [6, 90, 70, 170, 20, 0.45, 2, 0.06, -20, 16],
  [7, 28, 2, 170, 8, 0.4, 2, 0.04, -20, 19],
  [3, 52, 70, 190, -6, 0.5, 1, 0.07, -24, 15],
  [11, 24, 30, 400, -6, 0.2, 4, 0.015, -10, 24],
  [5, 94, 42, 140, 6, 0.4, 2, 0.05, -22, 14],
  [0, 46, 22, 120, 28, 0.22, 3, 0.035, -16, 18],
  [8, 5, 82, 300, -10, 0.3, 2, 0.04, -18, 21],
];
const layerEls = [];
heroItems.forEach(([i, l, t, w, rot, op, blur, depth, dy, dur], n) => {
  const wrap = document.createElement("div");
  wrap.className = "absolute will-change-transform";
  wrap.style.cssText = `left:${l}%;top:${t}%;width:${w}px;max-width:40vw;`;
  wrap.dataset.depth = depth;
  const inner = document.createElement("div");
  inner.className = "float-in";
  inner.style.cssText = `--r:${rot}deg;--dy:${dy}px;--dr:${rot > 0 ? 5 : -5}deg;--dur:${dur}s;--delay:${-n * 1.3}s;opacity:${op};filter:blur(${blur}px) saturate(1.05);transform:rotate(${rot}deg)`;
  inner.innerHTML = PIECES[i].svg();
  const svgEl = inner.querySelector("svg");
  if (svgEl) {
    svgEl.classList.remove("piece");
  }
  wrap.appendChild(inner);
  heroLayers.appendChild(wrap);
  layerEls.push(wrap);
});

/* Parallax (ratón + scroll) */
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
let mx = 0,
  my = 0,
  tx = 0,
  ty = 0;
function applyParallax() {
  tx += (mx - tx) * 0.06;
  ty += (my - ty) * 0.06;
  const sy = window.scrollY;
  layerEls.forEach((el) => {
    const d = parseFloat(el.dataset.depth);
    el.style.transform = `translate3d(${(tx * d * -400).toFixed(1)}px, ${(ty * d * -400 - sy * d * 1.6).toFixed(1)}px, 0)`;
  });
  requestAnimationFrame(applyParallax);
}
if (!reduce) {
  window.addEventListener("mousemove", (e) => {
    mx = e.clientX / innerWidth - 0.5;
    my = e.clientY / innerHeight - 0.5;
  });
  requestAnimationFrame(applyParallax);
}

/* ============ Cuadrícula ============ */
const grid = document.getElementById("grid");
function renderGrid(filter = "all") {
  grid.innerHTML = "";
  PIECES.filter((p) => filter === "all" || p.type === filter).forEach((p) => {
    const isBill = p.type === "billete";
    const el = document.createElement("article");
    el.className = "card group " + (isBill ? "col-span-2" : "");
    el.tabIndex = 0;
    el.setAttribute("role", "button");
    el.setAttribute("aria-label", `Ver detalle: ${p.name}`);
    el.innerHTML = `
      <div class="relative flex items-center justify-center px-6 pt-9 pb-5 ${isBill ? "h-60 sm:h-64" : "h-52 sm:h-60"}">
        <span class="flip-badge" aria-hidden="true">↻ 2 CARAS</span>
        <div class="flip-scene ${isBill ? "w-full max-w-xs" : "w-32 sm:w-40"}">
          <div class="flipper">
            <div class="face">${p.svg()}</div>
            <div class="face back">${p.back()}</div>
          </div>
        </div>
        <div class="plinth"></div>
      </div>
      <div class="relative px-5 pb-5 pt-3 border-t border-oro/10">
        <p class="font-display tracking-[.3em] text-[10px] text-magenta uppercase">${p.type} · ${p.year}</p>
        <h3 class="font-serif text-xl sm:text-2xl leading-tight mt-1 text-marfil">${p.name}</h3>
        <p class="mt-2 text-[11px] tracking-[.2em] text-oro/80 opacity-0 group-hover:opacity-100 transition">VER FICHA →</p>
      </div>`;
    el.addEventListener("click", () => openModal(p, el));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(p, el);
      }
    });
    grid.appendChild(el);
  });
}
renderGrid();

document.querySelectorAll("#filters .chip").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll("#filters .chip")
      .forEach((b) => b.setAttribute("aria-pressed", "false"));
    btn.setAttribute("aria-pressed", "true");
    renderGrid(btn.dataset.filter);
  });
});

/* ============ Modal ============ */
const modal = document.getElementById("modal");
let lastFocus = null;

/* Giro anverso / reverso */
const flipCard = document.getElementById("flipCard");
const mFront = document.getElementById("mFront");
const mBack = document.getElementById("mBack");
let currentPiece = null,
  showingBack = false;
function setFace(back) {
  showingBack = back;
  flipCard.style.transform = back ? "rotateY(180deg)" : "rotateY(0deg)";
  document
    .querySelectorAll("[data-face]")
    .forEach((b) =>
      b.setAttribute(
        "aria-pressed",
        String((b.dataset.face === "back") === back),
      ),
    );
  document.getElementById("mFaceLabel").textContent = back
    ? "REVERSO"
    : "ANVERSO";
  if (currentPiece)
    document.getElementById("mFaceNote").textContent = back
      ? currentPiece.backNote
      : currentPiece.frontNote;
}
document
  .querySelectorAll("[data-face]")
  .forEach((b) =>
    b.addEventListener("click", () => setFace(b.dataset.face === "back")),
  );
document
  .getElementById("flipScene")
  .addEventListener("click", () => setFace(!showingBack));
document.addEventListener("keydown", (e) => {
  if (!modal.classList.contains("open")) return;
  if (
    e.key === "ArrowLeft" ||
    e.key === "ArrowRight" ||
    e.key.toLowerCase() === "f"
  )
    setFace(!showingBack);
});
function openModal(p, trigger) {
  lastFocus = trigger || document.activeElement;
  currentPiece = p;
  mFront.innerHTML = p.svg();
  mBack.innerHTML = p.back();
  document
    .querySelectorAll("#mFront .piece, #mBack .piece")
    .forEach((s) => s.classList.remove("piece"));
  flipCard.style.transition = "none";
  setFace(false);
  void flipCard.offsetWidth;
  flipCard.style.transition = "";
  document.getElementById("mType").textContent = p.type.toUpperCase();
  document.getElementById("mTitle").textContent = p.name;
  document.getElementById("mYear").textContent = p.year;
  document.getElementById("mMat").textContent = p.material;
  document.getElementById("mDen").textContent = p.denom;
  document.getElementById("mContext").innerHTML = p.context
    .map((t) => `<p>${t}</p>`)
    .join("");
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  document.getElementById("closeBtn").focus();
}
function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (lastFocus) lastFocus.focus();
}
document.getElementById("closeBtn").addEventListener("click", closeModal);
document.getElementById("closeBtn2").addEventListener("click", closeModal);
document.getElementById("backdrop").addEventListener("click", closeModal);
document.addEventListener("keydown", (e) => {
  if (!modal.classList.contains("open")) return;
  if (e.key === "Escape") closeModal();
  if (e.key === "Tab") {
    // trampa de foco
    const f = modal.querySelectorAll("button");
    const first = f[0],
      last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

/* ============ Sección "El Museo": arte decorativo ============ */
document.getElementById("aboutArt").innerHTML = `
  <div class="relative w-full max-w-md aspect-square">
    <div class="absolute inset-0 rounded-full bg-gradient-to-br from-vino/40 to-transparent blur-2xl"></div>
    <div class="absolute left-0 top-6 w-2/3" style="transform:rotate(-8deg)">${PIECES[10].svg()}</div>
    <div class="absolute right-0 bottom-4 w-1/2" style="transform:rotate(10deg)">${PIECES[0].svg()}</div>
    <div class="absolute left-10 bottom-0 w-1/3" style="transform:rotate(-14deg)">${PIECES[1].svg()}</div>
  </div>`;

/* ============ Reveal al hacer scroll + año ============ */
const io = new IntersectionObserver(
  (es) =>
    es.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    }),
  { threshold: 0.15 },
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
document.getElementById("year").textContent = new Date().getFullYear();

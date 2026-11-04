/* Silnik lekcji: model narracji, zegar bloku, Cue, narzędzia. Wspólny dla całego kursu. */
import React, { createContext, useContext } from "react";
import htm from "htm";

export const html = htm.bind(React.createElement);

export const PAUSE_W = 11;   // pauza [pause] liczona jak 11 znaków
export const CPS = 14.5;     // tempo lektora (znaki/s), gdy nie ma jeszcze MP3
/* Media z Supabase Storage (bucket „media”, projekt ai-sales-hero). Lokalnie można nadpisać: VITE_MEDIA_BASE=/media */
export const MEDIA_BASE = (import.meta.env.VITE_MEDIA_BASE || "https://pvdjwmzcvgqgyiwaddbb.supabase.co/storage/v1/object/public/media").replace(/\/$/, "");

/* Tekst lektora ma zapis fonetyczny dla ElevenLabs; na ekranie (napisy) pokazujemy zapis normalny. */
const SAY_TO_SCREEN = [[/Czat-dżi-pi-ti/g, "ChatGPT"], [/n-eight-n/g, "n8n"], [/a-pe-i/g, "API"], [/bi-tu-bi/g, "B2B"]];
export const disp = s => SAY_TO_SCREEN.reduce((a, [re, to]) => a.replace(re, to), s);

/* Przygotowuje bloki: czysty tekst, mapa znak → oś czasu, szacowany czas, zdania do napisów, ścieżka audio. */
export function prepareLesson(lesson) {
  lesson.blocks.forEach(b => {
    b.audioPath = `${MEDIA_BASE}/audio/${lesson.id}/${lesson.id}_B${String(b.n).padStart(2, "0")}.mp3`;
    let clean = "", w = 0; const map = [];
    b.text.split("[pause]").forEach((p, i, arr) => {
      const seg = i === 0 ? p : p.replace(/^\s+/, " ");
      for (const ch of seg) { map.push(w); clean += ch; w += 1; }
      if (i < arr.length - 1) w += PAUSE_W;
    });
    b.clean = clean; b.map = map; b.W = w; b.est = Math.max(4, w / CPS);
    const re = /[^.?!…]+[.?!…]+["”]?|[^.?!…]+$/g; let m; b.sents = [];
    while ((m = re.exec(clean))) { const s = m[0].trim(); if (s) b.sents.push({ s: disp(s), a: map[m.index] ?? 0 }); }
  });
  return lesson;
}

export function fracOf(b, phrase) {
  if (!phrase) return 0;
  const i = b.clean.toLowerCase().indexOf(phrase.toLowerCase());
  return i < 0 ? 0 : (b.map[i] ?? 0) / b.W;
}

export const fmt = s => { s = Math.max(0, Math.round(s || 0)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };

export const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* prototyp: bez zapisu */ } }
};

let toastT;
export function toast(msg) {
  const el = document.getElementById("toast"); if (!el) return;
  el.textContent = msg; el.classList.add("show");
  clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove("show"), 2600);
}

export function copyText(text) {
  const fall = () => {
    const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); toast("Skopiowane."); } catch (e) { toast("Zaznacz tekst i skopiuj ręcznie."); }
    ta.remove();
  };
  try { navigator.clipboard.writeText(text).then(() => toast("Skopiowane."), fall); } catch (e) { fall(); }
}

/* Zegar bloku: b (blok), t (s), D (długość), f (0–1), rest (scena w spoczynku = wszystko widać). */
export const Clock = createContext({ b: null, t: 0, D: 1, f: 0, rest: true });
export const useOn = () => { const c = useContext(Clock); return say => c.rest || c.f >= fracOf(c.b, say) - 1e-4; };

/* Element pojawia się w chwili, gdy lektor mówi frazę `say`. */
export function Cue({ say, cls = "", as = "div", children, ...rest }) {
  const c = useContext(Clock); const on = !c.rest && c.f >= fracOf(c.b, say) - 1e-4;
  return React.createElement(as, { className: `cue ${cls}${on ? " on" : ""}`, ...rest }, children);
}

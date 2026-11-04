/* Quiz i mikroquiz: pytanie po pytaniu, wyjaśnienie każdej odpowiedzi, „pewny / zgaduję” w quizie końcowym, zaliczenie 3 z 4. */
import { html } from "./core.js";

const fill = (t, s, n) => (t || "").replace("{s}", s).replace("{n}", n);

export function Quiz({ data, forms, setForm, kind, texts = {} }) {
  const key = kind + "_"; const i = forms[key + "i"] || 0; const q = data[i];
  const picked = forms[key + "p" + i]; const conf = forms[key + "c" + i];
  const score = data.filter((qq, k) => forms[key + "p" + k] === qq.ok).length;
  const pass = kind === "micro" ? true : score >= passMark(data);
  const retry = () => { data.forEach((_, k) => { setForm(key + "p" + k, undefined); setForm(key + "c" + k, undefined); }); setForm(key + "i", 0); setForm(key + "done", false); };

  if (i >= data.length) return html`
  <div className="quiz">
    <div className="qh"><span className="qn">${kind === "micro" ? "Mikroquiz · koniec" : "Quiz końcowy · wynik"}</span></div>
    <div className="score"><div className="n"><em>${score}</em> / ${data.length}</div>
      <div>${kind === "micro" ? texts.microEnd : fill(pass ? texts.finalPass : texts.finalFail, score, data.length)}</div>
      ${pass && kind === "final" && html`<span className="badge">★ ${texts.finalBadge || "Zaliczone"}</span>`}
      ${!pass && html`<button className="btn" onClick=${retry}>Spróbuj jeszcze raz</button>`}
    </div>
  </div>`;

  return html`
  <div className="quiz">
    <div className="qh"><span className="qn">${kind === "micro" ? "Mikroquiz" : `Quiz końcowy · zaliczenie ${passMark(data)} z ${data.length}`} · ${i + 1}/${data.length}</span>
      ${kind === "final" && html`<div className="conf">Jestem: <button className=${conf === "pewny" ? "on" : ""} onClick=${() => setForm(key + "c" + i, "pewny")}>pewny</button><button className=${conf === "zgaduję" ? "on" : ""} onClick=${() => setForm(key + "c" + i, "zgaduję")}>zgaduję</button></div>`}
    </div>
    <h3 className="q">${q.q}</h3>
    <div className="opts">${q.a.map(([t], k) => html`<button key=${k} className=${"opt" + (picked != null ? (k === q.ok ? " right" : (k === picked ? " wrong" : "")) : "")} disabled=${picked != null} onClick=${() => setForm(key + "p" + i, k)}><span className="k">${"ABCD"[k]}</span><span>${t}</span></button>`)}</div>
    ${picked != null && html`<div className=${"expl" + (picked === q.ok ? "" : " bad")}><b>${picked === q.ok ? ["Dokładnie tak.", "Zgadza się.", "Tak."][i % 3] : (conf === "pewny" ? "Byłeś pewny, a odpowiedź jest inna. To najcenniejszy moment w quizie." : (conf === "zgaduję" ? "Zgadywałeś. Dobrze, że zaznaczyłeś." : "Nie do końca."))}</b>${q.a[picked][1]}</div>
      <div className="row-actions"><button className="btn primary" onClick=${() => { setForm(key + "i", i + 1); if (i + 1 >= data.length) setForm(key + "done", true); }}>${i + 1 < data.length ? "Następne pytanie →" : "Zobacz wynik"}</button></div>`}
  </div>`;
}

/* 75% zaokrąglone w górę: 4 pytania → 3, 5 → 4 */
export const passMark = data => Math.ceil(data.length * 0.75);

export const gateQuiz = (f, kind, data) => {
  const key = kind + "_"; const s = data.filter((q, k) => f[key + "p" + k] === q.ok).length;
  return !!f[key + "done"] && (kind === "micro" || s >= passMark(data));
};

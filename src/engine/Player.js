/* Odtwarzacz lekcji — jeden dla całego kursu. Lekcja dostarcza: dane (JSON), widoki bloków (views) i warunki „Dalej” (gates). */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { html, Clock, fmt, store, toast } from "./core.js";

export function Player({ lesson, views, gates = {}, onHome }) {
  const BLOCKS = lesson.blocks; const SK = "ash_" + lesson.id;
  const [cur, setCur] = useState(0); const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false); const [rest, setRest] = useState(true); const [ever, setEver] = useState(false);
  const [auto, setAuto] = useState(true);
  const [done, setDone] = useState(() => new Set(store.get(SK + "_done", [])));
  const [forms, setForms] = useState(() => store.get(SK + "_forms", {}));
  const [media, setMedia] = useState({}); const [published, setPublished] = useState({}); const [mDur, setMDur] = useState(null);
  const audioRef = useRef(null), videoRef = useRef(null), tRef = useRef(0), pendingPlay = useRef(false);
  const b = BLOCKS[cur]; const um = media[b.id] || {}; const audioSrc = um.audio || published[b.id] || null;
  const D = mDur || b.est || 1; const DRef = useRef(D); DRef.current = D;

  /* Które bloki mają opublikowane MP3 (lokalnie public/media, docelowo Supabase Storage) */
  useEffect(() => {
    BLOCKS.forEach(x => {
      fetch(x.audioPath, { method: "HEAD" }).then(r => {
        const ct = r.headers.get("content-type") || "";
        if (r.ok && !/text\/html/.test(ct)) setPublished(p => ({ ...p, [x.id]: x.audioPath }));
      }).catch(() => {});
    });
  }, [lesson.id]);
  useEffect(() => store.set(SK + "_forms", forms), [forms]);
  useEffect(() => store.set(SK + "_done", [...done]), [done]);
  const markDone = useCallback(id => setDone(s => s.has(id) ? s : new Set([...s, id])), []);
  const setForm = useCallback((k, v) => setForms(f => { const n = { ...f }; if (v === undefined) delete n[k]; else n[k] = v; return n; }), []);

  const gateOk = gates[b.id] ? !!gates[b.id](forms) : true;
  useEffect(() => { if (b.task && gateOk) markDone(b.id); }, [b, gateOk, markDone]);

  const goRef = useRef(() => {});
  const finishRef = useRef(() => {});
  finishRef.current = () => {
    setPlaying(false); audioRef.current && audioRef.current.pause(); videoRef.current && videoRef.current.pause();
    tRef.current = DRef.current; setT(DRef.current);
    if (!b.task) markDone(b.id);
    if (auto && !b.task && cur < BLOCKS.length - 1) setTimeout(() => goRef.current(cur + 1, true), (b.hold || 0) * 1000 + 900);
  };
  const startPlay = () => {
    setRest(false);
    if (tRef.current >= DRef.current - 0.05) { tRef.current = 0; setT(0); if (audioRef.current) audioRef.current.currentTime = 0; if (videoRef.current) videoRef.current.currentTime = 0; }
    setPlaying(true); setEver(true);
    if (audioRef.current) audioRef.current.play().catch(() => { toast("Przeglądarka wstrzymała dźwięk. Kliknij Odtwórz."); setPlaying(false); });
    if (videoRef.current) videoRef.current.play().catch(() => {});
  };
  const pause = () => { setPlaying(false); audioRef.current && audioRef.current.pause(); videoRef.current && videoRef.current.pause(); };

  useEffect(() => {
    setMDur(null); if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (audioSrc) {
      const a = new Audio(audioSrc); a.preload = "auto";
      a.addEventListener("loadedmetadata", () => { if (isFinite(a.duration)) setMDur(a.duration); });
      a.addEventListener("ended", () => finishRef.current());
      audioRef.current = a;
    }
    if (pendingPlay.current) { pendingPlay.current = false; setTimeout(startPlay, 30); }
    return () => { if (audioRef.current) audioRef.current.pause(); };
    // eslint-disable-next-line
  }, [cur, audioSrc]);

  useEffect(() => {
    if (!playing) return; let id, last = 0;
    const step = ts => {
      const dt = last ? (ts - last) / 1000 : 0; last = ts; let nt;
      if (audioRef.current) nt = audioRef.current.currentTime; else if (videoRef.current) nt = videoRef.current.currentTime; else nt = tRef.current + dt;
      if (audioRef.current && videoRef.current && Math.abs(videoRef.current.currentTime - nt) > .35) videoRef.current.currentTime = nt;
      tRef.current = nt; setT(nt);
      if (!audioRef.current && nt >= DRef.current) { finishRef.current(); return; }
      id = requestAnimationFrame(step);
    };
    id = requestAnimationFrame(step); return () => cancelAnimationFrame(id);
  }, [playing, cur]);

  goRef.current = (i, autoGo) => {
    if (i < 0 || i >= BLOCKS.length) return;
    pause(); tRef.current = 0; setT(0); setRest(true);
    if (i === cur) return;
    pendingPlay.current = !!(autoGo || ever);
    setCur(i);
  };
  const go = (i, a) => goRef.current(i, a);
  const next = () => { if (!b.task) markDone(b.id); go(cur + 1); };
  const seekTo = nt => { setRest(false); nt = Math.min(D, Math.max(0, nt)); tRef.current = nt; setT(nt); if (audioRef.current) audioRef.current.currentTime = nt; if (videoRef.current) videoRef.current.currentTime = Math.min(nt, videoRef.current.duration || nt); };

  const keyRef = useRef(() => {});
  keyRef.current = e => {
    const tag = (e.target.tagName || "").toLowerCase(); if (["input", "textarea", "select", "button"].includes(tag)) return;
    if (e.key === " ") { e.preventDefault(); playing ? pause() : startPlay(); }
    else if (e.key === "ArrowRight" && e.target.id !== "bar") { if (gateOk && cur < BLOCKS.length - 1) next(); }
    else if (e.key === "ArrowLeft" && e.target.id !== "bar") { go(cur - 1); }
  };
  useEffect(() => { const h = e => keyRef.current(e); document.addEventListener("keydown", h); return () => document.removeEventListener("keydown", h); }, []);

  const attach = (key, file) => {
    if (!file) return;
    setMedia(m => { const c0 = { ...(m[b.id] || {}) }; if (c0[key]) URL.revokeObjectURL(c0[key]); c0[key] = URL.createObjectURL(file); return { ...m, [b.id]: c0 }; });
    pause(); tRef.current = 0; setT(0); setRest(true);
    toast(key === "audio" ? "Lektor podłączony. Animacje idą w rytm nagrania." : "Materiał wstawiony w scenę.");
  };

  const f = Math.min(1, t / D);
  let capPrev = "", capNow = "", capNone = false;
  if (rest && t === 0) { capNow = "Naciśnij „Odtwórz”, żeby usłyszeć lektora i zobaczyć animacje."; capNone = true; }
  else { const w = f * b.W; let k = 0; b.sents.forEach((s, i) => { if (s.a <= w + .5) k = i; }); capPrev = k > 0 ? b.sents[k - 1].s : ""; capNow = b.sents[k].s; }

  const View = views[b.id];
  const pubCount = Object.keys(published).length;
  const est = BLOCKS.reduce((s, x) => s + x.est, 0) + 60 * BLOCKS.filter(x => x.task).length;
  const skip = lesson.skip && lesson.skip[b.id];

  return html`
  <div className="app">
    <div className="headband"><header className="top">
      <button className="backbtn" onClick=${onHome}>← Lekcje</button>
      <div className="brand"><i aria-hidden="true"></i>AI Sales Hero</div>
      <div className="crumb">${lesson.moduleShort} · <b>Lekcja ${lesson.num} — ${lesson.short}</b></div>
      <div className="segs" role="tablist" aria-label="Bloki lekcji">
        ${BLOCKS.map((x, i) => html`<button key=${x.id} className=${"seg" + (i === cur ? " cur" : "") + (done.has(x.id) && i !== cur ? " done" : "")} aria-label=${`Blok ${i + 1}: ${x.title}`} onClick=${() => go(i)}><span className="fill" style=${{ width: i === cur ? ((rest && t === 0 ? 0 : f) * 100) + "%" : (done.has(x.id) ? "100%" : "0") }}></span></button>`)}
      </div>
      <div className="demo-note">Lektor: ${pubCount}/${BLOCKS.length} bloków</div>
    </header></div>
    <div className="mainwrap"><div className="main">
      <aside className="side" aria-label="Spis bloków">
        <h2>${lesson.title}</h2>
        <p className="sub">${BLOCKS.length} bloków · ok. ${Math.round(est / 60)} min · ${lesson.module}</p>
        ${BLOCKS.map((x, i) => { const isDone = done.has(x.id); return html`<button key=${x.id} className=${"bl" + (i === cur ? " cur" : "") + (isDone ? " done" : "")} onClick=${() => go(i)}>
          <span className="ic">${isDone && i !== cur ? "✓" : x.ic}</span><span className="t"><small>${x.type}${published[x.id] ? " · nagrany" : ""}</small>${x.title}</span><span className="d">${fmt(x.est)}</span></button>`; })}
        <div className="total">Postęp i odpowiedzi zapisują się w tej przeglądarce. Na platformie: profil uczestnika w Supabase.</div>
      </aside>
      <section className="player">
        <div className=${"stage" + (rest ? " rest" : "")}>
          <div className="inner">
            <${Clock.Provider} value=${{ b, t, D, f, rest }}>${View ? html`<${View} forms=${forms} setForm=${setForm} go=${go}/>` : null}<//>
            ${b.media && um.video && html`<div style=${{ position: "absolute", inset: 0, background: "var(--head)", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center" }}><video ref=${videoRef} src=${um.video} muted playsInline preload="auto" style=${{ width: "100%", height: "100%", objectFit: "contain" }} onLoadedMetadata=${e => { if (!audioSrc && isFinite(e.target.duration)) setMDur(e.target.duration); }} onEnded=${() => { if (!audioSrc) finishRef.current(); }}></video></div>`}
          </div>
          <div className="type-tag">${b.type}</div>
          <div className="vo-tag">Lektor: głos AI${audioSrc ? "" : " · szacowane tempo"}</div>
          ${skip && html`<button className="btn small skip" onClick=${() => { markDone(b.id); go(cur + 1); }}>${skip}</button>`}
        </div>
        <div className="caps" aria-live="polite"><div className="prev">${capPrev}</div><div className=${"now" + (capNone ? " none" : "")}>${capNow}</div></div>
        <div className="ctrl">
          <button className="btn icon" disabled=${cur === 0} aria-label="Poprzedni blok" onClick=${() => go(cur - 1)}>←</button>
          <button className="btn primary" onClick=${() => playing ? pause() : startPlay()}>${playing ? "❚❚ Pauza" : (!rest && t >= D - 0.05 ? "↺ Jeszcze raz" : "▶ Odtwórz")}</button>
          <button className="btn" disabled=${!gateOk || cur === BLOCKS.length - 1} onClick=${next}>Dalej →</button>
          <div className="bar" id="bar" role="slider" tabIndex="0" aria-label="Postęp bloku" aria-valuemin="0" aria-valuemax=${Math.round(D)} aria-valuenow=${Math.round(t)}
            onClick=${e => { const r = e.currentTarget.getBoundingClientRect(); seekTo((e.clientX - r.left) / r.width * D); }}
            onKeyDown=${e => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); seekTo(t + (e.key === "ArrowRight" ? 3 : -3)); } }}><div className="f" style=${{ width: (f * 100) + "%" }}></div></div>
          <span className="time">${fmt(t)} / ${fmt(D)}</span>
        </div>
        <div className="ctrl">
          <span className="gatehint">${!gateOk ? "To zadanie odblokowuje przycisk „Dalej”." : (cur === BLOCKS.length - 1 ? "Koniec lekcji." : "")}</span>
          <span className="spacer"></span>
          <div className="attach">
            <label htmlFor="fa">${um.audio ? html`<span className="okd">✓ własne MP3</span> · zmień` : (published[b.id] ? html`<span className="okd">✓ lektor</span> · podmień` : "Podłącz MP3 lektora")}</label><input type="file" id="fa" accept="audio/*" onChange=${e => attach("audio", e.target.files[0])}/>
            ${b.media && html`<label htmlFor="fv">${um.video ? html`<span className="okd">✓ nagranie</span> · zmień` : `Wstaw nagranie ${b.media} (MP4)`}</label><input type="file" id="fv" accept="video/*" onChange=${e => attach("video", e.target.files[0])}/>`}
          </div>
          <label className="toggle"><input type="checkbox" id="autoNext" checked=${auto} onChange=${e => setAuto(e.target.checked)}/> Auto-dalej po lektorze</label>
        </div>
      </section>
    </div></div>
  </div>`;
}

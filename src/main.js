import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { html } from "./engine/core.js";
import { Player } from "./engine/Player.js";
import { MODULES, findLesson } from "./lessons/index.js";
import "./styles.css";

/* Routing po hashu: #L1-2 = lekcja, pusty = lista lekcji. Logowanie i płatność dojdą w Lovable + Supabase. */
const readHash = () => decodeURIComponent(location.hash.replace(/^#/, ""));

function Home() {
  return html`
  <div className="app">
    <div className="headband"><header className="top"><div className="brand"><i aria-hidden="true"></i>AI Sales Hero</div><div className="crumb">Twój system AI dla handlowca</div></header></div>
    <div className="mainwrap"><div className="home">
      ${MODULES.map(m => html`<section key=${m.num} className="home">
        <h1>Moduł ${m.num}: <em>${m.title}</em></h1>
        <p className="lead2">Każda lekcja kończy się narzędziem, które sprawdzasz na swoich danych.</p>
        <div className="lessons">${m.lessons.map(l => l.load
          ? html`<a key=${l.id} className="lrow" href=${"#" + l.id}><span className="num">${l.num}</span><span><b>${l.title}</b><small>${l.status}</small></span><span className="st ready">Otwórz</span></a>`
          : html`<div key=${l.id} className="lrow" aria-disabled="true"><span className="num">${l.num}</span><span><b>${l.title}</b><small>${l.status}</small></span><span className="st">Wkrótce</span></div>`)}</div>
      </section>`)}
      <p className="foot-note">Nazwy i logotypy narzędzi należą do ich właścicieli. AI Sales Hero nie jest z nimi powiązany.</p>
    </div></div>
  </div>`;
}

function App() {
  const [route, setRoute] = useState(readHash());
  const [mod, setMod] = useState(null);
  useEffect(() => { const h = () => setRoute(readHash()); addEventListener("hashchange", h); return () => removeEventListener("hashchange", h); }, []);
  useEffect(() => {
    setMod(null); const meta = findLesson(route);
    if (meta && meta.load) meta.load().then(setMod);
  }, [route]);
  const meta = findLesson(route);
  if (!meta || !meta.load) return html`<${Home}/>`;
  if (!mod) return html`<div className="mainwrap"><p>Ładuję lekcję…</p></div>`;
  return html`<${Player} key=${route} lesson=${mod.lesson} views=${mod.views} gates=${mod.gates} onHome=${() => { location.hash = ""; }}/>`;
}

createRoot(document.getElementById("root")).render(html`<${App}/>`);

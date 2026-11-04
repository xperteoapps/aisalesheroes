/* Lekcja 1.2 — Zanim wkleisz: widoki bloków i warunki „Dalej”. Treść (lektor, quizy, maile) w L1-2.json. */
import { useState, useEffect } from "react";
import { html, Cue, useOn, copyText, toast, MEDIA_BASE, prepareLesson } from "../../engine/core.js";
import { Quiz, gateQuiz } from "../../engine/Quiz.js";
import data from "./L1-2.json";

export const lesson = prepareLesson(structuredClone(data));
const L = lesson;

/* ---------- Strażnik lokalny: liczony w przeglądarce, nic nie jest wysyłane ---------- */
const RE_MAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;
const RE_NIP = /\b\d{3}-?\d{3}-?\d{2}-?\d{2}\b|\b\d{3}-\d{2}-\d{2}-\d{3}\b|\b\d{11}\b/g;
const RE_TEL = /(\+48[\s-]?)?\b\d{3}[\s-]?\d{3}[\s-]?\d{3}\b/g;
export function guard(text) {
  const issues = []; let t = text;
  const em = t.match(RE_MAIL); if (em) { issues.push(`Fragment „${em[0]}” wygląda jak adres e-mail — zamień na [MAIL].`); t = t.replace(RE_MAIL, " "); }
  const nip = t.match(RE_NIP); if (nip) { issues.push(`Fragment „${nip[0]}” wygląda jak NIP lub PESEL — zamień na [NIP] albo usuń.`); t = t.replace(RE_NIP, " "); }
  const ph = t.match(RE_TEL); if (ph) issues.push(`Fragment „${ph[0].trim()}” wygląda jak numer telefonu — zamień na [TELEFON].`);
  const left = L.knownPii.filter(w => text.includes(w)); if (left.length) issues.push(`Zostało w tekście: „${left[0]}” — to dane z przykładu, które zamieniasz na znacznik.`);
  const marks = (text.match(/\[(OSOBA|KLIENT|TELEFON|MAIL|KWOTA|NIP|FIRMA)\]/gi) || []).length;
  if (!marks) issues.push("Nie widzę żadnego znacznika, np. [OSOBA] albo [KLIENT]. Na pewno coś zamieniłeś?");
  return { issues, marks };
}

/* ---------- Mail demo (B01, B08): oryginał, od frazy lektora — znacznik ---------- */
function Pii({ say, hotSay, orig, tok }) {
  const on = useOn(); const swapped = say && on(say); const hot = !swapped && hotSay && on(hotSay);
  return swapped ? html`<span className="tok">${tok}</span>` : html`<span className=${"pii" + (hot ? " hot" : "")}>${orig}</span>`;
}
function MailCard({ swap }) {
  const on = useOn(); const keep = swap && on("A to, czego klient potrzebuje");
  const S = k => swap ? ({ o: "Nazwisko staje", k: "Nazwa firmy klienta", t: "Telefon i adres", q: "Budżet — " })[k] : null;
  const H = swap ? "Zobacz, co się z nim dzieje" : "Nazwisko, telefon, budżet";
  return html`<div className="mail">
    <div className="mh"><span>Od</span><div><${Pii} say=${S("o")} hotSay=${H} orig="Anna Kowalska" tok="[OSOBA]"/> ${swap && on(S("t")) ? html`<span className="tok">[MAIL]</span>` : html`<span className=${"pii" + (on(H) ? " hot" : "")}>${"<a.kowalska@kowalski-meble.pl>"}</span>`}</div><span>Do</span><div>${L.demoMail.to}</div><span>Temat</span><div>${L.demoMail.subject}</div></div>
    <div className="mb">Dzień dobry, nazywam się <${Pii} say=${S("o")} hotSay=${H} orig="Anna Kowalska" tok="[OSOBA]"/>, piszę z firmy <${Pii} say=${S("k")} hotSay=${swap ? H : null} orig="Kowalski Meble" tok="[KLIENT]"/>. <span className=${keep ? "keep" : ""}>Potrzebujemy 5000 kartonów klapowych do końca kwartału</span>, budżet ok. <${Pii} say=${S("q")} hotSay=${H} orig="40 tys. zł" tok="[KWOTA]"/>. Proszę o kontakt: <${Pii} say=${S("t")} hotSay=${H} orig="601 234 567" tok="[TELEFON]"/>.</div>
  </div>`;
}

/* ---------- B01 ---------- */
const B1 = () => html`
<div className="s">
  <div className="eyebrow">Moduł 1 · Lekcja 1.2</div>
  <h2 className="h">Zanim <em>wkleisz</em></h2>
  <div className="hook-grid">
    <${Cue} say="Masz w skrzynce" cls="l"><${MailCard}/><//>
    <div className="qs">
      <${Cue} say="co się z tym dzieje" cls="q1">Czy model się na tym uczy?<//>
      <${Cue} say="co się z tym dzieje" cls="q1" style=${{ transitionDelay: ".25s" }}>Co z tego zostaje u dostawcy?<//>
      <${Cue} say="co się z tym dzieje" cls="q1" style=${{ transitionDelay: ".5s" }}>Co w ogóle wolno wkleić?<//>
    </div>
  </div>
  <${Cue} say="Wyłączasz trenowanie" cls="trio">
    <div><span className="ico">OFF</span>Trenowanie wyłączone</div>
    <div><span className="ico">3×</span>Trzy tryby pracy</div>
    <div><span className="ico">✓</span>Checklista „Zanim wkleisz”</div>
  <//>
</div>`;

/* ---------- B02 ---------- */
function B2({ forms, setForm }) {
  const q2 = forms.q2 || [];
  const tog = v => {
    let n = q2.includes(v) ? q2.filter(x => x !== v) : [...q2, v];
    if (v === "nic") n = q2.includes("nic") ? [] : ["nic"]; else n = n.filter(x => x !== "nic");
    setForm("q2", n);
  };
  const ok = !!forms.q1 && q2.length > 0;
  return html`<div className="task">
    <div className="eyebrow">Zadanie · 40 sekund · na telefonie</div>
    <h2 className="h">Twój <em>punkt startu</em></h2>
    <div className="qblock"><h3>Czy Twoje czaty uczą model?</h3>
      <div className="choices">${["Tak, domyślnie", "Nie", "Nie wiem"].map(v => html`<button key=${v} className=${"choice" + (forms.q1 === v ? " on" : "")} onClick=${() => setForm("q1", v)}>${v}</button>`)}</div></div>
    <div className="qblock"><h3>Co wkleiłeś do sztucznej inteligencji w ostatnim miesiącu? <span className="status">(możesz zaznaczyć kilka)</span></h3>
      <div className="choices">${[["mail", "Mail od klienta"], ["oferta", "Ofertę z cenami"], ["kontakt", "Dane kontaktowe"], ["nic", "Nic z tych rzeczy"]].map(([k, v]) => html`<button key=${k} className=${"choice" + (q2.includes(k) ? " on" : "")} aria-pressed=${q2.includes(k)} onClick=${() => tog(k)}>${v}</button>`)}</div></div>
    <div className="row-actions" style=${{ marginTop: "auto" }}>
      <span className=${"status" + (ok ? " good" : "")}>${ok ? "Zapisane w profilu. Odpowiedź poznasz za chwilę." : "Zaznacz odpowiedź w obu pytaniach."}</span>
      <button className="linkbtn" onClick=${() => { setForm("q1", "Nie wiem"); setForm("q2", ["mail", "oferta"]); }}>Demo: wypełnij przykładem</button>
    </div>
  </div>`;
}

/* ---------- B03 ---------- */
function B3() {
  const on = useOn();
  return html`
<div className="s">
  <div className="eyebrow">Trenowanie modeli · stan na 11.2026</div>
  <h2 className="h">Trzy rzeczy, które <em>musisz wiedzieć</em></h2>
  <div className="cards3">
    <${Cue} say="Po pierwsze" cls="fact"><span className="k">Konto osobiste</span><h3>Domyślnie pomaga ulepszać model</h3><p>Free, Pro i Max w Claude; Free i Plus w ChatGPT.</p>
      <div className="chips"><span className="logo">logo: Claude</span><span className="logo">logo: ChatGPT</span></div>
      <div className="swrow"><span className="sw"></span>ON</div><//>
    <${Cue} say="Po drugie" cls="fact"><span className="k">Jeden przełącznik</span><h3>Wyłączasz w ustawieniach prywatności</h3><p>Claude: Ustawienia → Prywatność. ChatGPT: Settings → Data controls.</p>
      <div className="swrow"><span className=${"sw" + (on("Za chwilę zrobisz") ? " off" : "")}></span>${on("Za chwilę zrobisz") ? "OFF" : "ON"}</div><//>
    <${Cue} say="Po trzecie" cls="fact"><span className="k">Klucz API, n8n, konta firmowe</span><h3>Warunki komercyjne: bez trenowania</h3><p>Dotyczy kolejnych modułów, w których podłączysz automatyzacje.</p>
      <div className="chips"><span className="logo">logo: n8n</span></div>
      <div className="swrow"><span className="sw off"></span>domyślnie</div><//>
  </div>
  <${Cue} say="Jedno zastrzeżenie" cls="warnline">Wyłączone trenowanie nie zatrzymuje treści u Ciebie. Tekst i tak trafia na serwer dostawcy.<//>
  <div className="src">Źródła: privacy.claude.com, help.openai.com (Data Controls FAQ), Anthropic Commercial Terms. Nazwy i logotypy narzędzi należą do ich właścicieli. AI Sales Hero nie jest z nimi powiązany.</div>
</div>`;
}

/* ---------- B04 / B05: animatik okna ustawień (do czasu nagrań W1/W2) ---------- */
function SettingsAnim({ app }) {
  const on = useOn(); const isC = app === "claude";
  const P = isC ? { who: "Klikasz swoje inicjały", tab: "Wchodzisz w zakładkę", row: "Ten przełącznik", off: "Przełączasz go", extra: "I jeszcze jedno miejsce", end: "To tryb na sprawy" }
    : { who: "Ikona profilu", tab: "zakładka Data controls", row: "Przełącznik", off: "wyłączasz tutaj", extra: "Odpowiednikiem trybu", end: "Jeżeli nie masz" };
  const tabs = isC ? ["Ogólne", "Konto", "Prywatność", "Wykorzystanie", "Funkcje"] : ["General", "Personalization", "Data controls", "Security", "Account"];
  const target = isC ? "Prywatność" : "Data controls";
  return html`<div className="anim">
    <div className="bar-top"><div className="title">${isC ? "Claude: wyłącz trenowanie" : "ChatGPT: to samo ustawienie"}</div><div className="note">Animatik · w lekcji: nagranie ekranu ${isC ? "W1" : "W2"} (konto demo)</div></div>
    <div className="setwin">
      <div className="setnav">${tabs.map(t => html`<div key=${t} className=${"it" + (t === target && on(P.tab) ? " on" : "")}>${t}</div>`)}
        <div className=${"who" + (on(P.who) && !on(P.tab) ? " on" : "")}><span className="av">ND</span><span>${isC ? "Konto demo" : "Profile"}</span></div></div>
      <div className="setbody">
        <h4>${on(P.tab) ? target : (on(P.who) ? (isC ? "Ustawienia" : "Settings") : (isC ? "Nowy czat" : "New chat"))}</h4>
        <${Cue} say=${P.row} cls=${"setrow" + (on(P.row) && !on(P.extra) ? " hl" : "")}>
          <div><b>${isC ? "Help improve Claude" : "Improve the model for everyone"}</b><span>${isC ? "pozwala używać Twoich czatów do trenowania" : "allow your content to be used to train models"}</span></div>
          <span className=${"sw" + (on(P.off) ? " off" : "")}></span><//>
        <${Cue} say=${P.extra} cls="pill"><span className="sw off" style=${{ width: "3cqw", height: "1.7cqw", minWidth: "22px", minHeight: "12px" }}></span>${isC ? "Czat incognito: bez historii, bez trenowania" : "Temporary chat: bez historii, bez trenowania"}<//>
        <${Cue} say=${P.end} cls="src">${isC ? "Ścieżka: inicjały → Ustawienia → Prywatność" : "Ścieżka: profil → Settings → Data controls"}<//>
      </div>
    </div>
  </div>`;
}

/* ---------- B06 ---------- */
function B6({ forms, setForm }) {
  const [img, setImg] = useState(null);
  useEffect(() => () => { if (img) URL.revokeObjectURL(img); }, [img]);
  const ok = !!forms.done6;
  return html`<div className="task">
    <div className="eyebrow">Zadanie · 2–3 minuty · na laptopie</div>
    <h2 className="h">Wyłącz trenowanie <em>na swoim koncie</em></h2>
    <div className="row-actions"><a className="btn primary" href="https://claude.ai/settings/data-privacy-controls" target="_blank" rel="noopener">Otwórz ustawienia Claude ↗</a><a className="btn" href="https://chatgpt.com/#settings/DataControls" target="_blank" rel="noopener">Ustawienia ChatGPT ↗</a></div>
    <label className=${"check" + (forms.c6a ? " on" : "")} htmlFor="c6a"><input type="checkbox" id="c6a" checked=${!!forms.c6a} onChange=${e => setForm("c6a", e.target.checked)}/><span>Claude: Ustawienia → Prywatność → „Help improve Claude” wyłączone</span></label>
    <label className=${"check" + (forms.c6b ? " on" : "")} htmlFor="c6b"><input type="checkbox" id="c6b" checked=${!!forms.c6b} onChange=${e => setForm("c6b", e.target.checked)}/><span>ChatGPT (jeśli używasz): Settings → Data controls → „Improve the model for everyone” wyłączone</span></label>
    <div className="note"><b>Nie widzisz przełącznika?</b> Masz konto firmowe (Team lub Enterprise). Firma działa na warunkach komercyjnych, bez trenowania na rozmowach. Odhacz i przejdź dalej.</div>
    <div className="shot"><label htmlFor="shot6">${img ? "Zmień zrzut" : "Wgraj zrzut ustawień (opcjonalnie)"}</label><input type="file" id="shot6" accept="image/*" onChange=${e => { const fl = e.target.files[0]; if (!fl) return; if (img) URL.revokeObjectURL(img); setImg(URL.createObjectURL(fl)); setForm("shot6", true); }}/>
      ${img && html`<img src=${img} alt="Twój zrzut ustawień prywatności"/>`}<span>Zrzut zostaje w Twoim profilu. Nie wysyłamy go nigdzie.</span></div>
    <label className=${"check" + (ok ? " on" : "")} htmlFor="done6" style=${{ marginTop: "auto" }}><input type="checkbox" id="done6" checked=${ok} onChange=${e => setForm("done6", e.target.checked)}/><span><b>Zrobione na moim koncie</b><small>Odblokowuje przycisk „Dalej”.</small></span></label>
    <div className="row-actions"><button className="linkbtn" onClick=${() => { setForm("c6a", true); setForm("done6", true); }}>Demo: wypełnij przykładem</button></div>
  </div>`;
}

/* ---------- B08 ---------- */
const B8 = () => html`
<div className="s">
  <div className="eyebrow">Przykład rozpracowany · Nowak Opakowania</div>
  <h2 className="h">Co zostaje, <em>co zamieniasz</em></h2>
  <${MailCard} swap=${true}/>
  <${Cue} say="Zapamiętaj trzy strefy" cls="zones">
    <div className="zone keepz"><b>ZOSTAJE</b>Treść potrzeby, ilości, terminy, Twoja oferta i notatki</div>
    <div className="zone swap"><b>ZAMIEŃ</b>Osoby, firma klienta, telefony, maile, kwoty umów</div>
    <div className="zone never"><b>NIGDY</b>PESEL, dane o zdrowiu, hasła, numery kart, treści pod NDA</div>
  <//>
</div>`;

/* ---------- B09 ---------- */
function B9({ forms, setForm }) {
  const [text, setText] = useState(""); const [show, setShow] = useState(false); const [cmp, setCmp] = useState(false);
  const g = text.trim().length >= 20 ? guard(text) : null; const clean = !!g && !g.issues.length;
  useEffect(() => { setForm("g9", clean); }, [clean]);
  return html`<div className="task">
    <div className="eyebrow">Zadanie · 2–3 minuty · na laptopie</div>
    <h2 className="h">Twój mail <em>ze znacznikami</em></h2>
    <p className="instr">Weź jeden prawdziwy mail od klienta. W osobnym oknie zamień dane na znaczniki: [OSOBA], [KLIENT], [TELEFON], [MAIL], [KWOTA], [NIP]. Wklej tutaj tylko wersję ze znacznikami.</p>
    <div className="row-actions"><button className="btn" aria-expanded=${show} onClick=${() => { setShow(!show); setForm("sample9", true); }}>${show ? "Schowaj przykładowy mail" : "Nie mam maila pod ręką — użyj przykładowego"}</button></div>
    ${show && html`<div className="sample"><div className="sh"><b>Przykład · dane fikcyjne</b><button className="btn small" onClick=${() => copyText(L.sampleMail)}>Kopiuj</button></div><pre>${L.sampleMail}</pre></div>`}
    <div className="field"><label htmlFor="t9">Wersja ze znacznikami</label>
      <textarea id="t9" value=${text} placeholder="Dzień dobry, piszę w imieniu firmy [KLIENT]…" onChange=${e => setText(e.target.value)}></textarea>
      <span className="local">Ten tekst zostaje w Twojej przeglądarce. Nie zapisujemy go i nie wysyłamy.</span></div>
    ${!g ? html`<div className="guard idle">Strażnik sprawdzi tekst, gdy go wkleisz.</div>`
      : clean ? html`<div className="guard ok"><b>Wygląda czysto · znaczników: ${g.marks}</b><small>Sprawdzam tylko to, co ma stały wzorzec: maile, telefony, NIP, PESEL. Nazwiska i nazwy firm sprawdzasz Ty.</small></div>`
        : html`<div className="guard warn">${g.issues.map((x, i) => html`<span key=${i}>Sprawdź: ${x}</span>`)}</div>`}
    ${clean && forms.sample9 && html`<div className="row-actions"><button className="btn small" onClick=${() => setCmp(!cmp)}>${cmp ? "Schowaj wzór" : "Porównaj ze wzorem"}</button></div>`}
    ${clean && cmp && html`<div className="sample"><div className="sh"><b>Wzór do porównania</b></div><pre>${L.sampleModel}</pre><div className="note" style=${{ margin: "0 12px 12px" }}>Ilość, wymiar i termin zostają: bez nich odpowiedź byłaby ogólna. Stanowisko też może zostać, bo nie wskazuje osoby, a mówi, z kim rozmawiasz.</div></div>`}
    <label className=${"check" + (forms.c9 ? " on" : "")} htmlFor="c9"><input type="checkbox" id="c9" checked=${!!forms.c9} onChange=${e => setForm("c9", e.target.checked)}/><span><b>Nie wkleiłem danych osobowych</b><small>Razem z zielonym wynikiem odblokowuje „Dalej”.</small></span></label>
    <div className="row-actions"><button className="linkbtn" onClick=${() => { setText(L.sampleModel); setForm("sample9", true); setShow(true); setForm("c9", true); }}>Demo: wypełnij przykładem</button></div>
  </div>`;
}

/* ---------- B10 ---------- */
const B10 = () => html`
<div className="s yellow">
  <div className="eyebrow">Zanim wkleisz · do zapamiętania</div>
  <div className="rules4">
    ${[["1", "Trenowanie wyłączone?"], ["2", "Sprawa jednorazowa → czat incognito"], ["3", "Osoby, firma, kontakty, kwoty → znaczniki"], ["4", "Wysłałbyś to obcej firmie bez umowy? Jeśli nie, nie wklejaj."]].map(([n, p], i) => html`
      <${Cue} key=${n} say="cztery pytania" cls="r4" style=${{ transitionDelay: (i * .35) + "s" }}><span className="n">${n}</span><p>${p}</p><//>`)}
  </div>
</div>`;

/* ---------- B12 ---------- */
function B12({ forms, setForm }) {
  const plan = forms.plan12 || ""; const used = forms.ai12_n || 0;
  /* Prototyp: komentarz przykładowy. W platformie: Supabase Edge Function z promptem z dokumentu lekcji (sekcja 7). */
  const demo = () => {
    if (used >= 2) { toast("Limit 2 komentarzy na lekcję."); return; }
    const p = plan.toLowerCase();
    const hint = /umow/.test(p) ? "W umowie najpewniej zamienisz stawki, NIP i nazwiska osób podpisujących."
      : /ofert/.test(p) ? "W ofercie znacznika wymagają kwoty i nazwa klienta; zakres możesz zostawić."
        : /notat|rozmow|spotkan/.test(p) ? "W notatce ze spotkania zamień nazwiska uczestników i kwoty z rozmowy."
          : "Najpewniej zamienisz nazwisko i telefon osoby, która do Ciebie pisze.";
    setForm("ai12", plan.trim().length < 8 ? "Wybierz jeden konkretny mail albo dokument z tego tygodnia. To wystarczy na start." : `Dobre miejsce na pierwszy raz: ${plan.trim().replace(/\.$/, "")}. ${hint}`);
    setForm("ai12_n", used + 1);
  };
  return html`<div className="task">
    <div className="eyebrow">Plan na ten tydzień · pobranie</div>
    <h2 className="h">Gdzie użyjesz <em>checklisty</em>?</h2>
    <div className="field"><label htmlFor="plan12">Jedno zdanie: gdzie w tym tygodniu użyjesz checklisty „Zanim wkleisz”?</label>
      <input id="plan12" value=${plan} placeholder="np. odpowiedź na zapytanie od nowego klienta w czwartek" onChange=${e => setForm("plan12", e.target.value)}/></div>
    <div className="row-actions"><button className="btn" disabled=${!plan.trim()} onClick=${demo}>Skomentuj mój plan</button><button className="linkbtn" onClick=${() => setForm("plan12", "streszczenie umowy ramowej od klienta w środę")}>Demo: wypełnij przykładem</button></div>
    ${forms.ai12 && html`<div className="ai">${forms.ai12}<span className="sig">Komentarz napisała AI. (Prototyp: tekst przykładowy. Do API trafia tylko Twoje zdanie.)</span></div>`}
    <div className="dlrow">${L.files.map((x, i) => html`<a key=${x.path} className=${"dl" + (i ? " alt" : "")} href=${`${MEDIA_BASE}/${x.path}`} target="_blank" rel="noopener"><span className="fi">PDF</span><span><b>${x.title}</b><span>${x.sub}</span></span></a>`)}</div>
    <div className="nextc"><div><span className="k">Dalej · Lekcja ${L.next.num}</span><b>${L.next.title}</b></div><span className="arr">→</span></div>
  </div>`;
}

export const views = {
  b1: B1, b2: B2, b3: B3,
  b4: () => html`<${SettingsAnim} app="claude"/>`,
  b5: () => html`<${SettingsAnim} app="chatgpt"/>`,
  b6: B6,
  b7: ({ forms, setForm }) => html`<${Quiz} data=${L.micro} kind="micro" texts=${L.quizText} forms=${forms} setForm=${setForm}/>`,
  b8: B8, b9: B9, b10: B10,
  b11: ({ forms, setForm }) => html`<${Quiz} data=${L.final} kind="final" texts=${L.quizText} forms=${forms} setForm=${setForm}/>`,
  b12: B12
};

export const gates = {
  b2: f => !!f.q1 && (f.q2 || []).length > 0,
  b6: f => !!f.done6,
  b7: f => gateQuiz(f, "micro", L.micro),
  b9: f => !!f.g9 && !!f.c9,
  b11: f => gateQuiz(f, "final", L.final)
};

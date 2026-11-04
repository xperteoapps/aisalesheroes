/* Katalog lekcji. `load` zwraca moduł lekcji ({ lesson, views, gates }); lekcje bez `load` są w produkcji. */
export const MODULES = [
  {
    num: 1, title: "Warsztat AI handlowca",
    lessons: [
      { id: "L1-1", num: "1.1", title: "Twój dział sprzedaży AI", status: "Do przeniesienia z HTML" },
      { id: "L1-2", num: "1.2", title: "Zanim wkleisz: dane, prywatność i trenowanie modeli", status: "Gotowa · bez nagrań W1/W2", load: () => import("./L1-2/index.js") },
      { id: "L1-3", num: "1.3", title: "Claude vs ChatGPT: co do czego", status: "Poprawki scenariusza" },
      { id: "L1-4", num: "1.4", title: "Projekt „Mój dział sprzedaży” + Profil handlowca", status: "W produkcji" },
      { id: "L1-5", num: "1.5", title: "Kontekst firmy: to, co AI musi wiedzieć", status: "W produkcji" },
      { id: "L1-6", num: "1.6", title: "Jak pisać polecenia, które działają", status: "W produkcji" },
      { id: "L1-7", num: "1.7", title: "Skill Anonimizuj + RODO/AI Act w praktyce", status: "W produkcji" }
    ]
  }
];

export const findLesson = id => MODULES.flatMap(m => m.lessons).find(l => l.id === id);

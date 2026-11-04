# AI Sales Hero — zasady pracy w repo

Pracujemy po polsku. Źródłem prawdy dla treści jest Projekt Claude „Ai Sales Hero” (plik 01 architektury, dokumenty lekcji w Claude Docs). To repo zawiera tylko kod.

- **Jeden odtwarzacz dla całego kursu** (`src/engine/`). Lekcja to folder `src/lessons/L{m}-{n}/`: treść w JSON, widoki bloków w `index.js`. Nie kopiuj silnika do lekcji.
- **Media poza repo.** Nigdy nie commituj MP3, MP4, PDF ani logotypów. Ścieżki: `audio/L1-2/L1-2_B01.mp3`, `video/L1-2/L1-2_B04_W1.mp4`, `files/L1-2/L1-2_<nazwa>.pdf`, baza z `VITE_MEDIA_BASE`.
- **Tekst lektora w JSON ma zapis fonetyczny** dla ElevenLabs („sztuczna inteligencja” zamiast „AI”, „Czat-dżi-pi-ti”, „n-eight-n”, „a-pe-i”, „bi-tu-bi”). Napisy zamieniają go na zapis normalny (`disp` w `core.js`). Tekst w JSON musi być identyczny z węzłem w flow ElevenLabs.
- **Frazy `say` w komponentach `Cue`** muszą występować dosłownie w tekście lektora bloku, inaczej element pojawi się od razu.
- **Każdy blok z lektorem ma napis „Lektor: głos AI”**, bez nazwy dostawcy głosu.
- **Nic nie wychodzi do klienta automatycznie**; dane klientów uczestnika nie trafiają do żadnego API. Zadania na danych klientów sprawdzamy lokalnie w przeglądarce.
- **Logotypy** tylko oficjalne SVG z hostingu `assets/logos/`; do tego czasu placeholder `logo: <marka>`.
- Styl: biel + żółty #FFD500, czarny tylko pasek nagłówka; nagłówki Unbounded, tekst Instrument Sans, kod JetBrains Mono.

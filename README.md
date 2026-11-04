# AI Sales Hero — aplikacja kursu

Odtwarzacz lekcji i lista lekcji. Logowanie, płatność i zapis postępu dojdą w Lovable + Supabase.

## Uruchomienie

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # wersja produkcyjna w dist/
```

## Struktura

```
src/
  engine/          silnik wspólny dla wszystkich lekcji
    core.js        model narracji, zegar bloku, Cue, narzędzia
    Player.js      odtwarzacz (scena, napisy, sterowanie, audio)
    Quiz.js        mikroquiz i quiz końcowy
  lessons/
    index.js       katalog modułów i lekcji
    L1-2/
      L1-2.json    treść: teksty lektora, quizy, pliki do pobrania
      index.js     widoki bloków i warunki przycisku „Dalej”
  main.js          routing (#L1-2) i strona główna
  styles.css       styl odtwarzacza
```

Nowa lekcja = folder `src/lessons/L{m}-{n}/` z plikiem JSON i `index.js` eksportującym `lesson`, `views`, `gates`, plus wpis `load` w `src/lessons/index.js`.

## Media (MP3, MP4, PDF) — poza repo

Media nie trafiają do GitHuba. Odtwarzacz bierze je z adresu `VITE_MEDIA_BASE` (patrz `.env.example`):

- offline: `VITE_MEDIA_BASE=/media` w `.env` i folder `public/media/` (ignorowany przez git), np. `public/media/audio/L1-2/L1-2_B01.mp3`
- domyślnie: Supabase Storage, projekt `ai-sales-hero`, bucket `media` (publiczny do czasu logowania), te same ścieżki: `audio/L1-2/L1-2_B01.mp3`, `video/L1-2/L1-2_B04_W1.mp4`, `files/L1-2/L1-2_<nazwa>.pdf`

Blok bez pliku MP3 jedzie na szacowanym tempie lektora.

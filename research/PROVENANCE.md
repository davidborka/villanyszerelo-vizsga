# Eredet – mi mivel készült (2026-10-24)

| Termék | Eszköz | Megjegyzés |
|---|---|---|
| Vizsgakutatás (KKK, mintafeladat, mérőhely) | Perplexity (research), saját ellenőrzés a forrás-PDF-eken | docs/KUTATAS.md, a mérőhelyi előírások a 7. modulban |
| Tananyag-modulok (1–9) | Claude (Opus 5.5), saját megfogalmazás | research/modules/*.md, a számpéldák kézzel újraszámolva |
| Kérdésbank (145) | Claude al-ügynök + MKIK SZKTV mintafeladatok stílusa, minden számolás újraszámolva | src/sim/questions.ts → research/modules/10-kerdesbank.md |
| Videólista (18) | Claude al-ügynök, yt-dlp felirat-ellenőrzéssel | research/sources/videos.json; 1 videó kihagyva (feszültség alatti munka) |
| Notebook, hanganyagok, infografikák, kvíz, tanulókártyák | Google NotebookLM (felhő, Gemini) a `nlm` CLI-vel | a hanganyag és ábra NotebookLM-generált, nem helyben készült |
| Tanulási útmutató | research/guide/build.py (helyi, offline HTML) | külső hivatkozás nélkül |

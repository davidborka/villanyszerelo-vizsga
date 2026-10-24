#!/usr/bin/env bash
# NotebookLM stúdióanyagok a notebookhoz, kvótafigyeléssel (80% fölött megáll)
NB=$(cat research/.notebook_id)
used() { nlm usage 2>/dev/null | awk '/Rolling/{gsub("%","",$4); print int($4)}'; }
step() {
  local u; u=$(used); echo "[$(date +%H:%M)] kvóta: ${u}% – $1"
  if [ "${u:-0}" -ge 80 ]; then echo "  kihagyva: a gördülő kvóta 80% fölött"; return; fi
  shift; "$@" 2>&1 | grep -E "artifact|id|✓|Error|error" | head -3; sleep 30
}
step "tanulási útmutató" nlm report create "$NB" --format "Study Guide" --language hu --confirm
step "kvíz (20 kérdés)" nlm quiz create "$NB" --count 20 --difficulty 3 --focus "A villanyszerelő szakmai vizsga: áramütés elleni védelem, mérőhely bekötése, szerelői ellenőrzés és mérések, világításvezérlések bekötése, számítások. Magyarul." --confirm
step "tanulókártyák" nlm flashcards create "$NB" --difficulty medium --focus "Kulcsfogalmak, határértékek, kapocsszámok és képletek a villanyszerelő vizsgához, magyarul." --confirm
step "gondolattérkép" nlm mindmap create "$NB" --title "Villanyszerelő vizsga – gondolattérkép" --confirm
step "diasor" nlm slides create "$NB" --format presenter_slides --length short --language hu --focus "Egynapos vizsgafelkészítés: mi ér pontot, áramütés elleni védelem, mérőhely, mérések, bekötések." --confirm
step "videós összefoglaló" nlm video create "$NB" --format explainer --language hu --focus "A villanyszerelő gyakorlati vizsga menete a szerelőfalon és a legfontosabb biztonsági szabályok, egy tanulónak, aki ma készül." --confirm
echo "[$(date +%H:%M)] kész"; nlm studio status "$NB" 2>&1 | tail -25

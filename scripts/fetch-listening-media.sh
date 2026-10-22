#!/usr/bin/env bash
# Récupère les clips CC BY 4.0 de Spanish Proficiency Exercises (COERLL, UT Austin),
# puis les compresse pour un usage hors ligne. Les fichiers sources restent au frais
# dans /tmp ; seuls les MP4 compressés et leurs vignettes entrent dans public/.
set -euo pipefail

OUT="public/media/ecoute"
TMP="${TMPDIR:-/tmp}/violeta-ecoute"
mkdir -p "$OUT" "$TMP"

# eoXX:code source (voir docs/CONTENT.md, section 13)
MAP="
eo01:beg02b
eo02:beg05e
eo03:beg01e
eo04:beg13c
eo05:beg06c
eo06:beg04c
eo07:beg15b
eo08:int01a
eo09:int21d
eo10:int10e
eo11:int06e
eo12:int14b
eo13:int08d
eo14:beg12d
eo15:int18d
eo16:int09e
"

for pair in $MAP; do
  id="${pair%%:*}"
  code="${pair##*:}"
  src="$TMP/$code.mp4"
  if [ ! -s "$src" ]; then
    if ! curl -fsSL --max-time 120 "https://media.coerll.utexas.edu/spe/mp4/$code.mp4" -o "$src"; then
      echo "! $id ($code) : vidéo indisponible, ignoré" >&2
      rm -f "$src"
      continue
    fi
  fi
  # 480p, audio mono 64 kbps : environ 300 à 700 Ko pour 20 à 90 s.
  ffmpeg -hide_banner -loglevel error -y -i "$src" \
    -vf "scale=-2:480" -c:v libx264 -preset veryfast -crf 30 \
    -c:a aac -b:a 64k -ac 1 -movflags +faststart "$OUT/$id.mp4"
  ffmpeg -hide_banner -loglevel error -y -i "$src" -vf "scale=-2:360" -frames:v 1 -q:v 4 "$OUT/$id.jpg"
  printf "%s %s -> %s Ko\n" "$id" "$code" "$(( $(stat -c%s "$OUT/$id.mp4") / 1024 ))"
done

du -sh "$OUT"

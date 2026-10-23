#!/usr/bin/env python3
"""Liest die Gästebewertungen von Harz-Travel (travanto) und schreibt data/bewertungen.json.

Gespeichert werden nur Gesamtwerte (Note, Anzahl), keine Texte oder Namen von Gästen.
"""
import json, re, sys, urllib.request
from datetime import datetime, timezone
from html import unescape
from pathlib import Path

OBJEKT = 92720
URL = f"https://ext.travanto.de/ferienwohnung/externe_bewertungen.php?onr={OBJEKT}&lang=de&externUrl=https://harzberge.de/"
OUT = Path(__file__).resolve().parent.parent / "data" / "bewertungen.json"
NUM = r"(\d,\d)"


def num(s):
    return float(s.replace(",", "."))


def main():
    req = urllib.request.Request(URL, headers={"User-Agent": "harzberge.de bewertungen-sync"})
    html = urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "replace")
    t = re.sub(r"<(script|style).*?</\1>", "", html, flags=re.S)
    t = unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", t)))
    m = re.search(r"Bewertungen \( (\d+) \)", t)
    g = re.search(rf"Gesamtbewertung {NUM} von 5,0", t)
    if not (m and g):
        sys.exit("Bewertungen nicht erkannt, Datei bleibt unverändert")
    teil = {}
    for k in ("Gesamteindruck", "Ausstattung", "Sauberkeit", "Lage", "Preis/Leistung"):
        x = re.search(rf"{re.escape(k)} {NUM} von 5,0", t)
        if x:
            teil[k] = num(x.group(1))
    data = {"stand": datetime.now(timezone.utc).strftime("%Y-%m-%d"), "quelle": "harz-travel.de", "anzahl": int(m.group(1)),
            "gesamt": num(g.group(1)), "teil": teil}
    if OUT.exists():
        old = json.loads(OUT.read_text())
        if {k: v for k, v in old.items() if k != "stand"} == {k: v for k, v in data.items() if k != "stand"}:
            return print("Keine Änderung")
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n")
    print(data["anzahl"], "Bewertungen, Ø", data["gesamt"])


main()

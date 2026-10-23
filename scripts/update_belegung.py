#!/usr/bin/env python3
"""Liest den Belegzeitenkalender von Harz-Travel (travanto) und schreibt data/belegung.json.

Der Kalender auf der Seite wird nur aus dieser Datei gezeichnet, es wird kein Fremdskript eingebunden.
Werte je Tag: "b" belegt, "a" nur Anreise (ab Nachmittag belegt), "d" nur Abreise (bis Vormittag belegt), "w" Wechseltag.
Freie Tage fehlen in der Datei.
"""
import json, re, sys, urllib.request
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path

OBJEKT = 92720
URL = f"https://ext.travanto.de/ferienwohnung/externer_belegzeitenkalender.php?nummer={OBJEKT}&lang=de&design=responsive&externUrl=https://harzberge.de/"
OUT = Path(__file__).resolve().parent.parent / "data" / "belegung.json"


class Cells(HTMLParser):
    def __init__(self):
        super().__init__()
        self.days = {}

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        d = a.get("data-datum")
        if tag != "div" or not d:
            return
        c = set((a.get("class") or "").split())
        if "vergangen" in c:
            return
        day = datetime.strptime(d, "%d.%m.%Y").date().isoformat()
        if "belegt" in c:
            self.days[day] = "b"
        elif "anfahrt" in c and "abfahrt" in c and "heute" not in c:
            self.days[day] = "w"
        elif "anfahrt" in c and "heute" not in c:
            self.days[day] = "a"
        elif "abfahrt" in c and "heute" not in c:
            self.days[day] = "d"


def main():
    req = urllib.request.Request(URL, headers={"User-Agent": "harzberge.de belegung-sync"})
    html = urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "replace")
    p = Cells()
    p.feed(html)
    if len(re.findall(r'data-datum="', html)) < 300:
        sys.exit("Kalender nicht erkannt, Datei bleibt unverändert")
    data = {"stand": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), "quelle": "harz-travel.de", "tage": dict(sorted(p.days.items()))}
    if OUT.exists() and json.loads(OUT.read_text()).get("tage") == data["tage"]:
        return print("Keine Änderung")
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n")
    print(len(p.days), "Tage mit Belegung")


main()

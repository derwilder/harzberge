#!/usr/bin/env python3
"""Erzeugt aus index.html (Deutsch, Quelle) die Seiten en/index.html und es/index.html.

Nur index.html bearbeiten, danach `python3 scripts/build_i18n.py` ausführen.
Übersetzt werden Textknoten und ausgewählte Attribute, deren deutscher Wortlaut unten als Schlüssel steht.
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://harzberge.de"

T = {
"Zum Inhalt springen": ("Skip to content", "Saltar al contenido"),
"Wohnung": ("Apartment", "Apartamento"),
"Fotos": ("Photos", "Fotos"),
"Lage": ("Location", "Ubicación"),
"Belegung": ("Availability", "Disponibilidad"),
"Preise": ("Prices", "Precios"),
"FAQ": ("FAQ", "Preguntas"),
"Jetzt anfragen": ("Enquire now", "Consultar ahora"),
"Menü": ("Menu", "Menú"),
"Wernigerode im Harz": ("Wernigerode in the Harz", "Wernigerode, en el Harz"),
"Ferienwohnung": ("Holiday apartment", "Apartamento vacacional"),
"90&nbsp;m² am Rand der Altstadt, unterhalb des Schlosses, direkt am Lustgarten und am Randwanderweg&nbsp;R1.":
 ("90&nbsp;m² on the edge of the old town, below the castle, right by the Lustgarten park and the R1 ring trail.",
  "90&nbsp;m² en el borde del casco antiguo, bajo el castillo, junto al parque Lustgarten y al sendero circular&nbsp;R1."),
"bis 4 Personen plus Kinder": ("up to 4 guests plus children", "hasta 4 personas más niños"),
"Parkplatz kostenlos": ("Free parking", "Aparcamiento gratuito"),
"WLAN kostenlos": ("Free Wi-Fi", "Wi-Fi gratuito"),
"Hunde willkommen": ("Dogs welcome", "Se admiten perros"),
"Schnellanfrage": ("Quick enquiry", "Consulta rápida"),
"Anreise": ("Arrival", "Llegada"),
"Abreise": ("Departure", "Salida"),
"Personen": ("Guests", "Personas"),
"Verfügbarkeit anfragen": ("Check availability", "Consultar disponibilidad"),
"Die Wohnung": ("The apartment", "El apartamento"),
"Platz für die ganze Familie, mitten im Grünen": ("Room for the whole family, in the green", "Espacio para toda la familia, en plena naturaleza"),
"Wohnbereich, Essbereich, Küche, Bad, Schlafzimmer, ein Zimmer mit zwei Einzelbetten, dazu Garten und Grillplatz.":
 ("Living area, dining area, kitchen, bathroom, bedroom, a room with two single beds, plus garden and barbecue area.",
  "Salón, comedor, cocina, baño, dormitorio, una habitación con dos camas individuales, además de jardín y zona de barbacoa."),
"Zentral in der Altstadt": ("Central, by the old town", "Junto al casco antiguo"),
"Am Rand der historischen Altstadt, unterhalb des Schlosses und direkt am Randwanderweg R1. In nur 10 Gehminuten sind Sie am Marktplatz oder am Schloss Wernigerode.":
 ("On the edge of the historic old town, below the castle and right on the R1 ring trail. Just 10 minutes on foot to the market square or Wernigerode Castle.",
  "En el borde del casco histórico, bajo el castillo y justo en el sendero circular R1. A solo 10 minutos a pie de la plaza del mercado y del castillo de Wernigerode."),
"Direkt am Lustgarten": ("Right by the Lustgarten", "Junto al Lustgarten"),
"Vor der Haustür liegen der Park „Lustgarten“ und der Schlosswald, ideal zum Spazierengehen und Wandern.":
 ("The “Lustgarten” park and the castle forest are on your doorstep, ideal for walks and hikes.",
  "El parque «Lustgarten» y el bosque del castillo están a la puerta, ideales para pasear y hacer senderismo."),
"Kinderfreundlich": ("Child-friendly", "Para familias con niños"),
"Kinderstuhl und Kinderbett auf Wunsch kostenlos. Drei Spielplätze im Umkreis von fünf Minuten.":
 ("High chair and cot free on request. Three playgrounds within five minutes.",
  "Trona y cuna gratis a petición. Tres parques infantiles a menos de cinco minutos."),
"Kostenloser Parkplatz": ("Free parking space", "Aparcamiento gratuito"),
"Ein eigener Parkplatz gehört zur Wohnung, weitere kostenlose Plätze liegen in der Nähe.":
 ("A parking space comes with the apartment, more free spaces are nearby.",
  "El apartamento incluye una plaza de aparcamiento; hay más plazas gratuitas cerca."),
"Freies WLAN": ("Free Wi-Fi", "Wi-Fi gratuito"),
"Für Gäste kostenlos in der ganzen Ferienwohnung.": ("Free for guests throughout the apartment.", "Gratis para los huéspedes en todo el apartamento."),
"Garten & Grillbereich": ("Garden & barbecue area", "Jardín y zona de barbacoa"),
"Separater Gartenbereich mit großem Esstisch und Holzkohlegrill.": ("Separate garden area with a large dining table and charcoal grill.", "Zona de jardín independiente con una gran mesa y barbacoa de carbón."),
"Handtücher & Bettwäsche": ("Towels & bed linen", "Toallas y ropa de cama"),
"Handtücher sind inklusive, Bettwäsche gibt es auf Wunsch gegen Aufpreis.": ("Towels are included, bed linen is available on request for a small extra charge.", "Toallas incluidas; la ropa de cama está disponible a petición con un pequeño suplemento."),
"Ein Blick hinein": ("A look inside", "Un vistazo al interior"),
"Wohnbereich mit Sofa und Fernseher": ("Living area with sofa and TV", "Salón con sofá y televisión"),
"Heller Wohnbereich mit Sofa, Couchtisch, Fernseher und Esstisch unter der Dachschräge": ("Bright living area with sofa, coffee table, TV and dining table under the sloping roof", "Salón luminoso con sofá, mesa de centro, televisión y mesa de comedor bajo el techo abuhardillado"),
"Schlafzimmer mit Doppelbett": ("Bedroom with double bed", "Dormitorio con cama de matrimonio"),
"Doppelbett aus Holz mit blau-weiß karierter Bettwäsche und Nachttischlampen": ("Wooden double bed with blue and white checked bedding and bedside lamps", "Cama de matrimonio de madera con ropa de cama de cuadros azules y blancos y lámparas de noche"),
"Essbereich mit Dachfenster": ("Dining area with roof window", "Comedor con claraboya"),
"Esstisch aus Holz mit vier Lederstühlen unter einem Dachfenster": ("Wooden dining table with four leather chairs under a roof window", "Mesa de comedor de madera con cuatro sillas de cuero bajo una claraboya"),
"Küche mit Herd und Utensilien": ("Kitchen with hob and utensils", "Cocina con placa y utensilios"),
"Küchenzeile mit Kochtopf, Herdplatte und Küchenutensilien": ("Kitchenette with cooking pot, hob and kitchen utensils", "Cocina con olla, placa de cocción y utensilios"),
"Bad mit Regendusche": ("Bathroom with rain shower", "Baño con ducha efecto lluvia"),
"Dusche mit Regendusche und Handbrause vor blau-weiß gefliester Wand": ("Shower with rain shower and hand shower in front of a blue and white tiled wall", "Ducha con efecto lluvia y teléfono de ducha ante una pared de azulejos azules y blancos"),
"Zimmer mit zwei Einzelbetten": ("Room with two single beds", "Habitación con dos camas individuales"),
"Zwei Einzelbetten mit rot-schwarz karierter Bettwäsche und Blumenstrauß": ("Two single beds with red and black checked bedding and a bouquet of flowers", "Dos camas individuales con ropa de cama de cuadros rojos y negros y un ramo de flores"),
"Das Haus mit Blick zum Schloss Wernigerode": ("The house with a view of Wernigerode Castle", "La casa con vistas al castillo de Wernigerode"),
"Haus mit begrüntem Dach und Garten, im Hintergrund das Schloss Wernigerode": ("House with green roof and garden, Wernigerode Castle in the background", "Casa con tejado verde y jardín, al fondo el castillo de Wernigerode"),
"Fotoansicht": ("Photo view", "Vista de la foto"),
"‹ Zurück": ("‹ Back", "‹ Anterior"),
"Schließen": ("Close", "Cerrar"),
"Weiter ›": ("Next ›", "Siguiente ›"),
"Zehn Minuten bis zum Schloss": ("Ten minutes to the castle", "Diez minutos hasta el castillo"),
"Die Ferienwohnung liegt am Rand der historischen Altstadt, unterhalb des Schlosses und unmittelbar am Randwanderweg R1. Direkt vor der Haustür beginnen der Park „Lustgarten“ (Barockgarten) und der Schlosswald.":
 ("The apartment lies on the edge of the historic old town, below the castle and right on the R1 ring trail. The “Lustgarten” park (baroque garden) and the castle forest start at the front door.",
  "El apartamento está en el borde del casco histórico, bajo el castillo y junto al sendero circular R1. A la puerta empiezan el parque «Lustgarten» (jardín barroco) y el bosque del castillo."),
"Route planen": ("Get directions", "Cómo llegar"),
"Zu Fuß ab Haustür": ("On foot from the front door", "A pie desde la puerta"),
"Lustgarten &amp; Schlosswald": ("Lustgarten &amp; castle forest", "Lustgarten y bosque del castillo"),
"vor der Haustür": ("on the doorstep", "a la puerta"),
"Spielplätze (drei)": ("Playgrounds (three)", "Parques infantiles (tres)"),
"5 Gehminuten": ("5 min walk", "5 min a pie"),
"Marktplatz": ("Market square", "Plaza del mercado"),
"10 Gehminuten": ("10 min walk", "10 min a pie"),
"Schloss Wernigerode": ("Wernigerode Castle", "Castillo de Wernigerode"),
"Alles bequem zu Fuß erreichbar, kein Auto nötig.": ("Everything within easy walking distance, no car needed.", "Todo cómodamente a pie, sin necesidad de coche."),
"Freie Termine": ("Available dates", "Fechas libres"),
"Ist die Ferienwohnung in Ihrem Reisezeitraum frei? Wählen Sie Ihre Tage direkt im Kalender.": ("Is the apartment free for your stay? Pick your dates directly in the calendar.", "¿Está libre el apartamento en sus fechas? Elija los días directamente en el calendario."),
"Kalender wird geladen …": ("Loading calendar …", "Cargando calendario …"),
"frei": ("free", "libre"),
"belegt": ("booked", "ocupado"),
"An-/Abreise möglich": ("Arrival/departure possible", "Llegada/salida posible"),
"Tag anklicken, um Anreise und Abreise zu wählen. Der Kalender wird von Harz-Travel übernommen.": ("Click a day to choose arrival and departure. The calendar is taken from Harz-Travel.", "Haga clic en un día para elegir llegada y salida. El calendario procede de Harz-Travel."),
"Vorheriger Monat": ("Previous month", "Mes anterior"),
"Nächster Monat": ("Next month", "Mes siguiente"),
"Leistungen &amp; Preise": ("Services &amp; prices", "Servicios y precios"),
"Transparent, ohne Überraschungen": ("Transparent, no surprises", "Transparente, sin sorpresas"),
"Pro Nacht für 2 Personen": ("Per night for 2 guests", "Por noche para 2 personas"),
"Jede weitere Person / Nacht": ("Each additional guest / night", "Cada persona adicional / noche"),
"Endreinigung (einmalig)": ("Final cleaning (one-off)", "Limpieza final (única)"),
"Bettwäsche (pro Bettensatz, auf Wunsch)": ("Bed linen (per set, on request)", "Ropa de cama (por juego, a petición)"),
"Hund (pauschal pro Aufenthalt)": ("Dog (flat fee per stay)", "Perro (tarifa fija por estancia)"),
"Im Preis enthalten: Handtücher, WLAN, Strom, Wasser und Parkplatz.": ("Included in the price: towels, Wi-Fi, electricity, water and parking.", "Incluido en el precio: toallas, Wi-Fi, electricidad, agua y aparcamiento."),
"Häufige Fragen": ("Frequently asked questions", "Preguntas frecuentes"),
"Gut zu wissen": ("Good to know", "Conviene saber"),
"Für wie viele Personen ist die Ferienwohnung geeignet?": ("How many people is the apartment suitable for?", "¿Para cuántas personas es adecuado el apartamento?"),
"Die Ferienwohnung hat 90 m² und bietet Platz für bis zu 4 Personen plus Kinder. Über das Anfrageformular können bis zu 6 Personen angefragt werden.": ("The apartment has 90 m² and sleeps up to 4 guests plus children. Up to 6 people can be requested via the enquiry form.", "El apartamento tiene 90 m² y ofrece espacio para hasta 4 personas más niños. A través del formulario se pueden solicitar hasta 6 personas."),
"Was kostet die Ferienwohnung pro Nacht?": ("How much does the apartment cost per night?", "¿Cuánto cuesta el apartamento por noche?"),
"50 EUR pro Nacht für 2 Personen. Jede weitere Person kostet 15 EUR pro Nacht. Handtücher, WLAN, Strom, Wasser und Parkplatz sind im Preis enthalten.": ("50 EUR per night for 2 guests. Each additional guest costs 15 EUR per night. Towels, Wi-Fi, electricity, water and parking are included.", "50 EUR por noche para 2 personas. Cada persona adicional cuesta 15 EUR por noche. Toallas, Wi-Fi, electricidad, agua y aparcamiento están incluidos."),
"Welche zusätzlichen Kosten fallen an?": ("Are there any additional costs?", "¿Hay costes adicionales?"),
"Einmalig 30 EUR Endreinigung. Bettwäsche kostet auf Wunsch einmalig 5 EUR pro Bettensatz. Für Hunde berechnen wir pauschal 25 EUR pro Aufenthalt.": ("A one-off 30 EUR final cleaning fee. Bed linen costs 5 EUR per set on request. For dogs we charge a flat 25 EUR per stay.", "Limpieza final única de 30 EUR. La ropa de cama cuesta 5 EUR por juego a petición. Por perros cobramos una tarifa fija de 25 EUR por estancia."),
"Gibt es einen Parkplatz und WLAN?": ("Is there parking and Wi-Fi?", "¿Hay aparcamiento y Wi-Fi?"),
"Ja, ein kostenloser Parkplatz gehört zur Ferienwohnung, weitere kostenlose Parkplätze sind in der Nähe. Das WLAN ist kostenlos.": ("Yes, a free parking space comes with the apartment, and more free spaces are nearby. Wi-Fi is free.", "Sí, el apartamento incluye una plaza de aparcamiento gratuita y hay más plazas gratuitas cerca. El Wi-Fi es gratuito."),
"Ist die Ferienwohnung für Familien mit Kindern geeignet?": ("Is the apartment suitable for families with children?", "¿Es adecuado el apartamento para familias con niños?"),
"Ja. Kinderstuhl und Kinderbett stehen auf Wunsch kostenlos bereit, drei Spielplätze liegen im Umkreis von fünf Minuten.": ("Yes. A high chair and cot are available free on request, and three playgrounds are within five minutes.", "Sí. Trona y cuna están disponibles gratis a petición, y hay tres parques infantiles a menos de cinco minutos."),
"Wie weit ist es in die Altstadt und zum Schloss Wernigerode?": ("How far is it to the old town and Wernigerode Castle?", "¿A qué distancia están el casco antiguo y el castillo de Wernigerode?"),
"Zum Marktplatz und zum Schloss Wernigerode sind es etwa 10 Gehminuten. Die Wohnung liegt direkt am Randwanderweg R1.": ("It is about a 10-minute walk to the market square and to Wernigerode Castle. The apartment is right on the R1 ring trail.", "A la plaza del mercado y al castillo de Wernigerode hay unos 10 minutos a pie. El apartamento está junto al sendero circular R1."),
"Sind Hunde erlaubt?": ("Are dogs allowed?", "¿Se admiten perros?"),
"Ja, Hunde sind willkommen (pauschal 25 EUR pro Aufenthalt).": ("Yes, dogs are welcome (flat fee of 25 EUR per stay).", "Sí, los perros son bienvenidos (tarifa fija de 25 EUR por estancia)."),
"Wie buche ich?": ("How do I book?", "¿Cómo reservo?"),
"Per Anfrageformular auf dieser Seite, per E-Mail an info@harzberge.de oder telefonisch unter 0178 / 4307460 bzw. 03943 / 43074.": ("Via the enquiry form on this page, by e-mail to info@harzberge.de, or by phone on +49 178 4307460 or +49 3943 43074.", "Mediante el formulario de esta página, por correo electrónico a info@harzberge.de o por teléfono al +49 178 4307460 o +49 3943 43074."),
"Ferienwohnung frei?": ("Apartment available?", "¿Apartamento libre?"),
"Wir freuen uns über Ihre Anfrage. Kostenlos und unverbindlich.": ("We look forward to your enquiry. Free of charge and non-binding.", "Esperamos su consulta. Gratuita y sin compromiso."),
"Mobil": ("Mobile", "Móvil"),
"Festnetz": ("Landline", "Fijo"),
"E-Mail": ("E-mail", "Correo electrónico"),
"Anfrage übermittelt": ("Enquiry sent", "Consulta enviada"),
"Ihre Anfrage wurde an unser Buchungsportal Harz-Travel gesendet. Die Bestätigung sehen Sie im neu geöffneten Tab, außerdem erhalten Sie sie per E-Mail.": ("Your enquiry has been sent to our booking portal Harz-Travel. You will see the confirmation in the newly opened tab and will also receive it by e-mail.", "Su consulta se ha enviado a nuestro portal de reservas Harz-Travel. Verá la confirmación en la pestaña recién abierta y también la recibirá por correo electrónico."),
"Kein Tab geöffnet oder keine Bestätigung erhalten? Bitte Pop-ups für diese Seite erlauben oder uns direkt kontaktieren:": ("No tab opened or no confirmation received? Please allow pop-ups for this page or contact us directly:", "¿No se abrió ninguna pestaña o no recibió confirmación? Permita las ventanas emergentes para esta página o contáctenos directamente:"),
"Neue Anfrage": ("New enquiry", "Nueva consulta"),
"Anreise*": ("Arrival*", "Llegada*"),
"Abreise*": ("Departure*", "Salida*"),
"Personen* (max. 6)": ("Guests* (max. 6)", "Personas* (máx. 6)"),
"davon Kinder": ("of which children", "de ellos niños"),
"Haustiere": ("Pets", "Mascotas"),
"Keine": ("None", "Ninguna"),
"1 Hund": ("1 dog", "1 perro"),
"2 Hunde": ("2 dogs", "2 perros"),
"Vorname*": ("First name*", "Nombre*"),
"Nachname*": ("Last name*", "Apellidos*"),
"E-Mail*": ("E-mail*", "Correo electrónico*"),
"Telefon (für Rückfragen)": ("Phone (for questions)", "Teléfono (para consultas)"),
"Nachricht": ("Message", "Mensaje"),
"Anfrage absenden": ("Send enquiry", "Enviar consulta"),
"Die Anfrage wird über unser Buchungsportal Harz-Travel (Travanto) übermittelt und öffnet sich dazu in einem neuen Tab. Kostenlos und unverbindlich. Details in der": ("The enquiry is sent via our booking portal Harz-Travel (Travanto) and opens in a new tab. Free and non-binding. Details in the", "La consulta se envía a través de nuestro portal de reservas Harz-Travel (Travanto) y se abre en una pestaña nueva. Gratuita y sin compromiso. Detalles en la"),
"Datenschutzerklärung": ("privacy policy (German)", "política de privacidad (en alemán)"),
"Ferienwohnung am Rand der Altstadt von Wernigerode im Harz.": ("Holiday apartment on the edge of the old town of Wernigerode in the Harz.", "Apartamento vacacional en el borde del casco antiguo de Wernigerode, en el Harz."),
"Kontakt": ("Contact", "Contacto"),
"Rechtliches": ("Legal", "Aviso legal"),
"Impressum &amp; Datenschutz": ("Legal notice &amp; privacy (German)", "Aviso legal y privacidad (en alemán)"),
"Anfragen": ("Enquire", "Consultar"),
"Anrufen": ("Call", "Llamar"),
# Kopfdaten
"Ferienwohnung Wernigerode · Harzberge.de": ("Holiday apartment Wernigerode · Harzberge.de", "Apartamento vacacional Wernigerode · Harzberge.de"),
"Moderne, familienfreundliche 90-m²-Ferienwohnung am Rand der Altstadt von Wernigerode, unterhalb des Schlosses und direkt am Lustgarten. Ab 50 € pro Nacht, Parkplatz und WLAN kostenlos.": ("Modern, family-friendly 90 m² holiday apartment on the edge of Wernigerode's old town, below the castle and right by the Lustgarten. From €50 per night, free parking and Wi-Fi.", "Moderno apartamento vacacional de 90 m², ideal para familias, en el borde del casco antiguo de Wernigerode, bajo el castillo y junto al Lustgarten. Desde 50 € por noche, aparcamiento y Wi-Fi gratuitos."),
# JSON-LD
"Harzberge.de – Ferienwohnung Wernigerode": ("Harzberge.de – Holiday apartment Wernigerode", "Harzberge.de – Apartamento vacacional Wernigerode"),
"Ferienwohnung Harzberge.de": ("Holiday apartment Harzberge.de", "Apartamento vacacional Harzberge.de"),
"90 m² große, kinderfreundliche Ferienwohnung am Rand der Altstadt von Wernigerode, direkt am Lustgarten und am Randwanderweg R1.": ("90 m² child-friendly holiday apartment on the edge of Wernigerode's old town, right by the Lustgarten and the R1 ring trail.", "Apartamento vacacional de 90 m² para familias, en el borde del casco antiguo de Wernigerode, junto al Lustgarten y al sendero circular R1."),
"ab 50 EUR pro Nacht für 2 Personen": ("from 50 EUR per night for 2 guests", "desde 50 EUR por noche para 2 personas"),
"Kostenloses WLAN": ("Free Wi-Fi", "Wi-Fi gratuito"),
"Kinderstuhl und Kinderbett auf Wunsch": ("High chair and cot on request", "Trona y cuna a petición"),
"Garten mit Holzkohlegrill": ("Garden with charcoal grill", "Jardín con barbacoa de carbón"),
"Handtücher inklusive": ("Towels included", "Toallas incluidas"),
"Küche": ("Kitchen", "Cocina"),
}

LANGS = {"en": (0, "en", "en_GB"), "es": (1, "es", "es_ES")}
PAIRS = {k: v for k, v in T.items()}


def tr(s, i):
    core = s.strip()
    if core in PAIRS:
        return s.replace(core, PAIRS[core][i])
    return s


def build(code):
    i, lang, loc = LANGS[code]
    h = (ROOT / "index.html").read_text()
    miss = set()

    def ld(m):
        d = json.loads(m.group(1))
        def w(o):
            if isinstance(o, dict): return {k: w(v) for k, v in o.items()}
            if isinstance(o, list): return [w(v) for v in o]
            if isinstance(o, str): return PAIRS[o][i] if o in PAIRS else o
            return o
        d = w(d)
        for g in d.get("@graph", []):
            if "inLanguage" in g or g.get("@type") == "WebSite": g["inLanguage"] = lang
        return '<script type="application/ld+json">' + json.dumps(d, ensure_ascii=False, indent=1) + "</script>"
    h = re.sub(r'<script type="application/ld\+json">(.*?)</script>', ld, h, flags=re.S)

    # Sprachumschalter: relative Ziele je Seite
    tgt = {"de": "../index.html", "en": "index.html" if code == "en" else "../en/index.html", "es": "index.html" if code == "es" else "../es/index.html"}
    def sw(m):
        b = m.group(0)
        b = b.replace('href="index.html" hreflang="de"', f'href="{tgt["de"]}" hreflang="de"')
        b = b.replace('href="en/index.html" hreflang="en"', f'href="{tgt["en"]}" hreflang="en"')
        b = b.replace('href="es/index.html" hreflang="es"', f'href="{tgt["es"]}" hreflang="es"')
        b = re.sub(r' aria-current="true"', '', b)
        b = re.sub(rf'(hreflang="{code}")', r'\1 aria-current="true"', b)
        return b
    h = re.sub(r'<li class="lang"[^>]*>.*?</li>', sw, h, count=1, flags=re.S)

    # Textknoten
    def text(m):
        s = m.group(1)
        if s.strip() in PAIRS: return ">" + tr(s, i) + "<"
        if re.search(r"[A-Za-zÄÖÜäöüß]{4}", s) and "\n" not in s.strip() and "{" not in s: miss.add(s.strip())
        return m.group(0)
    h = re.sub(r">([^<>]+)<", text, h)
    # Attribute
    def attr(m):
        v = m.group(2)
        return f'{m.group(1)}="{tr(v, i)}"' if v in PAIRS else m.group(0)
    h = re.sub(r'\b(aria-label|alt|content|data-caption|title)="([^"]*)"', attr, h)

    # Kopf
    h = h.replace('<html lang="de">', f'<html lang="{lang}">')
    h = h.replace('content="de_DE"', f'content="{loc}"')
    url = f"{SITE}/{code}/index.html"
    h = h.replace(f'{SITE}/index.html"', f'{url}"')
    alt = "".join(f'<link rel="alternate" hreflang="{c}" href="{SITE}/{p}">' for c, p in [("de", "index.html"), ("en", "en/index.html"), ("es", "es/index.html"), ("x-default", "index.html")])
    h = re.sub(r'<link rel="alternate" hreflang[^>]*>', "", h)
    h = h.replace('<link rel="canonical"', alt + '<link rel="canonical"', 1)
    # Pfade zu gemeinsamen Dateien
    h = re.sub(r'\b(href|src|data-full|srcset)="((?:css|js|img|fonts|data)/|favicon\.svg|impressum\.html)', r'\1="../\2', h)
    h = re.sub(r'(srcset="[^"]*?, )((?:img)/)', r'\1../\2', h)
    h = h.replace("0178 / 4307460", "+49 178 4307460").replace("03943 / 43074", "+49 3943 43074")
    out = ROOT / code
    out.mkdir(exist_ok=True)
    (out / "index.html").write_text(h)
    return sorted(miss)


if __name__ == "__main__":
    # hreflang in der deutschen Quelle sicherstellen
    src = ROOT / "index.html"
    s = src.read_text()
    alt = "".join(f'<link rel="alternate" hreflang="{c}" href="{SITE}/{p}">' for c, p in [("de", "index.html"), ("en", "en/index.html"), ("es", "es/index.html"), ("x-default", "index.html")])
    s = re.sub(r'<link rel="alternate" hreflang[^>]*>', "", s)
    s = s.replace('<link rel="canonical"', alt + '<link rel="canonical"', 1)
    src.write_text(s)
    for c in LANGS:
        m = build(c)
        if m and c == "en": print("Nicht übersetzte Texte:", *m, sep="\n  ")

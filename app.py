import os
import sys
import types
import html
import re
from datetime import datetime

import requests
from flask import Flask, jsonify, send_from_directory

# ---------------------------------------------------------------------------
# Compatibility shim: Python 3.13 removes the deprecated 'cgi' module, but
# feedparser (and possibly other deps) still rely on it. Create a minimal stub
# that provides escape() and parse_header().
# ---------------------------------------------------------------------------
if "cgi" not in sys.modules:
    cgi_stub = types.ModuleType("cgi")
    cgi_stub.escape = html.escape  # type: ignore

    def _parse_header(line: str):  # type: ignore
        if not line:
            return "", {}
        parts = line.split(";")
        main_value = parts[0].strip()
        params = {}
        for part in parts[1:]:
            if "=" in part:
                k, v = part.split("=", 1)
                params[k.strip().lower()] = v.strip().strip("\"")
        return main_value, params

    cgi_stub.parse_header = _parse_header  # type: ignore
    sys.modules["cgi"] = cgi_stub

# ---------------------------------------------------------------------------
# Flask app initialisation
# ---------------------------------------------------------------------------
app = Flask(__name__, static_folder="static")

# Updated list of RSS feeds (Russian-language gaming sites requested by the user)
# If a feed becomes unavailable, `feedparser` will simply return an empty result for that URL,
# ensuring the aggregator continues to function without breaking other sources.
FEED_URLS = [
    "https://www.goha.ru/rss/videogames",  # GoHa.Ru – Видеоигры
    "https://rss.stopgame.ru/rss_all.xml", # StopGame – все разделы
    "https://kanobu.ru/rss",               # Канобу – Лента новостей (игры / развлечения)
    "https://vgtimes.ru/rss",              # VGTimes – Игровые новости
]

STEAM_SPECIALS_API = "https://store.steampowered.com/api/featuredcategories?cc=us&l=english"
EPIC_FREE_GAMES_API = "https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=en-US&country=US&allowCountries=US"

# Ensure compatibility shim is registered before importing feedparser
import feedparser

# ---------------------------------------------------------------------------
# Helper functions to fetch data
# ---------------------------------------------------------------------------

def fetch_news():
    """Aggregate entries from all configured RSS feeds."""
    items = []
    for url in FEED_URLS:
        feed = feedparser.parse(url)
        for entry in feed.entries:
            raw_pub = str(
                entry.get("published")
                or entry.get("updated")
                or entry.get("pubDate")
                or ""
            )
            # Reformat date string to omit timezone (e.g., "+0000") for cleaner UI
            try:
                parsed_pub = feedparser._parse_date(raw_pub)  # type: ignore
                if parsed_pub:
                    published = datetime(*parsed_pub[:6]).strftime("%a, %d %b %Y %H:%M")
                else:
                    published = raw_pub.split(" +")[0]
            except Exception:
                published = raw_pub.split(" +")[0]
            items.append(
                {
                    "title": entry.get("title"),
                    "link": entry.get("link"),
                    "published": published,
                    # Remove in-feed "Читать дальше/далее" read-more anchors to avoid duplicate buttons in the UI
                    "summary": re.sub(
                        r"<a[^>]*>(?:\s*Читать(?:\s+(?:дальше|далее))?[^<]*)<\/a>",
                        "",
                        str(entry.get("summary", "")),
                        flags=re.IGNORECASE,
                    ),
                }
            )

    # Sort by publication date (newest first)
    def sort_key(item):
        try:
            parsed = feedparser._parse_date(item["published"])  # type: ignore
            return datetime(*parsed[:6]) if parsed else datetime.min
        except Exception:
            return datetime.min

    items.sort(key=sort_key, reverse=True)
    return items


def fetch_deals(limit: int = 30):
    """Fetch top discounted Steam specials."""
    try:
        response = requests.get(STEAM_SPECIALS_API, timeout=10)
        response.raise_for_status()
        data = response.json()
        specials = data.get("specials", {}).get("items", [])
        # Sort by highest discount
        specials.sort(key=lambda x: x.get("discount_percent", 0), reverse=True)
        deals = []
        for item in specials[:limit]:
            original_cents = item.get("original_price", 0)
            final_cents = item.get("final_price", 0)
            deal = {
                "dealID": str(item.get("id")),
                "title": item.get("name"),
                "salePrice": f"{final_cents / 100:.2f}",
                "normalPrice": f"{original_cents / 100:.2f}" if original_cents else "",
                "savings": str(item.get("discount_percent", 0)),
                "link": f"https://store.steampowered.com/app/{item.get('id')}/",
            }
            deals.append(deal)
        return deals
    except requests.RequestException:
        return []


def fetch_freebies():
    """Fetch current Epic Games Store free titles."""
    try:
        response = requests.get(EPIC_FREE_GAMES_API, timeout=10)
        response.raise_for_status()
        data = response.json()
        elements = data.get("data", {}).get("Catalog", {}).get("searchStore", {}).get("elements", [])
        freebies = []
        for el in elements:
            if not el.get("promotions"):
                continue
            offers = el["promotions"].get("promotionalOffers", [])
            if not offers:
                continue
            discount = offers[0].get("promotionalOffers", [])[0].get("discountSetting", {}).get("discountPercentage", 0)
            if discount == 0:
                free_item = {
                    "dealID": el.get("id"),
                    "title": el.get("title"),
                    "salePrice": "0",
                    "normalPrice": "",  # not provided
                    "savings": "100",
                    "link": f"https://store.epicgames.com/p/{el.get('productSlug')}" if el.get("productSlug") else "https://store.epicgames.com/",
                }
                freebies.append(free_item)
        return freebies
    except requests.RequestException:
        return []


# ---------------------------------------------------------------------------
# API endpoints consumed by React front-end
# ---------------------------------------------------------------------------

@app.route("/api/news")
def api_news():
    return jsonify(fetch_news())


@app.route("/api/deals")
def api_deals():
    return jsonify({"deals": fetch_deals(), "freebies": fetch_freebies()})


# ---------------------------------------------------------------------------
# Serve React Single Page Application
# ---------------------------------------------------------------------------

REACT_DIR = os.path.join(app.root_path, "static", "react")

@app.route("/")
def react_index():
    return send_from_directory(REACT_DIR, "index.html")


@app.route("/<path:path>")
def static_proxy(path):
    file_path = os.path.join(REACT_DIR, path)
    if os.path.exists(file_path):
        return send_from_directory(REACT_DIR, path)
    # For client-side routing – always return index.html
    return send_from_directory(REACT_DIR, "index.html")


# ---------------------------------------------------------------------------
# Development entrypoint
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host=host, port=port)
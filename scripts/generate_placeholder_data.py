"""
Generate placeholder JSON data files for development.
Run this BEFORE you have the real Chennai Metro data to verify the UI works.
Once you have the real data, run process_data.py instead.

Usage: python scripts/generate_placeholder_data.py
"""


import json
import random
import csv
from pathlib import Path

# Output directory for generated files
OUT = Path(__file__).parent.parent / "public" / "data"
OUT.mkdir(parents=True, exist_ok=True)

import math

# Converts stations.csv to stations.json
with open('public/data/stations.csv', newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    stations = [row for row in reader]

with open('public/data/stations.json', 'w', encoding='utf-8') as jsonfile:
    json.dump(stations, jsonfile, indent=2)

print("stations.json generated.")
STATIONS = [
    {"id": "GVE", "name": "Government Estate", "line": "blue", "coords": [80.2747, 13.0627]},
    {"id": "LIC", "name": "LIC", "line": "blue", "coords": [80.2781, 13.0622]},
    {"id": "AGD", "name": "AG-DMS", "line": "blue", "coords": [80.2497, 13.0447]},
    {"id": "SDP", "name": "Saidapet", "line": "blue", "coords": [80.2209, 13.0291]},
    {"id": "GND", "name": "Guindy", "line": "blue", "coords": [80.2206, 13.0067]},
    {"id": "APT", "name": "Airport", "line": "blue", "coords": [80.1709, 12.9941]},
    {"id": "KPK", "name": "Kilpauk", "line": "green", "coords": [80.2422, 13.0822]},
    {"id": "CHT", "name": "Chetpet", "line": "green", "coords": [80.2375, 13.0825]},
    {"id": "ANE", "name": "Anna Nagar East", "line": "green", "coords": [80.2172, 13.0872]},
    {"id": "ANT", "name": "Anna Nagar Tower", "line": "green", "coords": [80.2100, 13.0900]},
    {"id": "THM", "name": "Thirumangalam", "line": "green", "coords": [80.2033, 13.1011]},
    {"id": "KYB", "name": "Koyambedu", "line": "green", "coords": [80.2090, 13.0700]},
    {"id": "ARB", "name": "Arumbakkam", "line": "green", "coords": [80.2060, 13.0705]},
    {"id": "VDP", "name": "Vadapalani", "line": "green", "coords": [80.2122, 13.0492]},
    {"id": "ASK", "name": "Ashok Nagar", "line": "green", "coords": [80.2122, 13.0382]},
    {"id": "STM", "name": "St. Thomas Mount", "line": "green", "coords": [80.2033, 13.0067]},
]

# --- Build stations.geojson ---
features = []
for s in STATIONS:
    features.append({
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": s["coords"]},
        "properties": {
            "id": s["id"],
            "name": s["name"],
            "line": s["line"],
        },
    })
geojson = {"type": "FeatureCollection", "features": features}
(OUT / "stations.geojson").write_text(json.dumps(geojson))
print(f"Wrote stations.geojson ({len(features)} stations)")

# --- Build ridership_hourly.json ---
def intraday_profile(hour, is_major=False):
    profiles = [
        20, 10, 8, 6, 8, 25, 80, 140, 120, 70, 60, 65,
        70, 65, 60, 70, 100, 130, 120, 90, 65, 50, 40, 30,
    ]
    base = profiles[hour]
    multiplier = random.uniform(2.5, 5.0) if is_major else random.uniform(0.3, 1.2)
    return int(base * multiplier)

MAJOR = {"CEN", "APT", "STM"}

hourly = {}
for s in STATIONS:
    is_major = s["id"] in MAJOR
    hourly[s["id"]] = {
        str(h): {
            "entries": intraday_profile(h, is_major),
            "exits": intraday_profile(h, is_major),
        }
        for h in range(24)
    }
(OUT / "ridership_hourly.json").write_text(json.dumps(hourly))
print("Wrote ridership_hourly.json")

# --- Build ridership_weekday.json ---
def daily_total(station_id, is_major, scale=1.0):
    base = 45000 if is_major else random.randint(4000, 18000)
    t = int(base * scale * random.uniform(0.85, 1.15))
    return {"entries": t // 2, "exits": t - t // 2, "total": t}

weekday = {s["id"]: daily_total(s["id"], s["id"] in MAJOR, 1.0) for s in STATIONS}
(OUT / "ridership_weekday.json").write_text(json.dumps(weekday))
print("Wrote ridership_weekday.json")

weekend = {s["id"]: daily_total(s["id"], s["id"] in MAJOR, 0.65) for s in STATIONS}
(OUT / "ridership_weekend.json").write_text(json.dumps(weekend))
print("Wrote ridership_weekend.json")

# --- Build od_flows.json (top 100 OD pairs) ---
od_flows = []
for i, src in enumerate(STATIONS):
    for dst in STATIONS[i+1:]:
        same_line = src["line"] == dst["line"]
        dist = math.sqrt((src["coords"][0]-dst["coords"][0])**2 + (src["coords"][1]-dst["coords"][1])**2)
        if dist > 0.15:
            continue
        base = 5000 if same_line else 1000
        is_both_major = src["id"] in MAJOR and dst["id"] in MAJOR
        vol = int(base * random.uniform(0.5, 2.0) * (2.5 if is_both_major else 1.0))
        od_flows.append({"from": src["id"], "to": dst["id"], "volume": vol})
od_flows.sort(key=lambda x: x["volume"], reverse=True)
od_flows = od_flows[:100]
(OUT / "od_flows.json").write_text(json.dumps(od_flows))
print(f"Wrote od_flows.json ({len(od_flows)} pairs)")

print("\nPlaceholder data generation complete!")
print("Run 'npm run dev' to start the dev server.")

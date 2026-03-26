import csv
import json

# Converts stations.csv to stations.json
with open('public/data/stations.csv', newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    stations = [row for row in reader]

with open('public/data/stations.json', 'w', encoding='utf-8') as jsonfile:
    json.dump(stations, jsonfile, indent=2)

print("stations.json generated.")

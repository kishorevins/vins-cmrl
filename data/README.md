# Chennai Metro Data Files

This folder contains JSON data files used by the Chennai Metro Intelligence Map visualization.

## File Descriptions

### Station Data

#### `stations.json`
**Format**: Array of station objects
```json
[
  {
    "station_code": "EGM",
    "station_name": "Egmore",
    "line": "Blue Line",
    "latitude": "13.0827",
    "longitude": "80.2707"
  }
]
```
**Used by**: Station panels, tooltips, lookups

#### `stations.geojson`
**Format**: GeoJSON FeatureCollection with Point features for each station
**Used by**: Station markers on map

### Metro Lines

#### `metro_lines.json`
**Format**: Array of line objects with geometry paths
```json
[
  {
    "id": "blue",
    "color": [0, 114, 198],
    "path": [[lon, lat], [lon, lat], ...]
  }
]
```
**Used by**: Metro line rendering layer

### Ridership Data

#### `ridership_hourly.json`
Hourly entry/exit counts by station and hour (0-23)
**Used by**: Time slider, hourly heatmap

#### `ridership_weekday.json` & `ridership_weekend.json`
Daily total ridership (entries, exits, total) by station
**Used by**: Weekday toggle, volume layer

### Origin-Destination Flows

#### `od_flows.json`
Array of OD pairs with flow volumes
```json
[{"from": "EGM", "to": "APT", "volume": 9263}]
```
**Used by**: OD flow visualization

### Population / Coverage

#### `population_grid.json`
Grid cells with population weight values
**Used by**: Coverage heatmap, population density layer

## Data Generation

Generate all files via:
```sh
cd ../scripts
python process_cmrl_data.py      # Recommended: complete pipeline
# OR
python generate_placeholder_data.py  # Development: synthetic data only
python fetch_metro_lines.py      # Download real metro lines from OSM
```

## Station Code Reference

**Blue Line**: WSP, EGM, CEN, GVE, LIC, AGD, SDP, GND, APT
**Green Line**: KPK, CHT, ANE, ANT, THM, KYB, ARB, VDP, ASK, STM
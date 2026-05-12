# 🗺️ LankaScore Heatmap

> Interactive Z-Score visualization tool for Sri Lankan A/L students — see which university districts you qualify for in real time.

[![CI](https://github.com/yourusername/lankascore-heatmap/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/lankascore-heatmap/actions)

![LankaScore Screenshot](docs/screenshot.png)

## ✨ Features

| Feature | Description |
|---|---|
|  **Interactive Map** | GeoJSON map of all 25 Sri Lanka districts |
|  **What-If Slider** | Real-time Z-score slider (0.0000–3.0000) with live district recoloring |
|  **14 Courses** | Medicine, Engineering, CS, Law, Dentistry, Architecture + 8 more |
|  **5 Years** | Historical cutoff data from 2019–2023 |
|  **Trend Charts** | Per-district cutoff trends with your score overlay |
|  **Search & Filter** | Search districts by name (⌘K), filter by eligibility status |
|  **Rankings** | District leaderboard sortable by margin, cutoff, or name |
|  **Mobile Bottom Sheet** | Physics-based drag sheet with snap points |
|  **Neon Dark Theme** | Glassmorphism UI with neon cyan/green color system |

##  Quick Start

```bash
# 1. Clone
git clone https://github.com/yourusername/lankascore-heatmap.git
cd lankascore-heatmap

# 2. Install
npm install

# 3. Run
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

##  Tech Stack

- **Framework:** Vite + React + TypeScript
- **Styling:** Tailwind CSS with custom neon theme
- **Map:** React-Leaflet + CartoDB Dark Matter tiles (free, no API key)
- **Charts:** Recharts
- **Animations:** Framer Motion
- **Data:** Local JSON (offline-first, no backend)

##  Project Structure

```
lankascore-heatmap/
├── public/
│   └── sri-lanka-districts.geojson    # 25-district GeoJSON
├── src/
│   ├── components/
│   │   ├── AppHeader.tsx              # Live eligible counter + score display
│   │   ├── DistrictMap.tsx            # React-Leaflet map with imperative styling
│   │   ├── SliderPanel.tsx            # What-If slider with presets
│   │   ├── CourseSelector.tsx         # Dropdown + year picker
│   │   ├── SearchBar.tsx              # ⌘K search with live district dimming
│   │   ├── FilterChips.tsx            # Eligible / Locked / NQC toggles
│   │   ├── DistrictDetailPanel.tsx    # Click panel with university list
│   │   ├── HistoricalTrendChart.tsx   # Recharts line chart per district
│   │   ├── DistrictRankingLeaderboard.tsx
│   │   └── MobileBottomSheet.tsx      # Drag sheet with snap points
│   ├── data/
│   │   └── data.json                  # 14 courses × 25 districts × 5 years
│   ├── hooks/
│   │   └── useZScore.ts               # Data access + eligibility hooks
│   ├── utils/
│   │   └── colorLogic.ts              # District → color mapping logic
│   └── types/index.ts
├── scripts/
│   └── extract_ugc_pdf.py             # PDF data extraction script
├── vercel.json
├── netlify.toml
└── .github/workflows/ci.yml
```

## Color System

| State | Color | Condition |
|---|---|---|
| **High margin** | Neon Cyan `#00f5ff` | score ≥ cutoff + 0.5 |
| **Eligible** | Neon Green `#00ff88` | score ≥ cutoff |
| **Locked** | Slate Gray `#334155` | score < cutoff |
| **NQC** | Dark `#0f172a` | No Qualified Candidates |

## Data Extraction (Real UGC Data)

To replace the seeded data with real UGC cutoffs:

```bash
# Install Python dependencies
pip install camelot-py[cv] tabula-py pandas

# Extract from a UGC PDF
python scripts/extract_ugc_pdf.py \
  --pdf path/to/ugc_admission_2023.pdf \
  --year 2023 \
  --merge

# Extract a specific course only
python scripts/extract_ugc_pdf.py \
  --pdf ugc_2023.pdf \
  --year 2023 \
  --course "Medicine" \
  --merge
```

The script auto-detects table format (district-first or course-first), handles NQC markers, and merges into the existing `data.json`.

## Deploy

### Vercel (recommended)
```bash
npm i -g vercel
vercel --prod
```

### Netlify
```bash
npm run build
# Drag the dist/ folder to netlify.com/drop
```

### GitHub Actions auto-deploy
Set these secrets in your repo:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Every push to `main` triggers a production deploy.

##  Git History

| Commit | Description |
|---|---|
| `init` | Scaffold Vite + React + TypeScript |
| `init` | Configure Tailwind neon theme + TypeScript types |
| `feat` | Add 25-district GeoJSON |
| `feat` | Z-score data layer (14 courses × 25 districts × 5 years) |
| `feat` | District map with CartoDB tiles + hover |
| `feat` | What-If slider + course/year selector |
| `feat` | Search bar (⌘K) + filter chips |
| `feat` | District detail panel + historical trend chart |
| `feat` | App header + district ranking leaderboard |
| `feat` | Mobile bottom sheet with physics drag |
| `feat` | Full App.tsx wiring |
| `chore` | Deploy configs + CI pipeline |
| `chore` | PDF extraction script |
| `docs` | README |

## License

MIT — feel free to use this for your portfolio or adapt for other countries' university admission systems.

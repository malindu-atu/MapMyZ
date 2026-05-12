#!/usr/bin/env python3
"""
LankaScore — UGC Z-Score PDF Extraction Script
===============================================
Extracts minimum Z-score cutoff data from official UGC admission PDFs
and outputs a structured data.json compatible with the LankaScore app.

Requirements:
    pip install camelot-py[cv] tabula-py PyPDF2 pandas

Usage:
    python extract_ugc_pdf.py --pdf path/to/ugc_2023.pdf --year 2023
    python extract_ugc_pdf.py --pdf path/to/ugc_2023.pdf --year 2023 --course "Medicine"
    python extract_ugc_pdf.py --merge --years 2019 2020 2021 2022 2023

Output:
    src/data/data.json (merged with existing data if --merge flag is used)
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Optional

# ── Graceful imports ──────────────────────────────────────────────────────────
try:
    import camelot
    HAS_CAMELOT = True
except ImportError:
    HAS_CAMELOT = False
    print("⚠ camelot-py not installed. Falling back to tabula-py.")

try:
    import tabula
    import pandas as pd
    HAS_TABULA = True
except ImportError:
    HAS_TABULA = False

if not HAS_CAMELOT and not HAS_TABULA:
    print("❌ Neither camelot-py nor tabula-py is installed.")
    print("   Run: pip install camelot-py[cv] tabula-py pandas")
    sys.exit(1)

# ── Constants ─────────────────────────────────────────────────────────────────

DISTRICTS = [
    "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya",
    "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar",
    "Mullaitivu", "Vavuniya", "Puttalam", "Kurunegala", "Anuradhapura",
    "Polonnaruwa", "Badulla", "Moneragala", "Ratnapura", "Kegalle",
    "Ampara", "Batticaloa", "Trincomalee"
]

COURSES = [
    "Medicine", "Dentistry", "Engineering", "Computer Science",
    "Architecture", "Law", "Veterinary Science", "Agriculture",
    "Management", "Arts", "Science", "Physical Science",
    "Bio Science", "Quantity Surveying"
]

# UGC PDFs use various spellings — normalize them
COURSE_ALIASES = {
    "medical": "Medicine",
    "medicine": "Medicine",
    "dental": "Dentistry",
    "dentistry": "Dentistry",
    "engineering": "Engineering",
    "computer science": "Computer Science",
    "cs": "Computer Science",
    "it": "Computer Science",
    "architecture": "Architecture",
    "law": "Law",
    "veterinary": "Veterinary Science",
    "vet": "Veterinary Science",
    "agriculture": "Agriculture",
    "agricultural": "Agriculture",
    "management": "Management",
    "arts": "Arts",
    "science": "Science",
    "physical science": "Physical Science",
    "bio science": "Bio Science",
    "biological science": "Bio Science",
    "quantity surveying": "Quantity Surveying",
    "qs": "Quantity Surveying",
}

DISTRICT_ALIASES = {
    "nuwara-eliya": "Nuwara Eliya",
    "nuwaraeliya": "Nuwara Eliya",
    "kilinochchi": "Kilinochchi",
    "mullaitivu": "Mullaitivu",
    "polonnaruwa": "Polonnaruwa",
    "anuradhapura": "Anuradhapura",
    "trincomalee": "Trincomalee",
    "batticaloa": "Batticaloa",
    "moneragala": "Moneragala",
    "hambantota": "Hambantota",
}

NQC_MARKERS = {"nqc", "n.q.c", "n/a", "-", "—", "nil", "none", "no qualified"}

# ── Z-score extraction ────────────────────────────────────────────────────────

def normalize_zscore(raw: str) -> Optional[float]:
    """Parse a raw cell string to a float Z-score, or None if NQC."""
    cleaned = raw.strip().lower()
    if any(marker in cleaned for marker in NQC_MARKERS):
        return None  # NQC
    # Extract numeric value (handles 1.9876, 1,9876, (1.9876), etc.)
    match = re.search(r"(\d+[.,]\d+)", cleaned)
    if match:
        value = float(match.group(1).replace(",", "."))
        if 0.0 <= value <= 3.0:
            return value
    return None


def normalize_district(raw: str) -> Optional[str]:
    """Normalize a district name from the PDF to our canonical spelling."""
    cleaned = raw.strip().lower().replace("-", " ").replace("_", " ")
    for district in DISTRICTS:
        if cleaned == district.lower():
            return district
    for alias, canonical in DISTRICT_ALIASES.items():
        if alias in cleaned:
            return canonical
    # Fuzzy: check if any district name starts with the cleaned string
    for district in DISTRICTS:
        if district.lower().startswith(cleaned[:5]):
            return district
    return None


def normalize_course(raw: str) -> Optional[str]:
    """Normalize a course name to our canonical name."""
    cleaned = raw.strip().lower()
    for alias, canonical in COURSE_ALIASES.items():
        if alias in cleaned:
            return canonical
    for course in COURSES:
        if course.lower() in cleaned:
            return course
    return None


# ── Camelot extraction ────────────────────────────────────────────────────────

def extract_with_camelot(pdf_path: str, year: int, target_course: Optional[str] = None) -> dict:
    """
    Extract Z-score tables from UGC PDF using camelot-py (lattice mode for bordered tables).
    Returns: { course: { district: { cutoff_zscore, universities, nqc } } }
    """
    print(f"📄 Extracting with camelot from: {pdf_path}")
    results = {}

    try:
        # Try lattice mode first (bordered tables)
        tables = camelot.read_pdf(pdf_path, flavor="lattice", pages="all")
        print(f"   Found {len(tables)} tables (lattice mode)")

        if len(tables) == 0:
            # Fallback to stream mode
            tables = camelot.read_pdf(pdf_path, flavor="stream", pages="all")
            print(f"   Found {len(tables)} tables (stream mode)")

        for i, table in enumerate(tables):
            df = table.df
            if df.empty or len(df.columns) < 3:
                continue

            print(f"   Processing table {i+1}/{len(tables)} — {df.shape[0]} rows × {df.shape[1]} cols")
            _process_dataframe(df, results, target_course)

    except Exception as e:
        print(f"   ⚠ Camelot error: {e}")

    return results


# ── Tabula extraction ─────────────────────────────────────────────────────────

def extract_with_tabula(pdf_path: str, year: int, target_course: Optional[str] = None) -> dict:
    """
    Extract Z-score tables from UGC PDF using tabula-py.
    Returns: { course: { district: { cutoff_zscore, universities, nqc } } }
    """
    print(f"📄 Extracting with tabula from: {pdf_path}")
    results = {}

    try:
        dfs = tabula.read_pdf(
            pdf_path,
            pages="all",
            multiple_tables=True,
            guess=True,
            silent=True,
        )
        print(f"   Found {len(dfs)} tables")

        for i, df in enumerate(dfs):
            if df.empty or len(df.columns) < 3:
                continue
            print(f"   Processing table {i+1}/{len(dfs)} — {df.shape[0]} rows × {df.shape[1]} cols")
            _process_dataframe(df, results, target_course)

    except Exception as e:
        print(f"   ⚠ Tabula error: {e}")

    return results


def _process_dataframe(df, results: dict, target_course: Optional[str]):
    """
    Process a DataFrame extracted from a UGC PDF table.
    
    UGC PDFs typically have tables with structure:
    | District | Course1 | Course2 | Course3 | ...
    or
    | Course   | District | Z-Score | University |
    
    We detect which format and parse accordingly.
    """
    import pandas as pd

    # Convert all to strings for safe processing
    df = df.astype(str).replace("nan", "")

    headers = [str(h).strip() for h in df.iloc[0]]
    
    # Detect if first column is districts or courses
    first_col_districts = sum(
        1 for val in df.iloc[1:, 0]
        if normalize_district(str(val)) is not None
    )
    first_col_courses = sum(
        1 for val in df.iloc[1:, 0]
        if normalize_course(str(val)) is not None
    )

    if first_col_districts > first_col_courses:
        _parse_district_first(df, results, target_course)
    else:
        _parse_course_first(df, results, target_course)


def _parse_district_first(df, results: dict, target_course: Optional[str]):
    """Parse table where rows = districts, columns = courses."""
    # Header row contains course names
    header_row = df.iloc[0]
    col_to_course = {}
    for col_idx, header in enumerate(header_row):
        course = normalize_course(str(header))
        if course:
            col_to_course[col_idx] = course

    for row_idx in range(1, len(df)):
        row = df.iloc[row_idx]
        district = normalize_district(str(row.iloc[0]))
        if not district:
            continue

        for col_idx, course in col_to_course.items():
            if target_course and course != target_course:
                continue
            if col_idx >= len(row):
                continue

            zscore = normalize_zscore(str(row.iloc[col_idx]))
            _add_result(results, course, district, zscore)


def _parse_course_first(df, results: dict, target_course: Optional[str]):
    """Parse table where rows = courses, columns = districts."""
    header_row = df.iloc[0]
    col_to_district = {}
    for col_idx, header in enumerate(header_row):
        district = normalize_district(str(header))
        if district:
            col_to_district[col_idx] = district

    for row_idx in range(1, len(df)):
        row = df.iloc[row_idx]
        course = normalize_course(str(row.iloc[0]))
        if not course:
            continue
        if target_course and course != target_course:
            continue

        for col_idx, district in col_to_district.items():
            if col_idx >= len(row):
                continue
            zscore = normalize_zscore(str(row.iloc[col_idx]))
            _add_result(results, course, district, zscore)


def _add_result(results: dict, course: str, district: str, zscore: Optional[float]):
    if course not in results:
        results[course] = {}
    results[course][district] = {
        "cutoff_zscore": zscore if zscore is not None else 0,
        "universities": [],  # Populate separately from university list PDFs
        "nqc": zscore is None,
    }


# ── Output generation ─────────────────────────────────────────────────────────

def merge_into_database(extracted: dict, year: int, existing_path: str) -> dict:
    """Merge extracted year data into existing database JSON."""
    if os.path.exists(existing_path):
        with open(existing_path) as f:
            db = json.load(f)
    else:
        db = {}

    year_str = str(year)
    for course, districts in extracted.items():
        if course not in db:
            db[course] = {}
        if year_str not in db[course]:
            db[course][year_str] = {}
        db[course][year_str].update(districts)
        print(f"   ✓ Merged {len(districts)} districts for {course} ({year})")

    return db


def generate_report(extracted: dict, year: int):
    """Print a summary report of extraction results."""
    print(f"\n{'='*60}")
    print(f"  EXTRACTION REPORT — {year}")
    print(f"{'='*60}")
    total_districts = 0
    total_nqc = 0
    for course, districts in sorted(extracted.items()):
        nqc_count = sum(1 for d in districts.values() if d["nqc"])
        filled = len(districts)
        total_districts += filled
        total_nqc += nqc_count
        status = "✓" if filled == 25 else f"⚠ {filled}/25"
        print(f"  {status}  {course:<25} NQC: {nqc_count}")
    print(f"{'─'*60}")
    print(f"  Total: {total_districts} entries, {total_nqc} NQC")
    print(f"{'='*60}\n")


# ── CLI ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Extract UGC Z-Score data from PDF")
    parser.add_argument("--pdf", help="Path to UGC PDF file")
    parser.add_argument("--year", type=int, help="Academic year (e.g. 2023)")
    parser.add_argument("--course", help="Extract specific course only")
    parser.add_argument("--output", default="src/data/data.json", help="Output JSON path")
    parser.add_argument("--merge", action="store_true", help="Merge with existing data.json")
    parser.add_argument("--engine", choices=["camelot", "tabula", "auto"], default="auto")
    args = parser.parse_args()

    if not args.pdf or not args.year:
        parser.print_help()
        print("\nExample:")
        print("  python scripts/extract_ugc_pdf.py --pdf ugc_2023.pdf --year 2023")
        sys.exit(0)

    if not os.path.exists(args.pdf):
        print(f"❌ PDF not found: {args.pdf}")
        sys.exit(1)

    # Extract
    if args.engine == "camelot" or (args.engine == "auto" and HAS_CAMELOT):
        extracted = extract_with_camelot(args.pdf, args.year, args.course)
    elif args.engine == "tabula" or (args.engine == "auto" and HAS_TABULA):
        extracted = extract_with_tabula(args.pdf, args.year, args.course)
    else:
        print("❌ No extraction engine available")
        sys.exit(1)

    if not extracted:
        print("⚠ No data extracted. The PDF may have scanned images instead of text tables.")
        print("  Try running OCR first: pip install pytesseract pdf2image")
        sys.exit(1)

    generate_report(extracted, args.year)

    # Save
    if args.merge:
        db = merge_into_database(extracted, args.year, args.output)
    else:
        db = {course: {str(args.year): districts} for course, districts in extracted.items()}

    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    with open(args.output, "w") as f:
        json.dump(db, f, indent=2)

    print(f"✅ Saved to {args.output}")
    print(f"   Courses: {len(db)}")


if __name__ == "__main__":
    main()

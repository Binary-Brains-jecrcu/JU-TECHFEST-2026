import sqlite3
import os
import json

DB_PATH = os.path.join(os.path.dirname(__file__), "goldendataset.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_database():
    """Initializes the SQLite GoldenDataset schema."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS golden_drugs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key_slug TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        generic_name TEXT NOT NULL,
        category TEXT NOT NULL,
        rxnorm_cui TEXT NOT NULL,
        ndc TEXT,
        standard_dose_range TEXT NOT NULL,
        max_daily_dose TEXT NOT NULL,
        max_daily_dose_mg REAL,
        standard_routes TEXT NOT NULL,
        standard_frequencies TEXT NOT NULL,
        contraindications TEXT,
        severe_ddi TEXT,
        boxed_warning TEXT,
        audit_rule TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS golden_interactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        drug_a TEXT NOT NULL,
        drug_b TEXT NOT NULL,
        severity TEXT NOT NULL,
        mechanism TEXT NOT NULL,
        audit_rule TEXT NOT NULL
    );
    """)

    conn.commit()

    # Auto-seed if database is freshly created and empty
    cursor.execute("SELECT COUNT(*) FROM golden_drugs")
    row_count = cursor.fetchone()[0]
    conn.close()

    if row_count == 0:
        try:
            from seed_goldendataset import seed_database
            seed_database()
        except Exception as e:
            print(f"Auto-seed notification: {e}")

def query_golden_drug(drug_name_or_generic: str):
    """
    Executes a strict SQL query to find a drug in the SQLite GoldenDataset.
    Checks exact match, lowercased name, and generic name.
    """
    clean_term = drug_name_or_generic.strip().lower()
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Exact key slug match
    cursor.execute("SELECT * FROM golden_drugs WHERE key_slug = ?", (clean_term,))
    row = cursor.fetchone()
    if row:
        conn.close()
        return dict(row)

    # 2. Case-insensitive exact name match
    cursor.execute("SELECT * FROM golden_drugs WHERE LOWER(name) = ? OR LOWER(generic_name) = ?", (clean_term, clean_term))
    row = cursor.fetchone()
    if row:
        conn.close()
        return dict(row)

    # 3. Substring / Token matching
    cursor.execute("""
        SELECT * FROM golden_drugs 
        WHERE ? LIKE '%' || LOWER(key_slug) || '%'
           OR LOWER(name) LIKE '%' || ? || '%'
           OR LOWER(generic_name) LIKE '%' || ? || '%'
        LIMIT 1
    """, (clean_term, clean_term, clean_term))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def query_golden_interaction(drug_a: str, drug_b: str):
    """Executes a strict SQL query to find interactions between two drugs."""
    da = drug_a.strip().lower()
    db = drug_b.strip().lower()
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM golden_interactions 
        WHERE (? LIKE '%' || LOWER(drug_a) || '%' AND ? LIKE '%' || LOWER(drug_b) || '%')
           OR (? LIKE '%' || LOWER(drug_b) || '%' AND ? LIKE '%' || LOWER(drug_a) || '%')
           OR (LOWER(drug_a) LIKE '%' || ? || '%' AND LOWER(drug_b) LIKE '%' || ? || '%')
           OR (LOWER(drug_b) LIKE '%' || ? || '%' AND LOWER(drug_a) LIKE '%' || ? || '%')
        LIMIT 1
    """, (da, db, da, db, da, db, da, db))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

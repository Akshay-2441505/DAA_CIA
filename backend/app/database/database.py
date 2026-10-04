import os
import sqlite3
from pathlib import Path

DEFAULT_DB_PATH = Path(__file__).resolve().parent / "powersched.db"
env_db = os.getenv("DATABASE_PATH")
if env_db:
    p = Path(env_db)
    if not p.is_absolute():
        # If running from backend directory, strip leading 'backend/'
        parts = p.parts
        if parts and parts[0] == "backend":
            p = Path(*parts[1:])
        backend_dir = Path(__file__).resolve().parent.parent.parent
        p = (backend_dir / p).resolve()
    DB_PATH = str(p)
else:
    DB_PATH = str(DEFAULT_DB_PATH)



def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def init_db():
    os.makedirs(os.path.dirname(os.path.abspath(DB_PATH)), exist_ok=True)
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS jobs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                duration_minutes INTEGER NOT NULL,
                power_watts REAL NOT NULL,
                deadline TEXT NOT NULL,
                priority INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS price_slots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                delivery_date TEXT NOT NULL,
                slot_index INTEGER NOT NULL,
                start_time TEXT NOT NULL,
                end_time TEXT NOT NULL,
                price_rs_mwh REAL NOT NULL,
                price_rs_kwh REAL NOT NULL,
                source TEXT NOT NULL,
                fetched_at TEXT NOT NULL
            );
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS schedules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                strategy TEXT NOT NULL,
                horizon_start TEXT NOT NULL,
                horizon_end TEXT NOT NULL,
                total_jobs INTEGER NOT NULL,
                scheduled_count INTEGER NOT NULL,
                unscheduled_count INTEGER NOT NULL,
                total_energy_kwh REAL NOT NULL,
                total_cost_rs REAL NOT NULL,
                deadline_compliance_rate REAL NOT NULL,
                data_json TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
        """)
        conn.commit()


if __name__ == "__main__":
    init_db()
    print(f"Initialized database at {DB_PATH}")

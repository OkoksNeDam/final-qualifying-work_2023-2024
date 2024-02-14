import sqlite3

DB_PATH = "/Users/pavlom/Desktop/final-qualifying-work_2023-2024/GelioGeos/db.sqlite3"
TABLE_NAME = "ts_visualizer_magneticfielddata"

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

cur.execute(f"INSERT INTO {TABLE_NAME}('date', 'station', 'x', 'y', 'z')"
            f"VALUES('14.02.2024', 'KEV', 100, 200, 300);")
conn.commit()
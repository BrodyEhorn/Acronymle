import sqlite3
import json
import os

db_path = 'c:/Programming/Acronymle/backend/acronyms.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("SELECT acronym, words FROM acronyms WHERE length(acronym) = 2")
rows = cursor.fetchall()
for row in rows:
    print(f"Acronym: {row[0]}, Words: {json.loads(row[1])}")
conn.close()

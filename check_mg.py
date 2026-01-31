import sqlite3
import json

db_path = 'c:/Programming/Acronymle/backend/acronyms.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Find all acronyms with exactly 2 letters
cursor.execute("SELECT acronym, words, category FROM acronyms WHERE length(acronym) = 2")
rows = cursor.fetchall()

if rows:
    print("Found 2-letter acronyms:")
    for row in rows:
        print(f"  Acronym: {row[0]}, Words: {json.loads(row[1])}, Category: {row[2]}")
else:
    print("No 2-letter acronyms found")

# Also check for MG specifically
cursor.execute("SELECT acronym, words, category FROM acronyms WHERE acronym = 'MG'")
mg_row = cursor.fetchone()
if mg_row:
    print(f"\nFound MG: Words: {json.loads(mg_row[1])}, Category: {mg_row[2]}")
else:
    print("\nNo MG acronym found")

conn.close()

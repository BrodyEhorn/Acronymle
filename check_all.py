import sqlite3
import json

db_path = 'c:/Programming/Acronymle/backend/acronyms.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT acronym, words FROM acronyms ORDER BY acronym")
rows = cursor.fetchall()

print(f"Total acronyms: {len(rows)}\n")

for row in rows:
    acronym = row[0]
    words = json.loads(row[1])
    word_count = len(words)
    if word_count != 3 or acronym == 'MG':
        print(f"ISSUE: {acronym} has {word_count} words: {words}")

conn.close()

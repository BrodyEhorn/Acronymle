import sqlite3
import json
import os

def seed_db():
    db_path = os.path.join(os.path.dirname(__file__), 'acronyms.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS acronyms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            acronym TEXT UNIQUE,
            words TEXT
        )
    ''')
    
    # Seed OTW
    words = json.dumps(["on", "the", "way"])
    try:
        cursor.execute('INSERT OR IGNORE INTO acronyms (acronym, words) VALUES (?, ?)', ('OTW', words))
        conn.commit()
        print("Database seeded successfully with 'OTW'")
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    seed_db()

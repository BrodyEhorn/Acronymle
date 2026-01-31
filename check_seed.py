with open('c:/Programming/Acronymle/backend/seed.py', 'r') as f:
    content = f.read()

import re
matches = re.findall(r'\("([^"]+)",\s*\[([^\]]+)\],', content)
for acronym, words_str in matches:
    words = [w.strip() for w in words_str.split(',')]
    if len(words) != 3:
        print(f"Acronym: {acronym}, Words: {words}")

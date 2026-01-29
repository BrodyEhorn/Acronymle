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
            words TEXT,
            category TEXT
        )
    ''')
    
    acronyms_list = [
        ("OTW", ["on", "the", "way"], "Slang & Social"),
        ("AAA", ["American", "Automobile", "Association"], "Organizations"),
        ("ABS", ["Anti-lock", "Braking", "System"], "Technology"),
        ("ACL", ["Anterior", "Cruciate", "Ligament"], "Science & Medical"),
        ("AFK", ["Away", "From", "Keyboard"], "Slang & Social"),
        ("AGM", ["Annual", "General", "Meeting"], "Business & Finance"),
        ("AHT", ["Average", "Handle", "Time"], "Business & Finance"),
        ("AIS", ["Aeronautical", "Information", "Service"], "Technology"),
        ("AMD", ["Advanced", "Micro", "Devices"], "Technology"),
        ("API", ["Application", "Programming", "Interface"], "Technology"),
        ("ATM", ["Automated", "Teller", "Machine"], "Technology"),
        ("ATS", ["Applicant", "Tracking", "System"], "Business & Finance"),
        ("BAE", ["Before", "Anyone", "Else"], "Slang & Social"),
        ("BBS", ["Be", "Back", "Soon"], "Slang & Social"),
        ("BRB", ["Be", "Right", "Back"], "Slang & Social"),
        ("BTW", ["By", "The", "Way"], "Slang & Social"),
        ("CAD", ["Computer", "Aided", "Design"], "Technology"),
        ("CAR", ["Central", "African", "Republic"], "Geography"),
        ("CEO", ["Chief", "Executive", "Officer"], "Business & Finance"),
        ("CFO", ["Chief", "Financial", "Officer"], "Business & Finance"),
        ("CHF", ["Congestive", "Heart", "Failure"], "Science & Medical"),
        ("CIA", ["Central", "Intelligence", "Agency"], "Government & History"),
        ("CMS", ["Content", "Management", "System"], "Technology"),
        ("CNS", ["Central", "Nervous", "System"], "Science & Medical"),
        ("CPA", ["Certified", "Public", "Accountant"], "Business & Finance"),
        ("CPC", ["Cost", "Per", "Click"], "Business & Finance"),
        ("CPU", ["Central", "Processing", "Unit"], "Technology"),
        ("CRM", ["Customer", "Relationship", "Management"], "Business & Finance"),
        ("CRT", ["Cathode", "Ray", "Tube"], "Technology"),
        ("CSS", ["Cascading", "Style", "Sheets"], "Technology"),
        ("CTR", ["Click", "Through", "Rate"], "Business & Finance"),
        ("DIY", ["Do", "It", "Yourself"], "Hobbies & Sports"),
        ("EFT", ["Electronic", "Funds", "Transfer"], "Business & Finance"),
        ("FAQ", ["Frequently", "Asked", "Questions"], "Communication & Status"),
        ("FIS", ["Flight", "Information", "Service"], "Technology"),
        ("FTP", ["File", "Transfer", "Protocol"], "Technology"),
        ("FYI", ["For", "Your", "Information"], "Slang & Social"),
        ("GFC", ["Global", "Financial", "Crisis"], "Business & Finance"),
        ("GIF", ["Graphics", "Interchange", "Format"], "Technology"),
        ("GMO", ["Genetically", "Modified", "Organism"], "Science & Medical"),
        ("GOP", ["Grand", "Old", "Party"], "Government & History"),
        ("GPS", ["Global", "Positioning", "System"], "Technology"),
        ("GUI", ["Graphical", "User", "Interface"], "Technology"),
        ("HMS", ["Her", "Majesty's", "Ship"], "Government & History"),
        ("JPG", ["Joint", "Photographic", "Group"], "Technology"),
        ("KFC", ["Kentucky", "Fried", "Chicken"], "Organizations"),
        ("LAN", ["Local", "Area", "Network"], "Technology"),
        ("LDR", ["Long", "Distance", "Relationship"], "Slang & Social"),
        ("LED", ["Light", "Emitting", "Diode"], "Technology"),
        ("LMK", ["Let", "Me", "Know"], "Slang & Social"),
        ("LOL", ["Laughing", "Out", "Loud"], "Slang & Social"),
        ("MFA", ["Multi", "Factor", "Authentication"], "Technology"),
        ("MSG", ["Monosodium", "Glutamate"], "Science & Medical"),
        ("NFL", ["National", "Football", "League"], "Hobbies & Sports"),
        ("OMG", ["Oh", "My", "God"], "Slang & Social"),
        ("PDF", ["Portable", "Document", "Format"], "Technology"),
        ("PPC", ["Pay", "Per", "Click"], "Business & Finance"),
        ("RAM", ["Random", "Access", "Memory"], "Technology"),
        ("TBD", ["To", "Be", "Determined"], "Communication & Status"),
        ("TBA", ["To", "Be", "Announced"], "Communication & Status"),
        ("TBC", ["To", "Be", "Confirmed"], "Communication & Status"),
        ("IDK", ["I", "Don't", "Know"], "Slang & Social"),
        ("IMO", ["In", "My", "Opinion"], "Slang & Social"),
        ("IRL", ["In", "Real", "Life"], "Slang & Social"),
        ("SMH", ["Shaking", "My", "Head"], "Slang & Social"),
        ("BFF", ["Best", "Friends", "Forever"], "Slang & Social"),
        ("BFD", ["Big", "Freaking", "Deal"], "Slang & Social"),
        ("BBC", ["British", "Broadcasting", "Corporation"], "Media"),
        ("CNN", ["Cable", "News", "Network"], "Media"),
        ("DOA", ["Dead", "On", "Arrival"], "Communication & Status"),
        ("DVD", ["Digital", "Versatile", "Disc"], "Technology"),
        ("EOD", ["End", "Of", "Day"], "Business & Finance"),
        ("ESP", ["Extra", "Sensory", "Perception"], "Slang & Social"),
        ("IED", ["Improvised", "Explosive", "Device"], "Government & History"),
        ("IBS", ["Irritable", "Bowel", "Syndrome"], "Science & Medical"),
        ("JFK", ["John", "F.", "Kennedy"], "Government & History"),
        ("LCA", ["Life", "Cycle", "Assessment"], "Technology"),
        ("MLK", ["Martin", "Luther", "King"], "Government & History"),
        ("MTB", ["Mountain", "Terrain", "Bike"], "Hobbies & Sports"),
        ("MTA", ["Metropolitan", "Transit", "Authority"], "Organizations"),
        ("NBC", ["National", "Broadcasting", "Company"], "Media"),
        ("NGO", ["Non", "Governmental", "Organization"], "Organizations"),
        ("OIC", ["Oh", "I", "See"], "Slang & Social"),
        ("OTC", ["Over", "The", "Counter"], "Science & Medical"),
        ("PHI", ["Protected", "Health", "Information"], "Science & Medical"),
        ("PTO", ["Paid", "Time", "Off"], "Business & Finance"),
        ("RFQ", ["Request", "For", "Quotation"], "Business & Finance"),
        ("ROI", ["Return", "On", "Investment"], "Business & Finance"),
        ("SOS", ["Save", "Our", "Ship"], "Communication & Status"),
        ("TMI", ["Too", "Much", "Information"], "Slang & Social"),
        ("UPS", ["United", "Parcel", "Service"], "Organizations"),
        ("USB", ["Universal", "Serial", "Bus"], "Technology"),
        ("VOD", ["Video", "On", "Demand"], "Technology"),
        ("VPN", ["Virtual", "Private", "Network"], "Technology"),
        ("WWW", ["World", "Wide", "Web"], "Technology"),
        ("XML", ["Extensible", "Markup", "Language"], "Technology"),
    ]
    
    for acronym, words, category in acronyms_list:
        words_json = json.dumps(words)
        cursor.execute('INSERT OR REPLACE INTO acronyms (acronym, words, category) VALUES (?, ?, ?)', (acronym, words_json, category))
    
    conn.commit()
    conn.close()
    print(f"Database seeded with {len(acronyms_list)} acronyms.")

if __name__ == '__main__':
    seed_db()

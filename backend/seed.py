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
    
    acronyms_list = [
        ("OTW", ["on", "the", "way"]),
        ("AAA", ["American", "Automobile", "Association"]),
        ("ABS", ["Anti-lock", "Braking", "System"]),
        ("ACL", ["Access", "Control", "List"]),
        ("AFK", ["Away", "From", "Keyboard"]),
        ("AGM", ["Annual", "General", "Meeting"]),
        ("AHT", ["Average", "Handle", "Time"]),
        ("AIS", ["Aeronautical", "Information", "Service"]),
        ("AMD", ["Advanced", "Micro", "Devices"]),
        ("API", ["Application", "Programming", "Interface"]),
        ("ATM", ["Automated", "Teller", "Machine"]),
        ("ATS", ["Applicant", "Tracking", "System"]),
        ("BAE", ["Before", "Anyone", "Else"]),
        ("BBS", ["Be", "Back", "Soon"]),
        ("BRB", ["Be", "Right", "Back"]),
        ("BTW", ["By", "The", "Way"]),
        ("CAD", ["Computer", "Aided", "Design"]),
        ("CAR", ["Central", "African", "Republic"]),
        ("CEO", ["Chief", "Executive", "Officer"]),
        ("CFO", ["Chief", "Financial", "Officer"]),
        ("CHF", ["Congestive", "Heart", "Failure"]),
        ("CIA", ["Central", "Intelligence", "Agency"]),
        ("CMS", ["Content", "Management", "System"]),
        ("CNS", ["Central", "Nervous", "System"]),
        ("CPA", ["Certified", "Public", "Accountant"]),
        ("CPC", ["Cost", "Per", "Click"]),
        ("CPU", ["Central", "Processing", "Unit"]),
        ("CRM", ["Customer", "Relationship", "Management"]),
        ("CRT", ["Cathode", "Ray", "Tube"]),
        ("CSS", ["Cascading", "Style", "Sheets"]),
        ("CTR", ["Click", "Through", "Rate"]),
        ("DIY", ["Do", "It", "Yourself"]),
        ("EFT", ["Electronic", "Funds", "Transfer"]),
        ("FAQ", ["Frequently", "Asked", "Questions"]),
        ("FIS", ["Flight", "Information", "Service"]),
        ("FTP", ["File", "Transfer", "Protocol"]),
        ("FYI", ["For", "Your", "Information"]),
        ("GFC", ["Global", "Financial", "Crisis"]),
        ("GIF", ["Graphics", "Interchange", "Format"]),
        ("GMO", ["Genetically", "Modified", "Organism"]),
        ("GOP", ["Grand", "Old", "Party"]),
        ("GPS", ["Global", "Positioning", "System"]),
        ("GUI", ["Graphical", "User", "Interface"]),
        ("HMS", ["Her", "Majesty's", "Ship"]),
        ("JPG", ["Joint", "Photographic", "Group"]),
        ("KFC", ["Kentucky", "Fried", "Chicken"]),
        ("LAN", ["Local", "Area", "Network"]),
        ("LDR", ["Long", "Distance", "Relationship"]),
        ("LED", ["Light", "Emitting", "Diode"]),
        ("LMK", ["Let", "Me", "Know"]),
        ("LOL", ["Laughing", "Out", "Loud"]),
        ("MFA", ["Multi", "Factor", "Authentication"]),
        ("MSG", ["Monosodium", "Glutamate"]),
        ("NFL", ["National", "Football", "League"]),
        ("OMG", ["Oh", "My", "God"]),
        ("PDF", ["Portable", "Document", "Format"]),
        ("PPC", ["Pay", "Per", "Click"]),
        ("RAM", ["Random", "Access", "Memory"]),
        ("TBD", ["To", "Be", "Determined"]),
        ("TBA", ["To", "Be", "Announced"]),
        ("TBC", ["To", "Be", "Confirmed"]),
        ("IDK", ["I", "Don't", "Know"]),
        ("IMO", ["In", "My", "Opinion"]),
        ("IRL", ["In", "Real", "Life"]),
        ("SMH", ["Shaking", "My", "Head"]),
        ("BFF", ["Best", "Friends", "Forever"]),
        ("BFD", ["Big", "Freaking", "Deal"]),
        ("BBC", ["British", "Broadcasting", "Corporation"]),
        ("CNN", ["Cable", "News", "Network"]),
        ("DOA", ["Dead", "On", "Arrival"]),
        ("DVD", ["Digital", "Versatile", "Disc"]),
        ("EOD", ["End", "Of", "Day"]),
        ("ESP", ["Extra", "Sensory", "Perception"]),
        ("IED", ["Improvised", "Explosive", "Device"]),
        ("IBS", ["Irritable", "Bowel", "Syndrome"]),
        ("JFK", ["John", "F.", "Kennedy"]),
        ("LCA", ["Life", "Cycle", "Assessment"]),
        ("MLK", ["Martin", "Luther", "King"]),
        ("MTB", ["Mountain", "Terrain", "Bike"]),
        ("MTA", ["Metropolitan", "Transit", "Authority"]),
        ("NBC", ["National", "Broadcasting", "Company"]),
        ("NGO", ["Non", "Governmental", "Organization"]),
        ("OIC", ["Oh", "I", "See"]),
        ("OTC", ["Over", "The", "Counter"]),
        ("PHI", ["Protected", "Health", "Information"]),
        ("PTO", ["Paid", "Time", "Off"]),
        ("RFQ", ["Request", "For", "Quotation"]),
        ("ROI", ["Return", "On", "Investment"]),
        ("SOS", ["Save", "Our", "Ship"]),
        ("TMI", ["Too", "Much", "Information"]),
        ("UPS", ["United", "Parcel", "Service"]),
        ("USB", ["Universal", "Serial", "Bus"]),
        ("VOD", ["Video", "On", "Demand"]),
        ("VPN", ["Virtual", "Private", "Network"]),
        ("WWW", ["World", "Wide", "Web"]),
        ("XML", ["Extensible", "Markup", "Language"]),
    ]
    
    for acronym, words in acronyms_list:
        words_json = json.dumps(words)
        cursor.execute('INSERT OR REPLACE INTO acronyms (acronym, words) VALUES (?, ?)', (acronym, words_json))
    
    conn.commit()
    conn.close()
    print(f"Database seeded with {len(acronyms_list)} acronyms.")

if __name__ == '__main__':
    seed_db()

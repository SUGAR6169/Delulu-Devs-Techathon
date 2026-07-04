import sqlite3
import os

db_path = "office.db"

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if 'count' column exists
    cursor.execute("PRAGMA table_info(alerts)")
    columns = [info[1] for info in cursor.fetchall()]
    
    if "count" not in columns:
        print("Adding 'count' column to alerts table...")
        cursor.execute("ALTER TABLE alerts ADD COLUMN count INTEGER DEFAULT 1")
        # Update existing records to have count = 1
        cursor.execute("UPDATE alerts SET count = 1 WHERE count IS NULL")
        conn.commit()
        print("Migration successful.")
    else:
        print("Column 'count' already exists. No migration needed.")
        
    conn.close()
else:
    print("No database found, skipping migration.")

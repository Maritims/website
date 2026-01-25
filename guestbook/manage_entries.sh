#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DB_PATH="$SCRIPT_DIR/../guestbook.db"

if [[ -n "$CONNECTION_STRING" && "$CONNECTION_STRING" == jdbc:sqlite:* ]]; then
    DB_PATH="${CONNECTION_STRING#jdbc:sqlite:}"
fi

usage() {
    echo "Usage: $0 {approve|delete} <id>"
    exit 1
}

if [ "$#" -ne 2 ]; then
    usage
fi

ACTION=$1
ID=$2

if ! [[ "$ID" =~ ^[0-9]+$ ]]; then
    echo "Error: ID must be a number"
    exit 1
fi

case "$ACTION" in
    approve)
        SQL="UPDATE entries SET isApproved = 1 WHERE id = $ID;"
        CONFIRM_MSG="Are you sure you want to APPROVE entry $ID? (y/N): "
        ;;
    delete)
        SQL="DELETE FROM entries WHERE id = $ID;"
        CONFIRM_MSG="Are you sure you want to DELETE entry $ID? (y/N): "
        ;;
    *)
        usage
        ;;
esac

# Check if entry exists and show it
# Using a python one-liner to check the database since sqlite3 is missing
if ! command -v python3 &> /dev/null; then
    echo "Error: python3 is required to run this script as sqlite3 and java are missing."
    exit 1
fi

ENTRY=$(python3 - <<EOF
import sqlite3
import os

db_path = "$DB_PATH"
if not os.path.exists(db_path):
    print("")
    exit(0)

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, message FROM entries WHERE id = ?", ($ID,))
    row = cursor.fetchone()
    if row:
        print(f"ID: {row[0]} | Name: {row[1]} | Message: {row[2]}")
    else:
        print("")
    conn.close()
except Exception as e:
    print("")
EOF
)

if [ -z "$ENTRY" ]; then
    echo "Error: Entry with ID $ID not found or database not found at $DB_PATH."
    exit 1
fi

echo "Found entry:"
echo "$ENTRY"
echo

read -p "$CONFIRM_MSG" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

python3 - <<EOF
import sqlite3
try:
    conn = sqlite3.connect("$DB_PATH")
    cursor = conn.cursor()
    cursor.execute("$SQL")
    conn.commit()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
    exit(1)
EOF

if [ $? -eq 0 ]; then
    echo "Entry $ID successfully ${ACTION}d."
else
    echo "Error: Failed to $ACTION entry $ID."
    exit 1
fi

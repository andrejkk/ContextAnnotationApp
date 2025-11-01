import pandas as pd
from supabase import create_client, Client
import json
import os
from dotenv import load_dotenv
import argparse

load_dotenv()

# Supabase credentials
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_PUBLISHABLE_KEY")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Import XLSX events to Supabase")
    parser.add_argument("xlsx_path", help="Path to the XLSX file")
    args = parser.parse_args()

    # Read XLSX file
    df = pd.read_excel(args.xlsx_path)

    # Iterate over rows and insert into Supabase
    for _, row in df.iterrows():
        event_data = {
            "recording_id": row["recording_id"],
            "event_type_id": row["event_type_id"],
            "timestamp": row["timestamp"],  # Ensure this is in correct format
            "offset_ms": row["offset_ms"],
            "metadata": json.loads(row["metadata"]) if "metadata" in row and pd.notna(row["metadata"]) else {},
        }
        supabase.table("events").insert(event_data).execute()
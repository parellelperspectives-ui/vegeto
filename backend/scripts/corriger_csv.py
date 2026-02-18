# -*- coding: utf-8 -*-

import csv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

input_file = BASE_DIR / "data" / "plantes_db.csv"
output_file = BASE_DIR / "data" / "plantes_postgres.csv"

with open(input_file, newline="", encoding="utf-8") as infile, \
     open(output_file, "w", newline="", encoding="utf-8") as outfile:

    reader = csv.reader(infile, delimiter=';')
    writer = csv.writer(
        outfile,
        delimiter=';',
        quotechar='"',
        quoting=csv.QUOTE_ALL,
        lineterminator='\n'
    )

    for row in reader:
        writer.writerow(row)

print("CSV prêt pour PostgreSQL :", output_file)

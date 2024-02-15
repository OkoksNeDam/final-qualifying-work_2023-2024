import sqlite3
import os
import time
import pandas as pd
import numpy as np

DB_PATH = "/Users/pavlom/Desktop/final-qualifying-work_2023-2024/GelioGeos/db.sqlite3"
TABLE_NAME = "ts_visualizer_magneticfielddata"
STATIONS = {'NRD', 'NAL', 'LYR', 'HOR', 'HOP', 'BJN', 'NOR', 'JAN', 'SOR', 'SCO', 'ALT', 'KEV', 'TRO', 'MAS', 'AND',
            'KIL', 'KAU', 'IVA', 'ABK', 'LEK', 'MUO', 'LOZ', 'KIR', 'RST', 'SOD', 'PEL', 'JCK', 'DON', 'RAN', 'KUL',
            'RVK', 'LYC', 'OUJ', 'LRV', 'MEK', 'HAN', 'HAS', 'DOB', 'HOV', 'NAQ', 'SOL', 'NUR', 'HAR', 'AAL', 'UPS',
            'NRA', 'KAR', 'TAR', 'FKP', 'GOT', 'SIN', 'VXJ', 'BRZ', 'BFE', 'BOR', 'ROE', 'HLP', 'SUW', 'WNG', 'NGK',
            'PPN'}

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

last_date_in_table = cur.execute(f"SELECT date "
                                 f"FROM {TABLE_NAME} "
                                 f"ORDER BY date DESC "
                                 f"LIMIT 1;")
print(last_date_in_table.fetchone()[0])

os.system(
    f"wget -q \"https://space.fmi.fi/image/www/data_download.php?starttime=20180305"
    f"&length=1440&format=text&sample_rate=3600\""
    f" -O /Users/pavlom/Desktop/test/20180305.text")

current_filepath = "/Users/pavlom/Desktop/test/20180305.text"
fin = open(current_filepath, "r+")
# Get data from file.
data = fin.read().splitlines(True)
fin.close()
header = data[0].split()
# 'YYYY', 'MM', 'DD', 'HH', 'MM', 'SS'
date_columns = header[:6]
date_columns[3], date_columns[4], date_columns[5] = 'hh', 'mm', 'ss'
# 'STATION', 'X', 'STATION', 'Y', 'STATION', 'Z'
station_columns = header[6:]

# Unique station names of current date period.
current_stations = set(station_columns[::2])

for i in range(0, len(station_columns), 2):
    # 'STATION', 'X', 'STATION', 'Y', 'STATION', 'Z' --> 'STATION_X', 'X', 'STATION_Y', 'Y', 'STATION_Z', 'Z'
    station_columns[i] += f"_{station_columns[i + 1]}"
# 'STATION_X', 'X', 'STATION_Y', 'Y', 'STATION_Z', 'Z' --> 'STATION_X', 'STATION_Y', 'STATION_Z'
station_columns = station_columns[::2]
# YYYY MM DD HH MM SS STATION_X STATION_Y STATION_Z...
header = date_columns + station_columns
# Drop second line ('------------') and add new header.
data[1] = " ".join(header) + "\n"
data = data[1:]
open("/Users/pavlom/Desktop/test/20180305.text", 'w').close()
fout = open("/Users/pavlom/Desktop/test/20180305.text", "a")
fout.writelines(data)
fout.close()

# Data in this is df is stored in this format: date | STATION_X | STATION_Y | STATION_Z | ...
df_stage1 = pd.read_csv("/Users/pavlom/Desktop/test/20180305.text", sep='\s+')
# Marge columns YYYY, MM, DD... to one date column.
df_stage1 = df_stage1.assign(YYYY=df_stage1.YYYY.astype(str) + '-' + df_stage1.MM.astype(str) + '-' +
                                  df_stage1.DD.astype(str) + ' ' + df_stage1.hh.astype(str) +
                                  ':' + df_stage1.mm.astype(str) + ':' + df_stage1.ss.astype(str))
df_stage1.rename(columns={"YYYY": "date"}, inplace=True)
df_stage1.drop(columns=['MM', 'DD', 'hh', 'mm', 'ss'], inplace=True)
df_stage1['date'] = pd.to_datetime(df_stage1['date'])

# List of stations for which there was no information for the current time period.
current_stations_complement = list(STATIONS.difference(current_stations))
# Repeat each station name 3 times (to add indexes x, y, z for each station).
current_stations_complement = list(np.repeat(current_stations_complement, 3))
# Add indexes X, Y, Z for each station in current_stations_complement.
# Add columns whose names are stations for which there is no information for the current time period.
for i in range(0, len(current_stations_complement), 3):
    current_stations_complement[i] += f"_X"
    df_stage1[current_stations_complement[i]] = None
    current_stations_complement[i + 1] += f"_Y"
    df_stage1[current_stations_complement[i + 1]] = None
    current_stations_complement[i + 2] += f"_Z"
    df_stage1[current_stations_complement[i + 2]] = None

for row in range(df_stage1.shape[0]):
    curr_date = df_stage1.date[row]
    # Iterate over each station.
    for col in range(1, df_stage1.shape[1], 3):
        station = df_stage1.columns[col][:3]
        X = df_stage1.loc[row][col]
        Y = df_stage1.loc[row][col + 1]
        Z = df_stage1.loc[row][col + 2]
        cur.execute(f"INSERT INTO {TABLE_NAME}('date', 'station', 'x', 'y', 'z')"
                    f"VALUES('{curr_date}', '{station}', '{X}', '{Y}', '{Z}');")
        conn.commit()

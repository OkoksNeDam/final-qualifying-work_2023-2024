from django.shortcuts import render
from django.views import View
from django.http import JsonResponse
import sqlite3

# TODO: create constats.py for this array.
STATIONS = ['NRD', 'NAL', 'LYR', 'HOR', 'HOP', 'BJN', 'NOR', 'JAN', 'SOR', 'SCO', 'ALT', 'KEV', 'TRO', 'MAS', 'AND',
            'KIL', 'KAU', 'IVA', 'ABK', 'LEK', 'MUO', 'LOZ', 'KIR', 'RST', 'SOD', 'PEL', 'JCK', 'DON', 'RAN', 'KUL',
            'RVK', 'LYC', 'OUJ', 'LRV', 'MEK', 'HAN', 'HAS', 'DOB', 'HOV', 'NAQ', 'SOL', 'NUR', 'HAR', 'AAL', 'UPS',
            'NRA', 'KAR', 'TAR', 'FKP', 'GOT', 'SIN', 'VXJ', 'BRZ', 'BFE', 'BOR', 'ROE', 'HLP', 'SUW', 'WNG', 'NGK',
            'PPN']


def main_view(request):
    context = {
        'stations': STATIONS
    }
    return render(request, "ts_visualizer/ts_visualizer.html", context=context)


class TSView(View):
    def get(self, request):
        start_date = request.GET['startDate']
        end_date = request.GET['endDate']
        station = request.GET['station']
        TABLE_NAME = "ts_visualizer_magneticfielddata"
        DB_PATH = "../GelioGeos/db.sqlite3"
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()

        data = cur.execute(f"SELECT date, x "
                               f"FROM {TABLE_NAME} "
                               f"WHERE date >= '{start_date}' AND "
                               f"date <= '{end_date}' AND "
                               f"station = '{station}';")

        date = []
        x = []
        data = data.fetchall()
        for el in data:
            date += [el[0]]
            x += [el[1]]
        return JsonResponse({
            "date": date,
            "x": x
        })

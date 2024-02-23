from django.shortcuts import render
from django.views import View
from django.http import JsonResponse
import sqlite3


def main_view(request):
    return render(request, "ts_visualizer/ts_visualizer.html")


class TSDataView(View):
    def get(self, request):
        selectedStations = request.GET.get('selectedStations').split(' ')
        # Convert to format suitable for SQL.
        selectedStations = '(' + ', '.join("'{0}'".format(s) for s in selectedStations) + ')'
        startDate = request.GET.get('startDate')
        finalDate = request.GET.get('finalDate')
        componentsStr = ""
        XComponent = request.GET.get('XComponent')
        componentsStr += ", x " if XComponent == "true" else ""
        YComponent = request.GET.get('YComponent')
        componentsStr += ", y " if YComponent == "true" else ""
        ZComponent = request.GET.get('ZComponent')
        componentsStr += ", z " if ZComponent == "true" else ""
        
        # TODO: создать глобальные переменные для текущих.
        TABLE_NAME = "ts_visualizer_magneticfielddata"
        DB_PATH = "../GelioGeos/db.sqlite3"
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()

        # TODO: убрать
        startDate = "2024-01-01 00:00:00"
        finalDate = "2024-01-01 05:00:00"

        data = cur.execute(f"SELECT date, station{componentsStr}"                       
                           f"FROM {TABLE_NAME} "
                           f"WHERE date >= '{startDate}' AND "
                           f"date <= '{finalDate}' AND "
                           f"station IN {selectedStations};")

        date = []
        x = []
        data = data.fetchall()
        print(data)
        # for el in data:
        #     date += [el[0]]
        #     x += [el[1]]
        # return JsonResponse({
        #     "date": date,
        #     "x": x
        # })

from django.shortcuts import render
from django.views import View
from django.http import JsonResponse
import sqlite3
import json


def main_view(request):
    return render(request, "ts_visualizer/ts_visualizer.html")


class TSDataView(View):
    def get(self, request):
        selectedStations = request.GET.get('selectedStations').split(' ')
        # Convert to format suitable for SQL.
        selectedStationsStrForSQLQuery = '(' + ', '.join("'{0}'".format(s) for s in selectedStations) + ')'
        startDate = request.GET.get('startDate')
        finalDate = request.GET.get('finalDate')
        componentsList = []
        XComponentIsSelected = request.GET.get('XComponent')
        if XComponentIsSelected == "true": componentsList += ['x']
        YComponentIsSelected = request.GET.get('YComponent')
        if YComponentIsSelected == "true": componentsList += ['y']
        ZComponentIsSelected = request.GET.get('ZComponent')
        if ZComponentIsSelected == "true": componentsList += ['z']
        
        # TODO: создать глобальные переменные для текущих.
        TABLE_NAME = "ts_visualizer_magneticfielddata"
        DB_PATH = "../GelioGeos/db.sqlite3"
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()

        # TODO: спарсить данные с клиента.
        startDate = "1983-01-01 00:00:00"
        finalDate = "2024-01-01 00:00:00"

        loadedData = cur.execute(f"SELECT date, station{','.join(['', *componentsList])} "                       
                                 f"FROM {TABLE_NAME} "
                                 f"WHERE date >= '{startDate}' AND "
                                 f"date <= '{finalDate}' AND "
                                 f"station IN {selectedStationsStrForSQLQuery};")

        loadedData = loadedData.fetchall()
        datesToReturn = []
        for i in range(0, len(loadedData), len(selectedStations)):
            datesToReturn += [loadedData[i][0]]
        dataToReturn = {}
        for station in selectedStations:
            dataToReturn[station] = [[] for _ in range(len(componentsList))]
        for idx in range(len(loadedData)):
            dataForCurrentStation = dataToReturn[loadedData[idx][1]]
            for i in range(len(loadedData[idx]) - 2):
                dataForCurrentStation[i] += [loadedData[idx][i + 2]]
            dataToReturn[loadedData[idx][1]] = dataForCurrentStation
        
        # TODO: Похоже, что при пустых данных появляется ошибка (error для некоторых станций), надо проверить.
        return JsonResponse({
            "dates": datesToReturn,
            "data": json.dumps(dataToReturn)
        })

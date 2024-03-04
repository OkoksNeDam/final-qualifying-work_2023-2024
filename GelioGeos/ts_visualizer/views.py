from django.shortcuts import render
from django.views import View
from django.http import JsonResponse
import pandas as pd
from datetime import datetime
from datetime import timedelta
from os import path
import sqlite3
import json


def main_view(request):
    return render(request, "ts_visualizer/ts_visualizer.html")


class TSDataView(View):
    def get(self, request):
        selectedStation = request.GET.get('selectedStation')
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

        # def date_range(start, end, intv):
        #     from datetime import datetime
        #     start = datetime.strptime(start, "%Y-%m-%d %H:%M:%S")
        #     end = datetime.strptime(end, "%Y-%m-%d %H:%M:%S")
        #     diff = (end - start) / intv
        #     for index in range(intv):
        #         yield (start + diff * index).strftime("%Y-%m-%d %H:%M:%S")
        #     yield end.strftime("%Y-%m-%d %H:%M:%S")
        #
        # numberOfIntervalsForDates = 30
        # datesIntervals = list(date_range(startDate, finalDate, numberOfIntervalsForDates))
        # print(datesIntervals)
        # pairsOfIntervals = [(a, b) for a, b in zip(datesIntervals, datesIntervals[1:])]
        # print(pairsOfIntervals)

        # loadedData = []
        #
        # for start_intv, end_intv in pairsOfIntervals:
        #     print(','.join(['', *componentsList]))
        #     # TODO: order by date.
        #     loadedData += cur.execute(f"SELECT date, station{','.join(['', *componentsList])} "
        #                               f"FROM {TABLE_NAME} "
        #                               f"WHERE date >= '{start_intv}' AND "
        #                               f"date < '{end_intv}' AND "
        #                               f"station IN {selectedStationsStrForSQLQuery} "
        #                               f"ORDER BY date;").fetchall()

        loadedData = cur.execute(f"SELECT date, station{','.join(['', *componentsList])} "
                                 f"FROM {TABLE_NAME} "
                                 f"WHERE date >= '{startDate}' AND "
                                 f"date < '{finalDate}' AND "
                                 f"station = '{selectedStation}' "
                                 f"ORDER BY date;")
        loadedData = loadedData.fetchall()

        datesToReturn = []
        for i in range(0, len(loadedData)):
            datesToReturn += [loadedData[i][0]]
        dataToReturn = {f'{selectedStation}': [[] for _ in range(len(componentsList))]}

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

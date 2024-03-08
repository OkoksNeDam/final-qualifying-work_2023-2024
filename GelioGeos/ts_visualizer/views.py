from django.shortcuts import render
from django.views import View
from django.http import JsonResponse
import pandas as pd
from datetime import datetime
from datetime import timedelta
import sqlite3
import json


def main_view(request):
    return render(request, "ts_visualizer/ts_visualizer.html")


class TSDataView(View):
    def get(self, request):
        selectedStation = request.GET.get('selectedStation')
        selectedComponent = request.GET.get('selectedComponent')
        timeAveragingValueInput = request.GET.get('timeAveragingValueInput')
        startDate = request.GET.get('startDate')
        finalDate = request.GET.get('finalDate')

        # TODO: создать глобальные переменные для текущих.
        TABLE_NAME = "ts_visualizer_magneticfielddata"
        DB_PATH = "../GelioGeos/db.sqlite3"
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()

        loadedData = cur.execute(f"SELECT date, {selectedComponent} "
                                 f"FROM {TABLE_NAME} "
                                 f"WHERE date >= '{startDate}' AND "
                                 f"date < '{finalDate}' AND "
                                 f"station = '{selectedStation}' "
                                 f"ORDER BY date;")
        loadedData = loadedData.fetchall()

        datesToReturn = []
        for i in range(0, len(loadedData)):
            datesToReturn += [loadedData[i][0]]
        dataToReturn = []

        countNotNoneValues = 0
        for idx in range(len(loadedData)):
            currentData = loadedData[idx][1]
            dataToReturn += [currentData]
            if currentData != "None":
                countNotNoneValues += 1

        df = pd.DataFrame({'date': datesToReturn})

        if countNotNoneValues == 0:
            startDate = datetime.strptime(startDate, '%Y-%m-%d %H:%M:%S')
            finalDate = datetime.strptime(finalDate, '%Y-%m-%d %H:%M:%S')

            return JsonResponse({
                "dates": [str(element) for element in pd.date_range(startDate,
                                                                    finalDate - timedelta(days=1),
                                                                    freq='h')
                          ],
                "data": json.dumps([None]*len(datesToReturn))
            })

        # noinspection PyTypeChecker
        df.insert(1, selectedComponent, dataToReturn)

        df = df.replace("None", None)
        df['date'] = pd.to_datetime(df['date'])
        df.dropna(inplace=True)

        freq = None
        if timeAveragingValueInput == "hour":
            freq = 'H'
        if timeAveragingValueInput == "day":
            freq = 'D'
        if timeAveragingValueInput == "month":
            freq = 'MS'
        if timeAveragingValueInput == "year":
            freq = 'y'

        df = df.resample(freq, on='date').mean()
        df.dropna(inplace=True)

        datesToReturn = [date.strftime('%Y-%m-%d %H:%M:%S') for date in list(df.index)]
        dataToReturn = list(df[selectedComponent])

        return JsonResponse({
            "dates": datesToReturn,
            "data": json.dumps(dataToReturn)
        })

from django.shortcuts import render
from django.views import View
from django.http import JsonResponse
import pandas as pd
from datetime import datetime
from datetime import timedelta
from torch import nn
import torch
import sqlite3
import json
from joblib import load
import numpy as np


def main_view(request):
    return render(request, "ts_visualizer/ts_visualizer.html")


NUM_OF_LAGS = 100
HIDDEN_LAYER_SIZE = 128
PREDICTION_PERIOD = 1


class MLP(nn.Module):
    def __init__(self, in_dim, hidden_dim, out_dim):
        super().__init__()
        self.model = nn.Sequential(
            nn.Linear(in_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, out_dim)
        )
        self.double()

    def forward(self, X):
        return self.model(X)


class TSForecastView(View):
    def get(self, request):
        periodOfForecast = int(request.GET.get('periodOfForecast'))
        tsData = request.GET.get('tsData').split(',')
        tsData = [float(x) for x in tsData]
        scaler = load('/Users/pavlom/Desktop/final-qualifying-work_2023-2024/GelioGeos/ts_visualizer/std_scaler.bin')
        tsDataScaled = scaler.transform(np.array(tsData).reshape(-1, 1)).reshape(-1, 1)
        model = MLP(NUM_OF_LAGS, HIDDEN_LAYER_SIZE, PREDICTION_PERIOD)
        # TODO: change path to model.
        model.load_state_dict(torch.load(
            '/Users/pavlom/Desktop/final-qualifying-work_2023-2024/GelioGeos/ts_visualizer/mlp.pt'
        ))
        model.eval()

        X = torch.squeeze(torch.tensor(tsDataScaled))
        y_pred = []
        for i in range(periodOfForecast):
            pred = model(X)
            y_pred += [pred.item()]
            X = X[1:]
            X = torch.cat([X, pred])
        return JsonResponse({
            'prediction': json.dumps(np.squeeze(scaler.inverse_transform(np.array(y_pred).reshape(-1, 1))).tolist())
        })


class TSOutliersView(View):
    def post(self, request):
        def zscore(s, window, thresh=3, return_all=False):
            roll = s.rolling(window=window, min_periods=1, center=True)
            avg = roll.mean()
            std = roll.std(ddof=0)
            z = s.sub(avg).div(std)
            m = z.between(-thresh, thresh)

            if return_all:
                return z, avg, std, m
            return s.where(m, avg)

        tsData = request.POST.get('tsData').split(',')
        tsDates = request.POST.get('tsDates').split(',')
        windowSize = int(request.POST.get('windowSize'))
        tsData = [float(x) for x in tsData]

        df = pd.DataFrame({'dates': tsDates, 'data': tsData})
        z, avg, std, m = zscore(df['data'], window=windowSize, return_all=True)
        df_outliers = df.loc[~m, ['dates', 'data']]
        return JsonResponse({
            'outliersDates': json.dumps(df_outliers.dates.tolist()),
            'outliersData': json.dumps(df_outliers.data.tolist())
        })


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
                "data": json.dumps([None] * len(datesToReturn))
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

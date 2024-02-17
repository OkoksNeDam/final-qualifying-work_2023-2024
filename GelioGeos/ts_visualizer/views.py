from django.shortcuts import render


def main_view(request):
    return render(request, "ts_visualizer/ts_visualizer.html")

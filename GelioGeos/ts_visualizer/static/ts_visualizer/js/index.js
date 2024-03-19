const submitFormButton = document.getElementById('submit-form-button');
const clearAllStationsButton = document.getElementById('clear-all-stations-button');

const MAX_NUMBER_OF_SELECTED_STATIONS = 10;

const stationAndCoordinatesDict = {
    'NRD': [81.60, -16.67], 'NAL': [78.92, 11.95], 'LYR': [78.20, 15.82], 'HOR': [77.00, 15.60], 'HOP': [76.51, 25.01], 'BJN': [74.50, 19.20], 'NOR': [71.09, 25.79], 'JAN': [70.90, -8.7], 'SOR': [70.54, 22.22], 'SCO': [70.48, -21,97], 'ALT': [69.86, 22.96], 'KEV': [69.76, 27.01], 'TRO': [69.66, 18.94], 'MAS': [69.46, 23.70], 'AND': [69.30, 16.03],
    'KIL': [69.06, 20.77], 'KAU': [69.02, 23.05], 'IVA': [68.56, 27.29], 'ABK': [68.35, 18.82], 'LEK': [68.13, 13.54], 'MUO': [68.02, 23.53], 'LOZ': [67.97, 35.08], 'KIR': [67.84, 20.42], 'RST': [67.52, 12.09], 'SOD': [67.37, 26.63], 'PEL': [66.90, 24.08], 'JCK': [66.40, 16.98], 'DON': [66.11, 12.50], 'RAN': [65.90, 26.41], 'KUL': [65.57, -37.17],
    'RVK': [64.94, 10.98], 'LYC': [64.61, 18.75], 'OUJ': [64.52, 27.23], 'LRV': [64.18, -21.7], 'MEK': [62.77, 30.97], 'HAN': [62.25, 26.60], 'HAS': [62.15, 16.61], 'DOB': [62.07, 9.11], 'HOV': [61.51, -6.79], 'NAQ': [61.16, -45.44], 'SOL': [61.08, 4.84], 'NUR': [60.50, 24.65], 'HAR': [60.21, 10.71], 'AAL': [60.18, 19.99], 'UPS': [59.90, 17.35],
    'NRA': [59.57, 15.04], 'KAR': [59.21, 5.24], 'TAR': [58.26, 26.46], 'FKP': [58.16, 13.72], 'GOT': [57.69, 18.57], 'SIN': [57.49, 10.14], 'VXJ': [56.92, 14.94], 'BRZ': [56.17, 24.86], 'BFE': [55.63, 11.67], 'BOR': [55.18, 14.91], 'ROE': [55.17, 8.55], 'HLP': [54.61, 18.82], 'SUW': [54.01, 23.18], 'WNG': [53.74, 9.07], 'NGK': [52.07, 12.68], 'PPN': [51.45, 23.13]
};

let setOfSelectedStations = new Set();
let setOfUnselectedStations = new Set();

function isInteger(value) {
    return /^\d+$/.test(value);
}

function countNumberOfselectedComponents() {
    return document.getElementById('checkbox-X-component').checked +
           document.getElementById('checkbox-Y-component').checked +
           document.getElementById('checkbox-Z-component').checked;
}

let listOfTsBlocks = []

// Load map and add it to the page.
let map = L.map('map', { attributionControl:false }).setView([51.505, -0.09], 1);

map.setMaxBounds(map.getBounds());

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    noWrap: true,
    maxZoom: 5,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

let stationsMarkers = [];

for (const key of Object.keys(stationAndCoordinatesDict)) { 
    let markerHtmlStyles = `
        width: 3rem;
        height: 3rem;
        display: block;
        left: -1.5rem;
        top: -1.5rem;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 10px;
        font-weight: bold;
        color: blue;
        `
    const icon = L.divIcon({
        className: "my-custom-pin",
        html: `<span style="${markerHtmlStyles}">${key}</span>`,
        iconAnchor: [1,1]
    })
    
    var textLatLng = stationAndCoordinatesDict[key];  
    let stationMarker = L.marker(textLatLng, {
        icon: icon,
        zIndexOffset: 1000,
        interactive: false
    });
    stationsMarkers.push(stationMarker);
};

// Array of circles, each circle represents station.
circlesObjects = [];

// TODO: если будет время, то сделать ограничение в 10 станций не для любого количества выбранных компонент, 
// а индивидуально для каждой.
function stationOnClick(e) {
    target = e.sourceTarget;
    // TODO: для цветов добавить enumы.
    if (target.options.color == 'grey') {
        target.setStyle({color: 'green'});
        setOfSelectedStations.add(target);
        setOfUnselectedStations.delete(target);
        if (setOfSelectedStations.size == MAX_NUMBER_OF_SELECTED_STATIONS) {
            for (const unselectedCircle of Array.from(setOfUnselectedStations)) {
                unselectedCircle.setStyle({color: 'red'});
            }
        }
    } else if (target.options.color == 'green') {
        if (setOfSelectedStations.size == MAX_NUMBER_OF_SELECTED_STATIONS) {
            for (const unselectedCircle of Array.from(setOfUnselectedStations)) {
                unselectedCircle.setStyle({color: 'grey'});
            }
        } 
        target.setStyle({color: 'grey'});
        setOfSelectedStations.delete(target);
        setOfUnselectedStations.add(target);
    }
}

// Create circles and add them to map.
// TODO: настроить размер кругов, так как они отображаются по-разному.
for (const key of Object.keys(stationAndCoordinatesDict)) { 
    let circle = L.circle(stationAndCoordinatesDict[key], 25000, {
        color: 'grey',
        name: key,
        fillOpacity: 0
    }).addTo(map);

    circlesObjects.push(circle);

    circle.on('click', stationOnClick);

    setOfUnselectedStations.add(circle);
};

submitFormButton.addEventListener('click', e => {

    document.getElementById("list-of-ts-blocks-div").innerHTML = ''

    const typeOfVizInput = document.querySelector('input[name="visualization-type"]:checked');
    const startDateInput = document.getElementById('start-date-input');
    const startHourSelect = document.getElementById('start-hour-select');
    const finalDateInput = document.getElementById('final-date-input');
    const finalHourSelect = document.getElementById('final-hour-select');
    const timeAveragingValueInput = document.querySelector('input[name="time-averaging-value"]:checked');
    const XComponentCheckbox = document.getElementById('checkbox-X-component');
    const YComponentCheckbox = document.getElementById('checkbox-Y-component');
    const ZComponentCheckbox = document.getElementById('checkbox-Z-component');

    if (Date.parse(startDateInput.value + " " + startHourSelect.value + ":00:00") >= 
        Date.parse(finalDateInput.value + " " + finalHourSelect.value + ":00:00")) {
            alert("Start date should be less than final date.");
            return;
    }

    let selectedStations = []
    // Select stations which are marked in green color.
    for (const circle of circlesObjects) {
        if (circle.options.color == 'green') {
            selectedStations.push(circle.options.name)
        }
    }

    if (selectedStations.length == 0) {
        alert("At least one station must be selected.");
        return;
    }

    let data = {};
    let dates = {};

    let listOfComponents = []

    if (XComponentCheckbox.checked) {
        listOfComponents.push('x')
    }

    if (YComponentCheckbox.checked) {
        listOfComponents.push('y')
    }

    if (ZComponentCheckbox.checked) {
        listOfComponents.push('z')
    }

    if (typeOfVizInput.value == '2d') {
        if (listOfComponents.length == 0) {
            alert("At least one component must be selected for 2d visualization.");
            return;
        }
    } else {
        if (listOfComponents.length != 2) {
            alert("Exactly 2 components must be selected for 3d visualization.");
            return;
        }
    }

    for (const station of selectedStations) {
        data[station] = new Array(listOfComponents.length);
        dates[station] = new Array(listOfComponents.length);
        for (const [component_idx, component] of listOfComponents.entries()) {
            // TODO: добавить проверку для введенных данных.
            $.ajax({
                url: 'earth_magnetic_field/ts_data',
                method: 'get',
                dataType: 'json',
                async: false,
                data: { 
                    "selectedStation": station,
                    "selectedComponent": component,
                    "timeAveragingValueInput": timeAveragingValueInput.value,
                    "startDate": startDateInput.value + " " + startHourSelect.value + ":00:00",
                    "finalDate": finalDateInput.value + " " + finalHourSelect.value + ":00:00",
                },
                success: function (response) {
                    data[station][component_idx] = JSON.parse(response.data)
                    dates[station][component_idx] = response.dates;
                },
                error: function (jqXhr, textStatus, errorMessage) {
                    alert(errorMessage);
                },
            });
        }
    }

    let colorsForEachComponent = ['red', 'blue', 'green']

    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    if (typeOfVizInput.value == "2d") {
        for (const station of selectedStations) {
            for (let i = 0; i < countNumberOfselectedComponents(); i++) {
    
                let outerDiv = document.createElement('div');
                outerDiv.id = station + '-ts-block-component-' + listOfComponents[i];
                outerDiv.classList.add('ts-block-div');
                listOfTsBlocks.push(outerDiv);
        
                let tsPlotSettingsDiv = document.createElement('div');
                tsPlotSettingsDiv.classList.add('ts-plot-settings-div');
                outerDiv.appendChild(tsPlotSettingsDiv);

                let amountOfDataLabel = document.createElement('Label');
                amountOfDataLabel.innerHTML = "Amount of data: " + data[station][i].length;
                amountOfDataLabel.classList.add('amount-of-data-label');
        
                let tsPlotDiv = document.createElement('div');
                tsPlotDiv.id = station + '-ts-plot-component-' + listOfComponents[i];
                tsPlotDiv.classList.add('ts-plot-div');
                outerDiv.appendChild(tsPlotDiv);
        
                document.getElementById('list-of-ts-blocks-div').appendChild(outerDiv);
    
                let currentGraph = {
                    type: "scatter",
                    mode: "lines",
                    x: dates[station][i],
                    y: data[station][i],
                    line: {color: colorsForEachComponent[i]},
                    name: listOfComponents[i] + " component"
                }
                
                let layout = {
                    showlegend: true,
                    title: station + " station, " + listOfComponents[i] + " component",
                    paper_bgcolor: "rgb(237, 237, 237)",
                    plot_bgcolor: "rgb(237, 237, 237)",
                };
    
                Plotly.newPlot(tsPlotDiv.id, [currentGraph], layout, {displaylogo: false, modeBarButtonsToRemove: ['resetScale2d']});
    
                let tsForecastingFieldset = document.createElement('fieldset')
                let tsForecastingFieldsetLegend = document.createElement('legend')
                tsForecastingFieldsetLegend.innerHTML = "Forecasts";
                tsForecastingFieldset.appendChild(tsForecastingFieldsetLegend);
    
                let tsOutliersFieldset = document.createElement('fieldset')
                let tsOutliersFieldsetLegend = document.createElement('legend')
                tsOutliersFieldsetLegend.innerHTML = "Outliers";
                tsOutliersFieldset.appendChild(tsOutliersFieldsetLegend);
    
                let tsSmoothingFieldset = document.createElement('fieldset');
                let tsSmoothingFieldsetLegend = document.createElement('legend');
                tsSmoothingFieldsetLegend.innerHTML = "Smoothing";
                tsSmoothingFieldset.appendChild(tsSmoothingFieldsetLegend);
    
                let smoothingLevelDiv = document.createElement('div');

                let smoothingLevelInput = document.createElement('input');

                smoothingLevelInput.type = 'range';
                smoothingLevelInput.min = 0.001;
                smoothingLevelInput.max = 1.000;
                smoothingLevelInput.step = 0.0001;
                smoothingLevelInput.value = 1;

                let smoothingLevelLabel = document.createElement('label');
                smoothingLevelLabel.innerHTML = "Smoothing level: " + smoothingLevelInput.min;

                smoothingLevelDiv.appendChild(smoothingLevelLabel);
                smoothingLevelDiv.appendChild(smoothingLevelInput);

                let maxSmoothingValueLabel = document.createElement('label');
                maxSmoothingValueLabel.innerHTML = '1';

                smoothingLevelDiv.appendChild(maxSmoothingValueLabel);

                tsSmoothingFieldset.appendChild(smoothingLevelDiv);

                let smoothingLevelCurrentValueLabel = document.createElement('label');
                smoothingLevelCurrentValueLabel.innerHTML = "Value: " + smoothingLevelInput.value;

                tsSmoothingFieldset.appendChild(smoothingLevelCurrentValueLabel);
    
                smoothingLevelInput.addEventListener('mouseup', e => {
                    if (data[station][i].length < 10) {
                        alert("The amount of data to be smoothed must be greater than or equal to 10");
                        return;
                    }
                    smoothingLevelCurrentValueLabel.innerHTML = "Value: " + e.target.value;
                    let smoothedData;
                    $.ajax({
                        url: 'earth_magnetic_field/ts_smoothing',
                        method: 'post',
                        dataType: 'json',
                        async: false,
                        data: {
                            csrfmiddlewaretoken: getCookie('csrftoken'),
                            tsData: data[station][i].toString(),
                            smoothingLevel: smoothingLevelInput.value
                        },
                        success: function (response) {
                            smoothedData = JSON.parse(response.smoothedData);
                        },
                        error: function (jqXhr, textStatus, errorMessage) {
                            alert(errorMessage);
                        },
                    });
                    let smoothedGraph = {
                        type: "scatter",
                        mode: "lines",
                        x: dates[station][i],
                        y: smoothedData,
                        line: {color: colorsForEachComponent[i]},
                        name: listOfComponents[i] + ` component<br>smoothed`
                    }
                    Plotly.newPlot(tsPlotDiv.id, [smoothedGraph], layout, {displaylogo: false, modeBarButtonsToRemove: ['resetScale2d']});
                });

                let showAndRemoveOutliersDivWrapper = document.createElement('div');
                showAndRemoveOutliersDivWrapper.classList.add('show-and-remove-outliers-div-wrapper')
    
                let outliersWindowInput = document.createElement('input');
                outliersWindowInput.type = 'number';
                outliersWindowInput.min = 1;
                let outliersWindowLabel = document.createElement('label');
                outliersWindowLabel.innerHTML = "Enter window size: ";
                tsOutliersFieldset.appendChild(outliersWindowLabel);
                tsOutliersFieldset.appendChild(outliersWindowInput);
    
                let showOutliersButton = document.createElement('button');
                showOutliersButton.classList.add('show-outliers-button');
                showOutliersButton.innerHTML = 'Show outliers';

                showAndRemoveOutliersDivWrapper.appendChild(showOutliersButton);
    
                showOutliersButton.addEventListener('click', e => {

                    if (!isInteger(outliersWindowInput.value) || Number(outliersWindowInput.value) < 2 || Number(outliersWindowInput.value) > data[station][i].length) {
                        alert("Window size should be integer in range [2, data_length].")
                        outliersWindowInput.value = null;
                        return;
                    }

                    let outliersDates, outliersData;
                    $.ajax({
                        url: 'earth_magnetic_field/ts_outliers',
                        method: 'post',
                        dataType: 'json',
                        async: false,
                        data: {
                            csrfmiddlewaretoken: getCookie('csrftoken'),
                            tsData: data[station][i].toString(),
                            tsDates: dates[station][i].toString(),
                            windowSize: outliersWindowInput.value
                        },
                        success: function (response) {
                            outliersDates = JSON.parse(response.outliersDates);
                            outliersData = JSON.parse(response.outliersData);
                        },
                        error: function (jqXhr, textStatus, errorMessage) {
                            alert(errorMessage);
                        },
                    });
                    let outliersDots = {
                        x: outliersDates,
                        y: outliersData,
                        mode: 'markers',
                        name: 'outliers',
                        marker: {
                            color: 'rgb(0, 128, 255)',
                            line: {
                              color: 'rgb(0, 128, 255)',
                              width: 1
                            }
                        }
                    }
                    Plotly.newPlot(tsPlotDiv.id, [currentGraph, outliersDots], layout, {displaylogo: false, modeBarButtonsToRemove: ['resetScale2d']});
                });
    
                let removeOutliersButton = document.createElement('button');
                removeOutliersButton.innerHTML = 'Remove outliers';
                showAndRemoveOutliersDivWrapper.appendChild(removeOutliersButton);

                tsOutliersFieldset.appendChild(showAndRemoveOutliersDivWrapper);
    
                removeOutliersButton.addEventListener('click', e => {

                    if (!isInteger(outliersWindowInput.value) || Number(outliersWindowInput.value) < 2 || Number(outliersWindowInput.value) > data[station][i].length) {
                        alert("Window size should be integer in range [2, data_length].")
                        outliersWindowInput.value = null;
                        return;
                    }

                    let outliersDates;
                    $.ajax({
                        url: 'earth_magnetic_field/ts_outliers',
                        method: 'post',
                        dataType: 'json',
                        async: false,
                        data: {
                            csrfmiddlewaretoken: getCookie('csrftoken'),
                            tsData: data[station][i].toString(),
                            tsDates: dates[station][i].toString(),
                            windowSize: outliersWindowInput.value
                        },
                        success: function (response) {
                            outliersDates = JSON.parse(response.outliersDates);
                        },
                        error: function (jqXhr, textStatus, errorMessage) {
                            alert(errorMessage);
                        },
                    });
                    let outliersDatesSet = new Set(outliersDates);
                    let dataWithoutOutliers = [...data[station][i]];
                    for (let index = 0; index < dates[station][i].length; index++) {
                        if (outliersDatesSet.has(dates[station][i][index])) {
                            dataWithoutOutliers[index] = NaN;
                        }
                    }
                    let graphWithoutOutliers = {
                        type: "scatter",
                        mode: "lines",
                        x: dates[station][i],
                        y: dataWithoutOutliers,
                        line: {color: colorsForEachComponent[i]},
                        name: listOfComponents[i] + " component"
                    }
        
                    Plotly.newPlot(tsPlotDiv.id, [graphWithoutOutliers], layout, {displaylogo: false, modeBarButtonsToRemove: ['resetScale2d']});
                });

                let forecastInputAndButtonWrapper = document.createElement('div');
                forecastInputAndButtonWrapper.classList.add('forecast-input-and-button-wrapper')
    
                let forecastPeriodInput = document.createElement('input');
                forecastPeriodInput.type = 'number';
                forecastPeriodInput.id = station + '-forecast-period-' + listOfComponents[i];
                let forecastPeriodLabel = document.createElement('label');
                forecastPeriodLabel.innerHTML = `Enter period of forecast (${timeAveragingValueInput.value}):`;
                forecastPeriodLabel.for = forecastPeriodInput.id
    
                let makeTSForecastButton = document.createElement('button')
                makeTSForecastButton.classList.add('make-ts-forecast-button');
                makeTSForecastButton.innerHTML = "Make forecast"
                makeTSForecastButton.station = station
                makeTSForecastButton.component = listOfComponents[i]

                forecastInputAndButtonWrapper.appendChild(forecastPeriodInput);
                forecastInputAndButtonWrapper.appendChild(makeTSForecastButton);
    
                // TODO: похоже, что после прогнозирования что-то ломается и не получается отображать выбросы.
    
                makeTSForecastButton.addEventListener('click', e => {
                    if (station != 'KEV' || listOfComponents[i] != 'y' || timeAveragingValueInput.value != 'hour') {
                        // TODO: добавить enum для таких ошибок
                        alert('Forecasts are available for hourly data of y component of station KEV.');
                        forecastPeriodInput.value = null;
                        return;
                    }

                    if (!isInteger(forecastPeriodInput.value) || Number(forecastPeriodInput.value) > 100 || Number(forecastPeriodInput.value) < 2) {
                        alert('Forecast period should be integer in range [2, 100].');
                        forecastPeriodInput.value = null;
                        return;
                    }

                    let NUM_OF_LAGS = 100;
                    let dataForecast;
                    $.ajax({
                        url: 'earth_magnetic_field/ts_forecast',
                        method: 'get',
                        dataType: 'json',
                        async: false,
                        data: {
                            tsData: data[station][i].slice(-NUM_OF_LAGS).toString(),
                            periodOfForecast: forecastPeriodInput.value
                        },
                        success: function (response) {
                            dataForecast = JSON.parse(response.prediction);
                        },
                        error: function (jqXhr, textStatus, errorMessage) {
                            alert(errorMessage);
                        },
                    });
    
                    Date.prototype.addHours = function(h) {
                        this.setTime(this.getTime() + (h*60*60*1000));
                        return this;
                    }
    
                    let lastDateInData = dates[station][i].slice(-1);
                    let listOfDatesForForecast = new Array(forecastPeriodInput.value);
    
                    for (let index = 0; index < forecastPeriodInput.value; index++) {
                        lastDateInData = new Date(lastDateInData).addHours(1);
                        listOfDatesForForecast[index] = lastDateInData;
                    }
    
                    let dataGraph = {
                        type: "scatter",
                        mode: "lines",
                        x: dates[station][i],
                        y: data[station][i],
                        line: {color: colorsForEachComponent[i]},
                        name: listOfComponents[i] + " component"
                    }
    
                    let predictionGraph = {
                        type: "scatter",
                        mode: "lines",
                        x: listOfDatesForForecast,
                        y: dataForecast,
                        line: {color: 'purple'},
                        name: 'forecast'
                    }
    
                    Plotly.newPlot(tsPlotDiv.id, [dataGraph, predictionGraph], layout, {displaylogo: false, modeBarButtonsToRemove: ['resetScale2d']});
                })
    
                let resetGraphButton = document.createElement('button');
                resetGraphButton.innerHTML = 'Reset graph';
                resetGraphButton.classList.add('reset-graph-button');
                resetGraphButton.addEventListener('click', e => {
                    tsPlotDiv.querySelectorAll('.modebar-btn')[5].click();
                    Plotly.newPlot(tsPlotDiv.id, [currentGraph], layout, {displaylogo: false, modeBarButtonsToRemove: ['resetScale2d']});
                })
    
                tsPlotSettingsDiv.appendChild(tsForecastingFieldset);
                tsPlotSettingsDiv.appendChild(tsOutliersFieldset);
                tsPlotSettingsDiv.appendChild(tsSmoothingFieldset);
                tsForecastingFieldset.appendChild(forecastPeriodLabel);
                tsForecastingFieldset.appendChild(forecastInputAndButtonWrapper);
                tsPlotSettingsDiv.appendChild(resetGraphButton);
                tsPlotSettingsDiv.appendChild(amountOfDataLabel);
            }
        }
    } else {
        for (const station of selectedStations) {
            
            let outerDiv = document.createElement('div');
            outerDiv.id = station + '-ts-block-component-' + listOfComponents.toString();
            outerDiv.classList.add('ts-block-div-3d');
            listOfTsBlocks.push(outerDiv);

            let tsPlotDiv = document.createElement('div');
            tsPlotDiv.id = station + '-ts-plot-component-' + listOfComponents.toString();
            tsPlotDiv.classList.add('ts-plot-div-3d');
            outerDiv.appendChild(tsPlotDiv);
    
            document.getElementById('list-of-ts-blocks-div').appendChild(outerDiv);

            // TODO: для 3d нужно по-другому загружать данные: не удалять пустые значения.
            // Также надо заменить (**)
            let currentGraph = {
                type: 'scatter3d',
                mode: 'lines',
                x: dates[station][0], // (**)
                y: data[station][0],
                z: data[station][1],
                name: listOfComponents.toString() + " components"
            }
            
            let layout = {
                showlegend: true,
                title: station + " station",
                paper_bgcolor: "rgb(237, 237, 237)",
                plot_bgcolor: "rgb(237, 237, 237)",
                scene: {
                    xaxis:{title: 'dates'},
                    yaxis:{title: listOfComponents[0]},
                    zaxis:{title: listOfComponents[1]},
                    },
            };

            // Plotly.newPlot(tsPlotDiv.id, [currentGraph], layout, {displaylogo: false, modeBarButtonsToRemove: ['resetScale2d']});
            Plotly.newPlot(tsPlotDiv.id, [currentGraph], layout, {displaylogo: false});
        }
    }
})

clearAllStationsButton.addEventListener('click', e => {
    for (const circle of circlesObjects) {
        circle.setStyle({
            color: 'grey'
        });
        if (!setOfUnselectedStations.has(circle)) {
            setOfUnselectedStations.add(circle);
        }
    }
    setOfSelectedStations.clear();
})

let showStationNamesButton = document.getElementById('show-station-names-button');
let stationsAreDisplayed = false;
showStationNamesButton.addEventListener('click', e => {
    if (stationsAreDisplayed) {
        for (const marker of stationsMarkers) {
            map.removeLayer(marker)
        }
        showStationNamesButton.innerHTML = 'Show names';
        stationsAreDisplayed = false;
    } else {
        for (const marker of stationsMarkers) {
            map.addLayer(marker)
        }
        showStationNamesButton.innerHTML = 'Hide names';
        stationsAreDisplayed = true
    }
})
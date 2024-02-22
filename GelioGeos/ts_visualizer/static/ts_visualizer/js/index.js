const submitFormButton = document.getElementById('submit-form-button');

const stationAndCoordinatesDict = {
    'NRD': [81.60, 343.33], 'NAL': [78.92, 11.95], 'LYR': [78.20, 15.82], 'HOR': [77.00, 15.60], 'HOP': [76.51, 25.01], 'BJN': [74.50, 19.20], 'NOR': [71.09, 25.79], 'JAN': [70.90, -8.7], 'SOR': [70.54, 22.22], 'SCO': [70.48, 338.03], 'ALT': [69.86, 22.96], 'KEV': [69.76, 27.01], 'TRO': [69.66, 18.94], 'MAS': [69.46, 23.70], 'AND': [69.30, 16.03],
    'KIL': [69.06, 20.77], 'KAU': [69.02, 23.05], 'IVA': [68.56, 27.29], 'ABK': [68.35, 18.82], 'LEK': [68.13, 13.54], 'MUO': [68.02, 23.53], 'LOZ': [67.97, 35.08], 'KIR': [67.84, 20.42], 'RST': [67.52, 12.09], 'SOD': [67.37, 26.63], 'PEL': [66.90, 24.08], 'JCK': [66.40, 16.98], 'DON': [66.11, 12.50], 'RAN': [65.90, 26.41], 'KUL': [65.57, 322.83],
    'RVK': [64.94, 10.98], 'LYC': [64.61, 18.75], 'OUJ': [64.52, 27.23], 'LRV': [64.18, 338.3], 'MEK': [62.77, 30.97], 'HAN': [62.25, 26.60], 'HAS': [62.15, 16.61], 'DOB': [62.07, 9.11], 'HOV': [61.51, 353.21], 'NAQ': [61.16, 314.56], 'SOL': [61.08, 4.84], 'NUR': [60.50, 24.65], 'HAR': [60.21, 10.71], 'AAL': [60.18, 19.99], 'UPS': [59.90, 17.35],
    'NRA': [59.57, 15.04], 'KAR': [59.21, 5.24], 'TAR': [58.26, 26.46], 'FKP': [58.16, 13.72], 'GOT': [57.69, 18.57], 'SIN': [57.49, 10.14], 'VXJ': [56.92, 14.94], 'BRZ': [56.17, 24.86], 'BFE': [55.63, 11.67], 'BOR': [55.18, 14.91], 'ROE': [55.17, 8.55], 'HLP': [54.61, 18.82], 'SUW': [54.01, 23.18], 'WNG': [53.74, 9.07], 'NGK': [52.07, 12.68], 'PPN': [51.45, 23.13]
};

// Load map and add it to the page.
let map = L.map('map', { attributionControl:false }).setView([51.505, -0.09], 1);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Array of circles, each circle represents station.
circlesObjects = [];

// Create circles and add them to map.
for (const key of Object.keys(stationAndCoordinatesDict)) { 
    let circle = L.circle(stationAndCoordinatesDict[key], {
        color: 'grey',
        radius: 50000,
        name: key
    }).addTo(map);

    circlesObjects.push(circle);

    circle.on('click', e => {
        target = e.sourceTarget
        target.setStyle({color: target.options.color == 'grey' ? 'green' : 'grey'});
    });
 };

submitFormButton.addEventListener('click', e => {
    for (const circle of circlesObjects) {
        if (circle.options.color == 'green') {
            console.log(circle.options.name)
        }
    }
    // const selectedVisualizationTypeInput = document.querySelector('input[name="visualization-type"]:checked');
    // let date, x;
    // $.ajax({
    //     url: 'test',
    //     method: 'get',
    //     dataType: 'json',
    //     async: false,
    //     data: { 
    //         startDate: dataStartDateInput.value,
    //         endDate: dataEndDateInput.value,
    //         station: stationInput.value
    //     },
    //     success: function (response) {
    //         date = response.date;
    //         x = response.x;
    //     },
    //     error: function (response) {
    //         alert("ERROR")
    //     },
    // });
    // let trace1 = {
    //     type: "scatter",
    //     mode: "lines",
    //     name: 'AAPL High',
    //     x: date,
    //     y: x,
    //     line: {color: '#17BECF'}
    //   }

    // var data = [trace1];

    // var layout = {
    //     title: 'Basic Time Series',
    // };
    
    // Plotly.newPlot('tsGraph', data, layout, {displaylogo: false});
})

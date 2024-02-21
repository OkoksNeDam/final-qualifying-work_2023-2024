// submitButton.addEventListener('click', e => {
//     const selectedVisualizationTypeInput = document.querySelector('input[name="visualization-type"]:checked');
//     let date, x;
//     $.ajax({
//         url: 'test',
//         method: 'get',
//         dataType: 'json',
//         async: false,
//         data: { 
//             startDate: dataStartDateInput.value,
//             endDate: dataEndDateInput.value,
//             station: stationInput.value
//         },
//         success: function (response) {
//             date = response.date;
//             x = response.x;
//         },
//         error: function (response) {
//             alert("ERROR")
//         },
//     });
//     let trace1 = {
//         type: "scatter",
//         mode: "lines",
//         name: 'AAPL High',
//         x: date,
//         y: x,
//         line: {color: '#17BECF'}
//       }

//     var data = [trace1];

//     var layout = {
//         title: 'Basic Time Series',
//     };
    
//     Plotly.newPlot('tsGraph', data, layout, {displaylogo: false});
// })

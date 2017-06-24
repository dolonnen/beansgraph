
//////////////////////////////////////////////////////////////////////
// Internal Variables
//////////////////////////////////////////////////////////////////////

var newData = {
    viewersYoutube:null,
    viewersTwitch:null,
};

var dataPoints = [];
var areaChartData = [];

var dataUpdateCounter = 0;

var averagePoints = [];
var columnChartData = [];

var areaChartIsReadyToDraw = false;
var columnChartIsReadyToDraw = false;

//////////////////////////////////////////////////////////////////////
// collect the data and so on
//////////////////////////////////////////////////////////////////////

function call4ViewerCount() {    
//     console.log("call4ViewerCount called");
    newData['viewersYoutube'] = null;
    newData['viewersTwitch'] = null;
    
    $.getJSON(
        "https://api.twitch.tv/kraken/streams/"+streamIDs['twitch']+"?client_id="+apiKeys['twitch'],
        processTwitchData
    );      // typical duration: 250 - 300ms sometimes up to 400ms
    $.getJSON(
        "https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id="+streamIDs['youtube']+"&key="+apiKeys['youtube'],
        processYtData
    );      // typical duration: 110 -150ms sometimes up to 250ms
}

function processYtData(result, status) {
    // recieves the data from YT. If this is returning NaN, the streamID might be wrong (or the api key ^^)
//     console.log("processYtData called");
    
    var viewers = parseInt(result.items[0].liveStreamingDetails.concurrentViewers);
    updateDataPoint('viewersYoutube', viewers);
}

function processTwitchData(result, status) {
    // recieves the data from Twitch. If this is returning NaN, the api key might be wrong
//     console.log("processTwitchData called");
    
    var viewers = parseInt(result.stream.viewers);
    updateDataPoint('viewersTwitch', viewers);
}

function updateDataPoint(streamer, viewers) {
//     console.log("updateDataPoint called");
    
    // write Data in newData object
    if (newData[streamer] == null) {
        newData[streamer] = viewers; 
    } 
    
    
    if ($.isNumeric(newData['viewersYoutube']) && $.isNumeric(newData['viewersTwitch'])) {
        // data was collected already 
        
        // write the collected data with the time into an array
        var newDataArray = [
            new Date().getTime(),
            newData['viewersYoutube'],
            newData['viewersTwitch']
        ];
        
        // store the new data as data point into an an data point array
        dataPoints.pushToMaxOrShift(newDataArray, NUMBER_OF_DATAPOINTS);
        
        // update the data for the columnChart cyclical
        dataUpdateCounter++;
        if (dataUpdateCounter >= NUMBER_OF_DATAPOINTS) {
            // this is enough dataPoints for calculating the average for the bar chart
            dataUpdateCounter = 0;
            updateAveragePoint();
        }
        
        // generate a data object for the google chart
        if (dataPoints.length <  NUMBER_OF_DATAPOINTS) {
            // dataPoint array not complete, we need pseudo data points.
            var undefinedArray = [];
            for (i = 1; i <= NUMBER_OF_DATAPOINTS - dataPoints.length; i++) {
                undefinedArray.push([
                    new Date().getTime() + UPDATE_INTERVAL * i,
                    undefined,
                    undefined,
                ]);
            }
            areaChartData = google.visualization.arrayToDataTable(dataPoints.concat(undefinedArray),true);
        } 
        else {
            // dataPoints array complete and ready for the Google graph libary
            areaChartData = google.visualization.arrayToDataTable(dataPoints,true);
        }
        
        drawProportionBar();
        drawAreaChart();
       
    }
}

function updateAveragePoint() {
    console.log("updateAveragePoint called");
    
    // calculate the average of all viewers for both streamers
    var averageYoutube = 0;
    var averageTwitch = 0;
    for (var dataPoint of dataPoints) {
        averageYoutube += dataPoint[1];
        averageTwitch += dataPoint[2];
    }
    averageYoutube = averageYoutube / dataPoints.length;
    averageTwitch = averageTwitch / dataPoints.length;
    
    var newAverageArray = [
        getHoursAndSeconds(dataPoints.last()[0]), // store the time of the oldest dataPoint in the Format "hh:mm"
        Math.round(averageYoutube),
        Math.round(averageTwitch)
    ];
    
    // store the new average data as data point into an an data point array
    averagePoints.pushToMaxOrShift(newAverageArray, HOURS_IN_THE_PAST * 4);
    console.log("averagePoints: " + averagePoints);
    
    // generate a data object for the google chart
    if (averagePoints.length <  HOURS_IN_THE_PAST * 4) {
        // dataPoint array not complete, we need pseudo data points.
        var undefinedArray = [];
        for (i = 1; i <= HOURS_IN_THE_PAST * 4 - averagePoints.length; i++) {
            undefinedArray.push([
//                 getHoursAndSeconds(new Date().getTime() + (15*60*1000) * i),
                '',
                undefined,
                undefined,
            ]);
        }
        console.log(averagePoints);
        columnChartData = google.visualization.arrayToDataTable(averagePoints.concat(undefinedArray),true);
    } 
    else {
        // dataPoints array complete and ready for the Google graph libary
        columnChartData = google.visualization.arrayToDataTable(averagePoints,true);
    }
    
    drawColumnChart();
}

//////////////////////////////////////////////////////////////////////
// Drawing
//////////////////////////////////////////////////////////////////////

function updateGraphs() {
    // update all graphical elements with new data and draw them.
    
    drawProportionBar();
    drawAreaChart();
    drawColumnChart();
}

function drawProportionBar() {    
//     console.log("drawProportionBar() called");

    var currentData = dataPoints.last();
    var shareYoutube = 100 * currentData[1] / (currentData[1] + currentData[2]);
    var shareTwitch = 100 - shareYoutube;
    
    $('#youtube_bar').css('width', shareYoutube + '%');
    $('#twitch_bar').css('width', shareTwitch + '%');
    
    $('#youtube_bar').html(currentData[1] + 'Viewers');
    $('#twitch_bar').html(currentData[2] + 'Viewers');
}

function drawAreaChart() {
//     console.log("drawAreaChart() called");
    
    if (!areaChartIsReadyToDraw) {
        // Chart isn't ready to Draw (libary have to load or chart is been drawing jet). Call this function later
        setTimeout(drawAreaChart, 100);
        return
    }
    var areaChart = new google.visualization.AreaChart(document.getElementById('areaChart_container'));
    areaChart.draw(areaChartData, areaChartOptions);
}

function drawColumnChart() {
//     console.log("drawColumnChart() called");
    
    if (!columnChartIsReadyToDraw) {
        // Chart isn't ready to Draw (libary have to load or chart is been drawing jet). Call this function later
        setTimeout(drawColumnChart, 100);
        return
    }
    var columnChart = new google.visualization.ColumnChart(document.getElementById('columnChart_container'));
    columnChart.draw(columnChartData, columnChartOptions);
}


//////////////////////////////////////////////////////////////////////
// Init stuff
//////////////////////////////////////////////////////////////////////

$(document).ready(function(){
    call4ViewerCount();
    setInterval(call4ViewerCount, UPDATE_INTERVAL);
    $(window).resize(updateGraphs);

});

// Load the Google Chart Visualization API and the piechart package.
google.charts.load('current', {'packages':['corechart']});
// Set a callback to run when the Google Visualization API is loaded.
google.charts.setOnLoadCallback(function() {
    areaChartIsReadyToDraw = true;
    columnChartIsReadyToDraw = true;
    
    // init columnChart
    columnChartData = google.visualization.arrayToDataTable([[
        '',
        0,
        0  ,
    ]],true);
    var columnChart = new google.visualization.ColumnChart(document.getElementById('columnChart_container'));
    columnChart.draw(columnChartData, columnChartOptions);
});


//////////////////////////////////////////////////////////////////////
// Internal Variables
//////////////////////////////////////////////////////////////////////
var streamCreds;

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
        "https://api.twitch.tv/kraken/streams/"+streamCreds['twitch']['streamID']+"?client_id="+streamCreds['twitch']['apiKey'],
        processTwitchData
    );      // typical duration: 250 - 300ms sometimes up to 400ms
    $.getJSON(
        "https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id="+streamCreds['youtube']['streamID']+"&key="+streamCreds['youtube']['apiKey'],
        processYtData
    );      // typical duration: 110 -150ms sometimes up to 250ms
}

function processYtData(result, status) {
    // recieves the data from YT. If this is returning NaN, the streamID might be wrong (or the api key ^^).
    // If there is an actualEndTime in the LiveStreaminDetails, this is the id of an old stream.
//     console.log("processYtData called");
    
//     console.log(JSON.stringify(result, null, 2));
    var viewers = parseInt(result.items[0].liveStreamingDetails.concurrentViewers);
    updateDataPoint('viewersYoutube', viewers);
//     console.log('viewersYoutube: ' + viewers);
}

function processTwitchData(result, status) {
    // recieves the data from Twitch. If this is returning NaN, the api key might be wrong
//     console.log("processTwitchData called");
    
//     console.log(JSON.stringify(result, null, 2));
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
//         console.log("dataPoints: " + dataPoints)
        
        // generate a data object for the google chart
        areaChartData = new google.visualization.DataTable();
        areaChartData.addColumn('number', 'Time');
        areaChartData.addColumn('number', 'Youtube');
        areaChartData.addColumn({type:'string', role:'tooltip'}); 
        areaChartData.addColumn('number', 'Twitch');
        areaChartData.addColumn({type:'string', role:'tooltip'}); 
        
        for (dataPoint of dataPoints) {
            var pastMinutes = Math.round((new Date().getTime() - dataPoint[0]) / (1000 * 60));
            areaChartData.addRow([
                dataPoint[0],
                dataPoint[1],
                dataPoint[1].toString() + " vor " + pastMinutes + " Minuten auf Youtube",
                dataPoint[2],
                dataPoint[2].toString() + " vor " + pastMinutes + " Minuten auf Twitch",
            ]);
        }
        
        // dataPoint array not complete, we need pseudo data points.
        for (i = 1; i <= NUMBER_OF_DATAPOINTS - dataPoints.length; i++) {
            areaChartData.addRow([
                new Date().getTime() + UPDATE_INTERVAL * i,
                undefined,
                '',
                undefined,
                '',
            ]);
        }        
   
        // update the data for the columnChart cyclical
        dataUpdateCounter++;
        if (dataUpdateCounter >= NUMBER_OF_DATAPOINTS) {
            // this is enough dataPoints for calculating the average for the bar chart
            dataUpdateCounter = 0;
            updateAveragePoint();
        }
        
        updateDom();
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
    
    // generate a data object for the google chart
    columnChartData = new google.visualization.DataTable();
    columnChartData.addColumn('string', 'Time');
    columnChartData.addColumn('number', 'Youtube');
    columnChartData.addColumn({type:'string', role:'tooltip'}); 
    columnChartData.addColumn('number', 'Twitch');
    columnChartData.addColumn({type:'string', role:'tooltip'}); 
    
    for (averagePoint of averagePoints) {
        columnChartData.addRow([
            averagePoint[0],
            averagePoint[1],
            averagePoint[1].toString() + " um " + averagePoint[0] + " auf Youtube",
            averagePoint[2],
            averagePoint[2].toString() + " um " + averagePoint[0] + " auf Twitch",
        ]);
    }
    
    // averagePoint array not complete, we need pseudo data points.
    for (i = 1; i <= HOURS_IN_THE_PAST * 4 - averagePoints.length; i++) {
        columnChartData.addRow([
            getHoursAndSeconds(new Date().getTime() + (15*60*1000) * i),
            undefined,
            '',
            undefined,
            '',
        ]);
    }        
    drawColumnChart();
}

//////////////////////////////////////////////////////////////////////
// Drawing
//////////////////////////////////////////////////////////////////////

function updateGraphs() {
    // update all graphical elements with new data and draw them.
    
    updateDom();
    drawAreaChart();
    drawColumnChart();
}

function updateDom() {    
//     console.log("updateDom() called");
    
    var currentData = dataPoints.last();
    
    // Update Viewers
    $('#viewersTotal').html(currentData[1] + currentData[2]);
    $('#viewersTwitch').html(currentData[2]);
    $('#viewersYoutube').html(currentData[1]);

    // Update proportional bar
    var shareYoutube = 100 * currentData[1] / (currentData[1] + currentData[2]);
    var shareTwitch = 100 - shareYoutube;
    
    $('#youtube_bar').css('width', shareYoutube + '%');
    $('#twitch_bar').css('width', shareTwitch + '%');
    $('#youtube_bar').html(Math.round(shareYoutube) + ' %');
    $('#twitch_bar').html(Math.round(shareTwitch) + ' %');
    
    
    
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

    // Update the Credentials for the APIs
    if (updateCreds) {
        $.getJSON(updateCredsUrl)
        .done(function(json) {
            streamCreds = json;
//             console.log("streamCreds: " + JSON.stringify(streamCreds, null, 2));
            call4ViewerCount();
            setInterval(call4ViewerCount, UPDATE_INTERVAL);
        })
        .fail(function() {
            streamCreds = defaultStreamCreds;
//             console.log("streamCreds: " + JSON.stringify(streamCreds, null, 2));
            call4ViewerCount();
            setInterval(call4ViewerCount, UPDATE_INTERVAL);
        });
    }
    else {
        streamCreds = defaultStreamCreds;
//         console.log("streamCreds: " + JSON.stringify(streamCreds, null, 2));
        call4ViewerCount();
        setInterval(call4ViewerCount, UPDATE_INTERVAL);
    }
        
    $(window).resize(updateGraphs);

});



// Load the Google Chart Visualization API and the piechart package.
google.charts.load('current', {'packages':['corechart']});
// Set a callback to run when the Google Visualization API is loaded.
google.charts.setOnLoadCallback(function() {
   
    // init columnChart
    areaChartData = google.visualization.arrayToDataTable([[
        0,
        0,
        0  ,
    ]],true);
    var areaChart = new google.visualization.AreaChart(document.getElementById('areaChart_container'));
    areaChart.draw(areaChartData, areaChartOptions);
    
    // init columnChart
    columnChartData = google.visualization.arrayToDataTable([[
        '',
        0,
        0  ,
    ]],true);
    var columnChart = new google.visualization.ColumnChart(document.getElementById('columnChart_container'));
    columnChart.draw(columnChartData, columnChartOptions);
    
    areaChartIsReadyToDraw = true;
    columnChartIsReadyToDraw = true;
});

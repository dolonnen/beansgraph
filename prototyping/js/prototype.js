
//////////////////////////////////////////////////////////////////////
// Settings
//////////////////////////////////////////////////////////////////////

const NUMBER_OF_DATAPOINTS = 90;
const UPDATE_INTERVAL = 10000;

var streamIDs = {
    youtube:"8bYu-0ErsfE",      // 
    twitch:"rocketbeanstv"
};
var apiKeys = {
    youtube:"AIzaSyAEKdRMGaHEVQCTzLrUbX3HPdp82mTpWWk",
    twitch:"vsiaqcev0wed3la13a05h3tyi93z2o"
};

// Chart settings

var chartBackgroundColor = '#333333';
var chartTextColor = '#888888';

var chartOptions = {
    isStacked: true,
    vAxis: {
        minValue: 0,
        title: "aktuelle Zuschauerzahl"
    },
    animation: {
        duration: 200,
        easing: 'out'
    },
    areaOpacity: 1.0,
    colors:['#cd201f','#6441A4'],
    backgroundColor: chartBackgroundColor,
    hAxis: {
        baselineColor: chartBackgroundColor,
        gridlines: {color: chartBackgroundColor},
        textPosition: 'none'
    },
    vAxis: {
        baselineColor: chartBackgroundColor,
        gridlines: {color: chartBackgroundColor},
        textStyle: {color: chartTextColor}
    },
    legend: {position: 'none'},

    
};

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

var avaragePoints = [];
var barChartData = [];

var areaChartIsReadyToDraw = false;

//////////////////////////////////////////////////////////////////////
// collect the data and so on
//////////////////////////////////////////////////////////////////////

function call4ViewerCount() {    
    console.log("call4ViewerCount called");
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
    console.log("updateDataPoint called");
    
    // write Data in newData object
    if (newData[streamer] == null) {
        newData[streamer] = viewers; 
    } 
    
    
    if ($.isNumeric(newData['viewersYoutube']) && $.isNumeric(newData['viewersTwitch'])) {
        // data was collected already 
        
        // write the collected data with the time into an array
        var newDataArray = [];
        newDataArray.push(new Date().getTime());
        newDataArray.push(newData['viewersYoutube']);
        newDataArray.push(newData['viewersTwitch']);
        
        // store the new data as data point into an an data point array
        dataPoints.pushToMaxOrShift(newDataArray, NUMBER_OF_DATAPOINTS);
        
        console.log("dataPoints: "+dataPoints);
        
        dataUpdateCounter++;
        if (dataUpdateCounter >= NUMBER_OF_DATAPOINTS) {
            // this is enough dataPoints for calculating the avarage for the bar chart
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
            chartData = google.visualization.arrayToDataTable(dataPoints.concat(undefinedArray),true);
        } 
        else {
            // dataPoints array complete and ready for the Google graph libary
            chartData = google.visualization.arrayToDataTable(dataPoints,true);
        }
        
        updateGraphs();
       
    }
}

function updateAveragePoint() {
    var avarageYoutube = 0;
    var avarageTwitch = 0;
    for (dataPoint in dataPoints) {
        avarageYoutube += dataPoint[1];
        avarageTwitch += dataPoint[2];
    }
    avarageYoutube /= dataPoints.length();
    avarageTwitch /= dataPoints.length();
    
    
    // store the new avarage data as data point into an an data point array
//     avaragePoints.pushToMaxOrShift(newDataArray, NUMBER_OF_DATAPOINTS);
    
}

//////////////////////////////////////////////////////////////////////
// Drawing
//////////////////////////////////////////////////////////////////////

function updateGraphs() {
    // update all graphical elements with new data and draw them.
    
    drawAreaChart();
    drawProportionBar();
//     drawBarChart();
    
}

function drawAreaChart() {
//     console.log("drawAreaChart() called");
    
    if (!areaChartIsReadyToDraw) {
        // Chart isn't ready to Draw (libary have to load or chart is been drawing jet). Call this function later
        setTimeout(drawAreaChart, 100);
        return
    }
    
    var areaChart = new google.visualization.AreaChart(document.getElementById('areaChart_container'));
    
    areaChart.draw(chartData, chartOptions);
    
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
});

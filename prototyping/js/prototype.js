
//////////////////////////////////////////////////////////////////////////////////////////////////
// Settings
//////////////////////////////////////////////////////////////////////////////////////////////////

const NUMBER_OF_DATAPOINTS = 60;
const UPDATE_INTERVAL = 10000;

var streamIDs = {
    youtube:"tn0zpeHPfw0",
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

//////////////////////////////////////////////////////////////////////////////////////////////////
// Internal Variables
//////////////////////////////////////////////////////////////////////////////////////////////////

var newData = {
    viewersYoutube:null,
    viewersTwitch:null,
};

var dataPoints = [];
for (i = 0; i < NUMBER_OF_DATAPOINTS; i++) {
    dataPoints.push([null,null,null]);
}

var chartData = [];

var chartIsReadyToDraw = false;

//////////////////////////////////////////////////////////////////////////////////////////////////
// collect the data and so on
//////////////////////////////////////////////////////////////////////////////////////////////////

function call4ViewerCount() {    
    newData['viewersYoutube'] = null;
    newData['viewersTwitch'] = null;
    
    $.getJSON(
        "https://api.twitch.tv/kraken/streams/"+streamIDs['twitch']+"?client_id="+apiKeys['twitch'],
        processTwitchData
    );
    $.getJSON(
        "https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id="+streamIDs['youtube']+"&key="+apiKeys['youtube'],
        processYtData
    );
}

function processYtData(result, status) {
    
    var viewers = parseInt(result.items[0].liveStreamingDetails.concurrentViewers);
    updateDataTable('viewersYoutube', viewers);
}

function processTwitchData(result, status) {
    
    var viewers = parseInt(result.stream.viewers);
    updateDataTable('viewersTwitch', viewers);
}

function updateDataTable(streamer, viewers) {
    //console.log("updateDataTable called")
    
    // write Data in newData object
    if (newData[streamer] == null) {
        newData[streamer] = viewers; 
    } 
    
    if ($.isNumeric(newData['viewersYoutube']) && $.isNumeric(newData['viewersTwitch'])) {
        // data was collected already 
        
        // write the collected data with the time into an array
        newDataArray = [];
        newDataArray.push(new Date().getTime());
        newDataArray.push(newData['viewersYoutube']);
        newDataArray.push(newData['viewersTwitch']);
        
        // store the new data as data point into an an data point array
        dataPoints.shift();
        dataPoints.push(newDataArray);
        
        // generate a data object for the google chart
//         var labels = [['Time', 'Youtube', 'Twitch']];
//         console.log(labels.concat(dataPoints));
        chartData = google.visualization.arrayToDataTable(dataPoints,true);
//         chartData = google.visualization.arrayToDataTable(labels.concat(dataPoints),false);
        
        updateGraphs();
       
        console.log("Viewers Youtube: "+newData['viewersYoutube']);
        console.log("Viewers Twitch: "+newData['viewersTwitch']);
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////
// Drawing
//////////////////////////////////////////////////////////////////////////////////////////////////

function updateGraphs() {
    // update all graphical elements with new data and draw them.
    
    drawChart();
//     drawProportionBar();
    
    $('youtube').append(newData['viewersYoutube']);
    $('twitch').append(newData['viewersTwitch']);
}

function drawChart() {
    console.log("drawChart() called")
    
    if (!chartIsReadyToDraw) {
        // Chart isn't ready to Draw (libary have to load or chart is been drawing jet). Call this function later
        setTimeout(drawChart, 100);
        return
    }
    
    var chart = new google.visualization.AreaChart(document.getElementById('chart_container'));
    chart.draw(chartData, chartOptions);
    
}



//////////////////////////////////////////////////////////////////////////////////////////////////
// Init stuff
//////////////////////////////////////////////////////////////////////////////////////////////////

$(document).ready(function(){
    
    call4ViewerCount();
    setInterval(call4ViewerCount, UPDATE_INTERVAL);
    setInterval(updateGraphs, 1000);


});

// Load the Google Chart Visualization API and the piechart package.
google.charts.load('current', {'packages':['corechart']});
// Set a callback to run when the Google Visualization API is loaded.
google.charts.setOnLoadCallback(function() {
    chartIsReadyToDraw = true;
});

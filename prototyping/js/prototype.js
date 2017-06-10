
////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Settings
////////////////////////////////////////////////////////////////////////////////////////////////////////////

const NUMBER_OF_DATAPOINTS = 5;
const UPDATE_INTERVAL = 2500;

var streamIDs = {
    youtube:"tn0zpeHPfw0",
    twitch:"rocketbeanstv"
};
var apiKeys = {
    youtube:"AIzaSyAEKdRMGaHEVQCTzLrUbX3HPdp82mTpWWk",
    twitch:"vsiaqcev0wed3la13a05h3tyi93z2o"
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Internal Variables
////////////////////////////////////////////////////////////////////////////////////////////////////////////

var newData = {
    viewersYoutube:null,
    viewersTwitch:null,
};

var dataPoints = [];
for (i = 0; i < NUMBER_OF_DATAPOINTS; i++) {
    dataPoints.push([undefined,undefined,undefined]);
}

var chartData = [];

////////////////////////////////////////////////////////////////////////////////////////////////////////////
// collect the data and so on
////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
//     console.log("processYtData called");
    
    var viewers = parseInt(result.items[0].liveStreamingDetails.concurrentViewers);
    updateDataTable('viewersYoutube', viewers);
}

function processTwitchData(result, status) {
//     console.log("processTwitchData called");
    
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
        
       
        console.log("dataPoints updated: "+dataPoints);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Chart drawing
////////////////////////////////////////////////////////////////////////////////////////////////////////////

function drawChart() {
    return false;
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Init stuff
////////////////////////////////////////////////////////////////////////////////////////////////////////////

$(document).ready(function(){
    
    call4ViewerCount();
    setInterval(call4ViewerCount, UPDATE_INTERVAL*33);

});

// Load the Google Chart Visualization API and the piechart package.
google.charts.load('current', {'packages':['corechart']});
// Set a callback to run when the Google Visualization API is loaded.
google.charts.setOnLoadCallback(drawChart);

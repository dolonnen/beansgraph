
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

var dataPoints = new Array(NUMBER_OF_DATAPOINTS);


////////////////////////////////////////////////////////////////////////////////////////////////////////////
// get Data and so on
////////////////////////////////////////////////////////////////////////////////////////////////////////////

function call4ViewerCount() {
    streamIdYoutube = "tn0zpeHPfw0"
    apiKeyYoutube = "AIzaSyAEKdRMGaHEVQCTzLrUbX3HPdp82mTpWWk";
    streamIdTwitch = "rocketbeanstv"
    apiKeyTwitch = "vsiaqcev0wed3la13a05h3tyi93z2o";
    
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
    
    // iterate through the object varables of newData
    keys = Object.keys(newData);
    var newDataArray = [];
    for (x in keys) {
        if ( !$.isNumeric(newData[keys[x]])) {
            // data not yet collected so far. Skip the whole function
            return;
        }
    
    // write the collected data into an array
    newDataArray.push(newData[keys[x]]);
    }
    
    // store the new data as data point into an an data point array
    newDataArray.unshift(new Date().getTime());
    dataPoints.shift();
    dataPoints.push(newDataArray);
    
    console.log("newDataArray: "+newDataArray);
    console.log(dataPoints);
}


$(document).ready(function(){
    
    call4ViewerCount();
    setInterval(call4ViewerCount, UPDATE_INTERVAL*33);

});

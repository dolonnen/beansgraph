
function call4ViewerCount() {
    streamIdYoutube = "tn0zpeHPfw0"
    apiKeyYoutube = "AIzaSyAEKdRMGaHEVQCTzLrUbX3HPdp82mTpWWk";
    streamIdTwitch = "rocketbeanstv"
    apiKeyTwitch = "vsiaqcev0wed3la13a05h3tyi93z2o";

//     alert('1');
    $.get(
    "https://api.twitch.tv/kraken/streams/"+streamIdTwitch+"?client_id="+apiKeyTwitch,
    processTwitchData
    );
    
//     alert('2');
    $.getJSON(
    "https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id="+streamIdYoutube+"&key="+apiKeyYoutube,
    processYtData
    );
}

function processYtData(result, status) {
    $("#youtube").html(result.items[0].liveStreamingDetails.concurrentViewers);
}

function processTwitchData(result, status) {
    $("#twitch").html(result.stream.viewers);
}


call4ViewerCount();

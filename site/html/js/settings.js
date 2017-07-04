//////////////////////////////////////////////////////////////////////
// Settings
//////////////////////////////////////////////////////////////////////

const UPDATE_INTERVAL = 10000;
const NUMBER_OF_DATAPOINTS = 90;
const HOURS_IN_THE_PAST = 4;

// var streamIDs = {
//     youtube:"8bYu-0ErsfE",      // 
//     twitch:"rocketbeanstv"
// };
// var apiKeys = {
//     youtube:"AIzaSyAEKdRMGaHEVQCTzLrUbX3HPdp82mTpWWk",
//     twitch:"vsiaqcev0wed3la13a05h3tyi93z2o"
// };

var updateCreds = true;
var updateCredsUrl = "https://bgraph.markab.uberspace.de/fcgi-bin/getStreamCreds.fcgi/";

var defaultStreamCreds = {
    youtube: {
        streamID: "SIa_ajTOFs0",
        apiKey: "AIzaSyAEKdRMGaHEVQCTzLrUbX3HPdp82mTpWWk"
    },
    twitch:{
        streamID: "rocketbeanstv",
        apiKey: "vsiaqcev0wed3la13a05h3tyi93z2o"
    }
};

// Chart settings

var chartBackgroundColor = '#2c2c2c';
var chartTextColor = '#cccccc';

var youtubeColor = '#cd201f';
var twitchColor = '#6441A4';

var areaChartOptions = {
    isStacked: true,
    animation: {
        duration: 200,
        easing: 'out'
    },
    areaOpacity: 1.0,
    colors:[youtubeColor,twitchColor],
    backgroundColor: chartBackgroundColor,
    hAxis: {
        baselineColor: chartBackgroundColor,
        gridlines: {color: chartBackgroundColor},
        textPosition: 'none'
    },
    vAxis: {
        minValue: 0,
        title: "aktuelle Zuschauerzahl",
        titleTextStyle: {
            color: chartTextColor
        },
        baselineColor: chartBackgroundColor,
        gridlines: {color: chartBackgroundColor},
        textStyle: {color: chartTextColor}
    },
    legend: {position: 'none'},
};

var columnChartOptions = {
    isStacked: true,
    animation: {
        duration: 200,
        easing: 'out'
    },
    colors: [youtubeColor,twitchColor],
    backgroundColor: chartBackgroundColor,    
    hAxis: {
        baselineColor: chartBackgroundColor,
        gridlines: {color: chartBackgroundColor},
        textPosition: 'out',
        textStyle: {color: chartTextColor}
    },
    bar: {groupWidth: "35%"},
    vAxis: {
        minValue: 1000,
        title: "Langzeitübersicht",
        titleTextStyle: {
            color: chartTextColor
        },
        baselineColor: chartBackgroundColor,
        gridlines: {color: chartBackgroundColor},
        textStyle: {color: chartTextColor}
    },
    legend: {position: 'none'},
};
 

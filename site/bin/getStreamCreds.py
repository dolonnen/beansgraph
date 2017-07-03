#!/usr/bin/env python3.6

from flask import Flask
import requests
import re
import json 


app = Flask(__name__)

# API-Keys
apiKeys = {
    'youtube': "AIzaSyAEKdRMGaHEVQCTzLrUbX3HPdp82mTpWWk",
    'twitch': "vsiaqcev0wed3la13a05h3tyi93z2o"
}


@app.route('/')
def provideCreds():
    rbSite = requests.get('https://www.rocketbeans.tv/').text
    
    patternYoutube = re.compile('https://www.youtube.com/embed/(.*?)?modestbranding=')
    #patternTwitch = re.compile('https://player.twitch.tv/?channel=(.*)&autoplay=false')
    
    streamCreds = {}
    #print("Youtube:",patternYoutube.search(rbSite).group(1)[0:-1])
    streamCreds['youtube'] = {
        'streamID': patternYoutube.search(rbSite).group(1)[0:-1],
        'apiKey': apiKeys['youtube']
    }
    #print(patternTwitch.search(rbSite))
    streamCreds['twitch'] = {
        #'streamId': patternTwitch.search(rbSite).group(1),
        'streamID': "rocketbeanstv",
        'apiKey': apiKeys['twitch']
    }
    
    return json.dumps(streamCreds)


if __name__ == '__main__':
    provideCreds()


# https://www.youtube.com/embed/8bYu-0ErsfE?modestbranding=1&showinfo=0
# https://player.twitch.tv/?channel=rocketbeanstv&autoplay=false

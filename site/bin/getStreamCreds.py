#!/usr/bin/env python3.6

from flask import Flask
import requests
import json 

app = Flask(__name__)

# API-Keys
apiKeys = {
'youtube': "AIzaSyAEKdRMGaHEVQCTzLrUbX3HPdp82mTpWWk",
'twitch': "vsiaqcev0wed3la13a05h3tyi93z2o"
}


@app.route('/')
def hello_world():
    
    rbSite = requests.get('https://www.rocketbeans.tv/').text
    
    streamCreds['apikeys'] = apiKeys
    return json.dumps(streamCreds)



# https://www.youtube.com/embed/8bYu-0ErsfE?modestbranding=1&showinfo=0
# https://player.twitch.tv/?channel=rocketbeanstv&autoplay=false

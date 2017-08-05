import React, { Component } from 'react';
import io from 'socket.io-client';
import MediaElement from './MediaElement.js';
//import {List} from 'material-ui';
import Chat from './Chat.js';
import './Video.css';

let timeBar;
let playerInstance;
let playerElement;

class Video extends Component {
  constructor(props) {
    super(props);
    this.socket = io(`http://localhost:8080`);
  }
  componentDidMount() {
    const { MediaElementPlayer } = global;
    playerInstance = new MediaElementPlayer('player_html5');
    playerElement = document.getElementById('player');
    timeBar = document.getElementsByClassName('mejs__time-slider')[0];

    this.socket.emit('join', {name: this.props.name, room: this.props.room});

    //sends signal to pause video
    playerElement.addEventListener('pause', ()=> {
      this.socket.emit('play-pause-video', false);
    });
    //sends signal to play video
    playerElement.addEventListener('playing', ()=> {
      this.socket.emit('play-pause-video', true);
    });
    //sends signal if video time is changed
    timeBar.addEventListener('click', ()=> {
      this.socket.emit('update-time', playerInstance.getCurrentTime());
    });

    //receives signal to handle play/pause
    this.socket.on('play-pause-video', (curPlay)=> {
      if (curPlay) playerInstance.play();
      else playerInstance.pause();
    });
    //receives signal to handle video time update
    this.socket.on('update-time', (curTime)=> {
      playerInstance.setCurrentTime(curTime);
    });
  }
  componentWillUnmount() {
    this.socket.disconnect();
  }
  render() {
    const
      sources = [
        { src: 'http://www.streambox.fr/playlists/test_001/stream.m3u8', type: 'application/x-mpegURL' },
        { src: 'http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4', type: 'video/mp4' },
        { src: 'rtmp://firehose.cul.columbia.edu:1935/vod/mp4:sample.mp4', type: 'video/rtmp' }
      ],
      config = {},
      tracks = {}
      ;

    return (
      <div className="video-content">
        <MediaElement
          id="player"
          ref={elem => this.mediaelement = elem}
          mediaType="video"
          preload="none"
          controls
          width="640"
          height="360"
          poster=""
          sources={JSON.stringify(sources)}
          options={JSON.stringify(config)}
          tracks={JSON.stringify(tracks)}
        />
      </div>
    );
  }
}

export default Video;

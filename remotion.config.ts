import { Config } from 'remotion';

Config.setFramerate(30);
Config.setVideoImageFormat('jpeg');
Config.setDurationInFrames(20 * 30); // 20 seconds at 30fps (default, can be overridden)

// Configure audio codec for best compatibility
Config.setAudioCodec('aac');

// Set output format
Config.setOutputFormat('mp4');

export default Config;

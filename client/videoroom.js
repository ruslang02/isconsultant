const Janus = require("janus-gateway-js")

function VideoRoom() {
  Janus.MediaPlugin.apply(this, arguments);
}

VideoRoom.NAME = 'janus.plugin.videoroom';
VideoRoom.prototype = Object.create(Janus.MediaPlugin.prototype);
VideoRoom.prototype.constructor = VideoRoom;

Janus.Plugin.register(VideoRoom.NAME, VideoRoom);


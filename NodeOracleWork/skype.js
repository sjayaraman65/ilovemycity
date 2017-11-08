var SkypeAPI = require('SkypeAPI');

var skype = new SkypeAPI({
  username: 'USERNAME',
  password: 'PASSWORD'
});

skype.on('Chat', function (e) {
  skype.sendMessage(e.channel, e.content);
});
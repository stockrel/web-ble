var wpi = require('wiring-pi');
var config = require('../config/config.json');
var async = require('async');

var name = "Meerky Healthbox";
var init = false;
var pins = [];
var durations = [];
var roles = [];
var blinks = [];

module.exports = {

  initialize: function(){
    for (var i = 0 ; i < config.leds.length ; i++){
      pins[config.leds[i].value] = config.leds[i].pin;
      durations[config.leds[i].value] = config.leds[i].duration;
      roles[config.leds[i].value] = config.leds[i].role;
      blinks[config.leds[i].value] = config.leds[i].blink;
    }
    init = true;
    wpi.setup('wpi');
    console.log(pins)
    console.log(durations)
    console.log(roles)
    console.log(blinks)
  },

  str2ab: function(str) {
        var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
        var bufView = new Uint16Array(buf);
        for (var i=0, strLen=str.length; i < strLen; i++) {
          bufView[i] = str.charCodeAt(i);
        }
        return buf;
      },

  ab2str: function(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
  },

  lightLed: function(data) {
    var isLedOn = 0;
    var currentLed = {};
    
    async.forEach(config.leds,function(led,callback){
      // console.log(led.value,data.toString("hex"));
      if (led.value == data.toString("hex")){
        currentLed = led;
        // console.log("match 2")
      }
      callback();
    },function(err){
      if (err) throw err;

      // console.log(currentLed)
      wpi.pinMode(currentLed.pin, wpi.OUTPUT);
      wpi.digitalWrite(currentLed.pin, 0 );

      var blink = setInterval(function() {
        isLedOn = +!isLedOn;
        wpi.digitalWrite(currentLed.pin, isLedOn );
      }, currentLed.blink);

      setTimeout(function(){
        clearInterval(blink);
        wpi.digitalWrite(currentLed.pin, 1 );
      },currentLed.duration)
    })

  },

  shutdownLed: function(blink) {

    clearInterval(blink);
    wpi.digitalWrite(pins[data], 1 );
    
  },

  connectBLE: function() {
    if (!init) this.initialize();
    wpi.pinMode(pins["0000"], wpi.OUTPUT);
    wpi.digitalWrite(pins["0000"], 0 );
  },

  disconnectBLE: function() {
    if (!init) this.initialize();
    wpi.pinMode(pins["0000"], wpi.OUTPUT);
    wpi.digitalWrite(pins["0000"], 1 );
  },

  log: function(message,address){
    console.log("["+new Date()+"][Meerky Healthbox]["+address+"] "+message);
  }

};
var bleno = require('bleno');
var util = require('util');

var LedCharacteristic = require('./characteristics/led');

function SystemInformationService() {

  bleno.PrimaryService.call(this, {
   uuid: '00001101-0000-1000-8000-00805f9b34fb',
    characteristics: [
      new LedCharacteristic()
    ]
  });
};

util.inherits(SystemInformationService, bleno.PrimaryService);
module.exports = SystemInformationService;

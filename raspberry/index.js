var bleno = require('bleno');
var utils = require('./utils/utils');

var BlenoCharacteristic = bleno.Characteristic;

var SystemInformationService = require('./systeminformationservice');

var systemInformationService = new SystemInformationService();
process.env['BLENO_DEVICE_NAME'] = 'Meerky Healthbox';

bleno.on('stateChange', function(state) {
  utils.log("State changed: "+state,"self");

  if (state === 'poweredOn') {

    bleno.startAdvertising("Healthbox", [systemInformationService.uuid]);
  }
  else {

    bleno.stopAdvertising();
  }
});

bleno.on('accept', function(clientAddress){
  utils.log("Accepted connection. Hello !",clientAddress);
  utils.connectBLE();
});

bleno.on('disconnect', function(clientAddress){
  utils.log("Client disconnected. Bye bye !",clientAddress);
  utils.disconnectBLE();
});

bleno.on('advertisingStart', function(error) {

  utils.log("Advertising start: "+
    (error ? 'error ' + error : 'success'),"self");

  if (!error) {

    bleno.setServices([
      systemInformationService
    ]);
  }
});
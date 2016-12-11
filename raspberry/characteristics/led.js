var bleno = require('bleno');
var os = require('os');
var util = require('util');
var utils = require('../utils/utils');
var wpi = require('wiring-pi');
var config = require('../config/config.json');
var async = require('async');

var name = "Meerky Healthbox";

var BlenoCharacteristic = bleno.Characteristic;

var FifoCharacteristic = function() {
 FifoCharacteristic.super_.call(this, {
    uuid: '2456e1b9-26e2-8f83-e744-f34f01e9d703',
    properties: ['read','write','notify'],
  });

  this._value = new Buffer(0);
  this._updateValueCallback = null;
};


FifoCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
  var reorderedString = data.toString('hex').match(/.{2}/g).reverse().join("");
  var requestID = reorderedString.substring(0,4);
  var requestTypeID = reorderedString.substring(4,8);
  console.log("onWriteRequest",requestID,requestTypeID)
  console.log(data);
  console.log(data.toString('hex'))
  utils.log("Receiving Buffer "+data,"unknown");
  utils.log("Decoded buffer is request #"+requestID+" for sensor ID "+requestTypeID,"unknown");
  lightLed(requestTypeID,requestID,this._updateValueCallback);
  callback(this.RESULT_SUCCESS,Buffer.allocUnsafe(-1));
};



function lightLed(requestTypeID,requestID,updateValueCallback) {
    var isLedOn = 0;
    var currentLed = {};
    console.log("lightLed",requestID,requestTypeID)
    async.forEach(config.leds,function(led,callback){
      if (led.value == requestTypeID){
        currentLed = led;
      }
      callback();
    },function(err){
      if (err) throw err;

      wpi.pinMode(currentLed.pin, wpi.OUTPUT);
      wpi.digitalWrite(currentLed.pin, 0 );

      var blink = setInterval(function() {
        isLedOn = +!isLedOn;
        wpi.digitalWrite(currentLed.pin, isLedOn );
      }, currentLed.blink);

      setTimeout(function(){
        clearInterval(blink);
        wpi.digitalWrite(currentLed.pin, 1 );
        
        if (updateValueCallback) {
           utils.log('FifoCharacteristic notifying',"unknown");

          
          // utils.log("Sending back response for request #"+requestID+": "+constructResponse(requestTypeID,requestID),"unknown");

          updateValueCallback(constructResponse(requestTypeID,requestID));
        }

      },currentLed.duration)
    })

  }

// function getSensor(value,callback){
//   async.forEach(config.leds,function(led,cb){
//       if (value == requestTypeID){
//         currentLed = led;
//       }
//       cb();
//     },function(err){
//       if (err) return callback(err,null);
//       return callback(null,)
//     })
// }

function constructResponse(requestTypeID,requestID){
  console.log("constructResponse",requestID,requestTypeID)
  const buf = Buffer.allocUnsafe(4);
  if (requestTypeID == "0105"){
    var value = (Math.random() * (23.000000 - 17.000000) + 17.000000).toFixed(6)
    console.log("Temperature - return value "+value)
    buf.writeFloatLE(value,0);
  }else if (requestTypeID == "0106"){
    var value = (Math.random() * (98600.000000 - 98700.000000) + 98600.000000).toFixed(6)
    console.log("Pressure - return value "+value)
    buf.writeFloatLE(value,0);
  }else if (requestTypeID == "0107"){
    var value = (Math.random() * (30.000000 - 20.000000) + 20.000000).toFixed(6)
    console.log("Humidity - return value "+value)
    buf.writeFloatLE(value,0);
  }else if (requestTypeID == "0101"){
    var value = (Math.random() * (-54.000000 - -52.000000) + -54.000000).toFixed(6)
    console.log("RF - return value "+value)
    buf.writeFloatLE(value,0);
  }else if (requestTypeID == "0102"){
    var value = (Math.random() * (30.000000 - 20.000000) + 20.000000).toFixed(6)
    console.log("UVA - return value "+value)
    buf.writeUInt16LE(value,0);
  }else if (requestTypeID == "0103"){
    var value = (Math.random() * (30.000000 - 20.000000) + 20.000000).toFixed(6)
    console.log("UVB - return value "+value)
    buf.writeUInt16LE(value,0);
  }else if (requestTypeID == "0104"){
    var value = (Math.random() * (30.000000 - 20.000000) + 20.000000).toFixed(6)
    console.log("UVI - return value "+value)
    buf.writeFloatLE(value,0);
  }

  // console.log(buf)
  // console.log(rawBuffer)
  // console.log(requestTypeID,requestID)
  var prefix = Buffer.from(new Uint16Array([parseInt(requestTypeID, 16),parseInt(requestID, 16)]).buffer);
  var status = Buffer.from(new Int8Array([parseInt(0, 8)]).buffer);
  const responseBuffer = Buffer.concat([prefix, status, buf]);
  console.log(responseBuffer)
  return responseBuffer;
}

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function arrayBuffer2String(buf, callback) {
    var bb = new BlobBuilder();
    bb.append(buf);
    var f = new FileReader();
    f.onload = function(e) {
        callback(e.target.result)
    }
    f.readAsText(bb.getBlob());
}
function uintToString(uintArray) {
    var encodedString = String.fromCharCode.apply(null, uintArray),
        decodedString = decodeURIComponent(escape(encodedString));
    return decodedString;
}

FifoCharacteristic.prototype.onReadRequest = function(offset, callback) {

  if(!offset) {

    var loadAverage = os.loadavg().map(function(currentValue, index, array){

      return currentValue.toFixed(3);
    });

    this._value = new Buffer(JSON.stringify({
      'oneMin' : loadAverage[0],
      'fiveMin': loadAverage[1],
      'fifteenMin': loadAverage[2]
    }));
  }

  console.log('FifoCharacteristic - onReadRequest: value = ' +
    this._value.slice(offset, offset + bleno.mtu).toString()
  );
 
  callback(this.RESULT_SUCCESS, this._value.slice(offset, this._value.length));
};

FifoCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
  console.log('FifoCharacteristic - onSubscribe');
  console.log(updateValueCallback)
  this._updateValueCallback = updateValueCallback;
};

util.inherits(FifoCharacteristic, BlenoCharacteristic);
module.exports = FifoCharacteristic;
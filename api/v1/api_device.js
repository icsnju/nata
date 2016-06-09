var DeviceModel = require('../../models/model_device');
var Device = require('nata-device')

module.exports.create = function (req, res, next) {
  var device_id = req.params.id;
  new Device(device_id).getDeviceInfo().then(function (info) {
    var device = new DeviceModel();
    device.id = info.id;
    device.name = info.name;
    device.android_version = info.version;
    device.sdk_version = info.sdk;
    device.resolution = info.resolution;
    device.cpu_abi = info.cpu;
    device.manufacturer = info.manufacturer;

    device.save(function (err, device) {
      if (err) {
        return next(err);
      } else {
        res.status(200).json(device);
      }
    });
  }).catch(function (err) {
    next(err);
  })


};

module.exports.remove = function (req, res, next) {
  var device_id = req.params.id;
  console.log(device_id);
  DeviceModel.findOneAndRemove({
    id: device_id
  }, function (err, record) {
    if (err || !record) {
      next(err);
    }
    res.status(200).json(record);
  });
};

module.exports.devices = function (req, res, next) {
  Device.getOnlineDevices().then(function (devices) {
    res.status(200).json(devices)
  }).catch(function (err) {
    next(err)
  })

}

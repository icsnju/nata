'use strict'
const DeviceModel = require('../../models/model_device')
const Device = require('nata-device')

module.exports.create = (req, res, next) => {
  const deviceId = req.params.id
  new Device(deviceId).getDeviceInfo()
  .then((info) => {
    const device = new DeviceModel()
    device.id = info.id
    device.name = info.name
    device.android_version = info.version
    device.sdk_version = info.sdk
    device.resolution = info.resolution
    device.cpu_abi = info.cpu
    device.manufacturer = info.manufacturer

    device.save((err, data) => {
      if (err) {
        return next(err)
      }
      return res.status(200).json(data)
    })
  })
  .catch((err) => {
    next(err)
  })
}

module.exports.remove = (req, res, next) => {
  const deviceId = req.params.id
  DeviceModel.findOneAndRemove({
    id: deviceId,
  }, (err, record) => {
    if (err || !record) {
      next(err)
    }
    return res.status(200).json(record)
  })
}

module.exports.devices = (req, res, next) => {
  Device.getOnlineDevices().then((devices) => {
    res.status(200).json(devices)
  }).catch((err) => {
    next(err)
  })
}

module.exports.fireAction = (req, res, next) => {
  const deviceId = req.params.id
  const action = req.body.action
  console.log(action)
  const device = new Device(deviceId)
  device.executeAction(action)
  .then(() => {
    return res.status(200).send('success')
  })
  .catch((err) => {
    next(err)
  })
}

module.exports.uiActions = (req, res, next) => {
  const deviceId = req.params.id
  const device = new Device(deviceId)
  device.getUIActionCommands()
  .then((actions) => {
    console.log(actions);
    return res.status(200).json(actions)
  })
  .catch((err) => {
    next(err)
  })
}

module.exports.fireActions = (req, res, next) => {
  const deviceId = req.params.id
  const actions = req.body.actions
  console.log(actions)
  const device = new Device(deviceId)

  device.executeActions(actions)
  .then(() => {
    return res.status(200).json('success')
  })
  .catch((err) => {
    next(err)
  })
}


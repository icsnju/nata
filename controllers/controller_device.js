'use strict'
const DeviceModel = require('../models/model_device')

/**
 * 获取设备列表
 */
module.exports.show = (req, res, next) => {
  DeviceModel.find({}, (err, devices) => {
    if (err) return next(err)
    return res.render('devices', { title: '设备列表', devices })
  })
}
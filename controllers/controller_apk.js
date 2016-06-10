'use strict'
const ApkModel = require('../models/model_apk')
const _ = require('lodash')

/**
 * 获取应用列表
 */
module.exports.show = (req, res, next) => {
  ApkModel.find({}, (err, apks) => {
    if (err) return next(err)
    return res.render('apk/apks', { title: '应用列表', apks })
  })
}

/**
 * 获取应用详细信息
 */
module.exports.detail = (req, res, next) => {
  const apkId = req.params.id

  ApkModel.findOne({ _id: apkId }, (err, apk) => {
    if (err) return next(err)
    return res.render('apk/apk_detail', { title: '应用详细情况', apk })
  })
}

/**
 * 获取应用详细信息
 */
module.exports.replay = (req, res, next) => {
  const apkId = req.params.id
  const actName = req.params.act_name

  ApkModel.findOne({ _id: apkId }, (err, apk) => {
    if (err) return next(err)

    const actpath = _.find(apk.actpaths, { activity: actName })
    if (actpath) {
      return res.render('replay', { title: 'Act回放', actions: actpath.actions })
    }
    return res.status(500).json()
  })
}

'use strict'
const RecordModel = require('../models/model_record.js')
const DeviceModel = require('../models/model_device.js')
const ApkModel = require('../models/model_apk.js')
const Eventproxy = require('eventproxy')
const _ = require('lodash')

/**
 * 获取自动任务运行详情
 */
module.exports.run = function (req, res, next) {
  const recordId = req.params.id
  RecordModel.findOne({ _id: recordId }, (err, record) => {
    if (err) return next(err)
    return res.render('records/run', { title: '任务详情', record })
  })
}

/**
 * 重新运行
 */
module.exports.replay = (req, res, next) => {
  const recordId = req.params.id
  RecordModel.findOne({ _id: recordId }, (err, record) => {
    if (err) return next(err)
    return res.render('replay', { title: '回放', actions: record.actions })
  })
}

/**
 * 获取详细报告
 */
module.exports.report = (req, res, next) => {
  const recordId = req.params.id
  RecordModel.findOne({ _id: recordId }, (err, record) => {
    if (err) next(err)
    const summaries = record.summaries

    const xData = []
    const yDataWidget = []
    const yDataActivity = []
    for (let i = 0; i < summaries.length; i++) {
      xData.push(summaries[i].action)
      yDataActivity.push(summaries[i].activity)
      yDataWidget.push(summaries[i].widget)
    }
    return res.render('records/report', { title: '详细报告', xData, yDataWidget, yDataActivity })
  })
}

/**
 * 获取任务列表
 */
module.exports.show = (req, res, next) => {
  const ep = new Eventproxy()
  ep.fail(next)

  ep.all('records', 'devices', 'apks', (records, devices, apks) => {
    records.forEach((record) => {
      if (record.setup.length !== 0) {
        const actions = _.join(record.setup, '\n')
        record.setup = actions
      }

      ApkModel.findOne({ _id: record.apk_id }).exec(ep.done((apk) => {
        record.apk_name = apk.name
        record.package_name = apk.package_name
        record.activity_name = apk.activity_name

        if (apk.blacklist.length !== 0) {
          const resources = _.join(apk.blacklist, '\n')
          record.blacklist = resources
        }
        ep.emit('apk')
      }))
    })

    ep.after('apk', records.length, () => {
      return res.render('records/records', { title: '自动遍历任务', records, devices, apks })
    })
  })

  RecordModel.find({}).sort({ create_at: -1 }).exec(ep.done('records'))
  DeviceModel.find({}).sort({ create_at: -1 }).exec(ep.done('devices'))
  ApkModel.find({}).sort({ create_at: -1 }).exec(ep.done('apks'))
}
'use strict'
const TestcaseModel = require('../models/model_testcase.js')
const DeviceModel = require('../models/model_device.js')
const ApkModel = require('../models/model_apk.js')
const Eventproxy = require('eventproxy')
const _ = require('lodash')

/**
 * 获取录制任务列表
 */
module.exports.show = (req, res, next) => {
  const ep = new Eventproxy()
  ep.fail(next)

  ep.all('testcases', 'devices', 'apks', (testcases, devices, apks) => {
    testcases.forEach((testcase) => {
      console.log(testcase.apk_id)
      ApkModel.findOne({ _id: testcase.apk_id }).exec(ep.done((apk) => {
        testcase.apk_name = apk.name
        testcase.package_name = apk.package_name
        testcase.activity_name = apk.activity_name
        ep.emit('apk')
      }))
    })

    ep.after('apk', testcases.length, () => {
      return res.render('testcases/index', { title: '录制任务', testcases, devices, apks })
    })
  })

  TestcaseModel.find({}).sort({ create_at: -1 }).exec(ep.done('testcases'))
  DeviceModel.find({}).sort({ create_at: -1 }).exec(ep.done('devices'))
  ApkModel.find({}).sort({ create_at: -1 }).exec(ep.done('apks'))
}

module.exports.record = (req, res, next) => {
  const testcaseId = req.params.id
  const ep = new Eventproxy()
  ep.fail(next)

  TestcaseModel.findOne({ _id: testcaseId }).exec(ep.done('testcase'))
  TestcaseModel.find({ isFinish: true }).exec(ep.done('testcases'))

  ep.on('testcase', (testcase) => {
    ApkModel.findOne({ _id: testcase.apk_id }).exec(ep.done('apk'))
  })

  ep.all('testcase', 'apk', 'testcases', (testcase, apk, testcases) => {
    return res.render('testcases/record', { title: '录制任务', apk, testcase, testcases })
  })
}

module.exports.edit = (req, res, next) => {
  const testcaseId = req.params.id
  const ep = new Eventproxy()
  ep.fail(next)

  TestcaseModel.findOne({ _id: testcaseId }).exec(ep.done('testcase'))

  ep.on('testcase', (testcase) => {
    let actions = ''
    _(testcase.actions).forEach((action) => {
      actions += `${action}\n`
    })

    return res.render('testcases/edit', { title: '录制任务', testcase, actions: actions.trim() })
  })
}

/**
 * 获取应用详细信息
 */
module.exports.replay = (req, res, next) => {
  const testcaseId = req.params.id
  const ep = new Eventproxy()
  ep.fail(next)

  TestcaseModel.findOne({ _id: testcaseId }).exec(ep.done('testcase'))

  ep.on('testcase', (testcase) => {
    return res.render('replay', { title: '测试用例回放', actions: testcase.actions, device_id: testcase.device_id })
  })
}
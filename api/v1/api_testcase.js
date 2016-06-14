'use strict'
const TestcaseModel = require('../../models/model_testcase.js')

module.exports.create = (req, res, next) => {
  const testcase = new TestcaseModel()
  testcase.name = req.body.name
  testcase.device_id = req.body.device_id
  testcase.apk_id = req.body.apk_id
  testcase.type = req.body.type

  testcase.save((err, data) => {
    if (err) return next(err)
    return res.status(200).json(data)
  })
}

module.exports.getactions = (req, res, next) => {
  const testcaseId = req.params.id
  TestcaseModel.findOne({ _id: testcaseId }, (err, testcase) => {
    if (err) return next(err)
    const actions = testcase.actions
    return res.status(200).json(actions)
  })
}


module.exports.remove = (req, res, next) => {
  const testcaseId = req.params.id
  TestcaseModel.findOneAndRemove({ _id: testcaseId }, (err, testcase) => {
    if (err) return next(err)
    return res.status(200).json(testcase)
  })
}

module.exports.finish = (req, res, next) => {
  const testcaseId = req.params.id
  const actions = req.body.actions

  TestcaseModel.findOne({ _id: testcaseId }, (err, testcase) => {
    if (err) return next(err)
    testcase.actions = actions
    testcase.isFinish = true

    testcase.save((error) => {
      if (error) return next(error)
      return res.status(200).send('success')
    })
  })
}

module.exports.save = (req, res, next) => {
  const testcaseId = req.params.id
  const name = req.body.name
  const actions = req.body.actions

  TestcaseModel.findOneAndUpdate({ _id: testcaseId }, { name, actions }, (err) => {
    if (err) return next(err)
    return res.status(200).send('success')
  })
}


'use strict'
const express = require('express')
const router = express.Router()
const ApkController = require('./controllers/controller_apk.js')
const DeviceController = require('./controllers/controller_device.js')
const RecordController = require('./controllers/controller_record.js')
const TestcaseController = require('./controllers/controller_testcase.js')


/* GET home page. */
router.get('/', (req, res) => {
  return res.redirect('/devices')
})

/**
 * devices operations
 */
router.get('/devices', DeviceController.show)

/**
 * apks operations
 */
router.get('/apks', ApkController.show)
router.get('/apks/:id/detail', ApkController.detail)
router.get('/apks/:id/replay/:act_name', ApkController.replay)


/**
 * records operations
 */
router.get('/records', RecordController.show)
router.get('/records/:id/run', RecordController.run)
router.get('/records/:id/replay', RecordController.replay)
router.get('/records/:id/report', RecordController.report)

/**
 * testcase operations
 */
router.get('/testcases', TestcaseController.show)
router.get('/testcases/:id/record', TestcaseController.record)
router.get('/testcases/:id/edit', TestcaseController.edit)
router.get('/testcases/:id/replay', TestcaseController.replay)

module.exports = router

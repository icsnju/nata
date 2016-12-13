'use strict'
const RecordModel = require('../../models/model_record.js')
const ApkModel = require('../../models/model_apk.js')
const TestcaseModel = require('../../models/model_testcase.js')
const Eventproxy = require('eventproxy')
const _ = require('lodash')
const Device = require('nata-device')
const path = require('path')


const childProcess = require('child_process')
const exec = childProcess.exec
const runner = childProcess.fork('runners/Runner.js')

const runningDevices = []
const minicap = path.join(__dirname, '../../minicap/')

exec(`adb forward tcp:1717 localabstract:minicap`, (error) => {
  if (error) console.log(error)
  console.log('execute adb')
})

Device.getTracker().then((tracker) => {
  tracker.on('add', (device) => {
    console.log(`Device ${device.id} was plugged in`)
    exec(`./run.sh ${device.id} &`, { cwd: minicap }, (err) => {
      if (err) console.log(err)
      console.log('execute run.sh')

    })
  })

  tracker.on('remove', (device) => {
    const ids = _.remove(runningDevices, (id) => {
      return id === device.id
    })

    if (ids.length !== 0) {
      runner.send({ type: 'stop', device_id: device.id })
    }
    console.log(`Device ${device.id} was unplugged`)
  })

  tracker.on('end', () => {
    console.log('Tracking stopped')
  })
}).
catch((err) => {
  console.log(err)
})


function submitSummary(recordId, data) {
  RecordModel.findOne({ _id: recordId }, (err, record) => {
    if (err) {
      return console.log(err)
    }

    record.summaries.push(data)
    record.save((error) => {
      if (error) console.log(error)
    })
  })
}

function submitLog(recordId, data) {
  RecordModel.findOne({ _id: recordId }, (err, record) => {
    if (err || !record) {
      return console.log(err)
    }
    record.logs.push(data)
    record.save((error) => {
      if (error) console.log(error)
    })
  })
}

function finishTask(recordId) {
  console.log(recordId)
  RecordModel.findOne({ _id: recordId }, (err, record) => {
    if (err || !record) {
      console.log(err)
    }

    record.status = 'success'
    record.save((error) => {
      console.log(error)
    })
  })
}

runner.on('message', (m) => {
  if (m.type === 'success' || m.type === 'failure') {
    console.log('success')
    _.remove(runningDevices, (id) => id === m.device_id)
   finishTask(m.record_id)
  }

  if (m.type === 'summary') {
    submitSummary(m.record_id, m.summary)
  }

  if (m.type === 'log') {
    submitLog(m.record_id, m.log)
  }
})

module.exports.create = (req, res, next) => {
  const ep = new Eventproxy()
  ep.fail(next)

  const record = new RecordModel()
  record.device_id = req.body.device_id
  record.apk_id = req.body.apk_id
  record.action_count = req.body.action_count
  record.algorithm = req.body.algorithm
  record.status = 'ready'
  const testcaseId = req.body.setup
  console.log(`testcase: ${testcaseId}`)

  ep.on('setup', () => {
    record.save((err, data) => {
      if (err) {
        return next(err)
      }
      return res.status(200).json(data)
    })
  })


  if (testcaseId) {
    TestcaseModel.findOne({ _id: testcaseId }).exec(ep.done((testcase) => {
      for (let i = 0; i < testcase.actions.length; i++) {
        record.setup.push(testcase.actions[i])
      }
      ep.emit('setup')
    }))
  } else {
    ep.emit('setup')
  }
}

module.exports.remove = function (req, res, next) {
  const recordId = req.params.id
  RecordModel.findOneAndRemove({ _id: recordId }, (err, record) => {
    if (err) {
      return next(err)
    }
    return res.status(200).json(record)
  })
}

module.exports.start = (req, res, next) => {
  const recordId = req.params.id
  const ep = new Eventproxy()
  ep.fail(next)

  ep.once('record', (record) => {
    const deviceId = record.device_id
    Device.isDeviceOnline(deviceId).then((isOnline) => {
      if (!isOnline) {
        return res.status(404).send('设备不在线')
      }
      return ep.emit('device', deviceId)
    }).catch((err) => {
      console.log(err)
      next(err)
    })
    ApkModel.findOne({ _id: record.apk_id }).exec(ep.done('apk'))
  })

  ep.all('record', 'device', 'apk', (record, device, apk) => {
    console.log('hello')
    record.status = 'running'

    runner.send({
      type: 'start',
      device_id: record.device_id,
      record_id: recordId,
      pkg: apk.package_name,
      act: apk.activity_name,
      setup: record.setup,
      action_count: record.action_count,
    })
    runningDevices.push(record.device_id)

    record.save((err) => {
      if (err) {
        console.log(err)
        next(err)
      }
      return res.status(200).send('开始')
    })
  })

  RecordModel.findOne({ _id: recordId }).exec(ep.done('record'))
}

module.exports.cancel = (req, res, next) => {
  const recordId = req.params.id
  RecordModel.findOne({ _id: recordId }, (err, record) => {
    if (err) {
      return next(err)
    }

    record.status = 'failure'
    record.save((error) => {
      if (error) return next(error)
      runner.send({
        type: 'stop',
        device_id: record.device_id,
      })
      _.remove(runningDevices, (id) => record.device_id === id)
      return res.status(200).send('success')
    })
  })
}



module.exports.finish = (req, res, next) => {
  const recordId = req.params.id
  RecordModel.findOne({ _id: recordId }, (err, record) => {
    if (err || !record) {
      return next(err)
    }

    record.status = 'success'
    record.save((error) => {
      if (error) return next(error)
      return res.status(200).send('success')
    })
  })
}

module.exports.getData = (req, res, next) => {
  const recordId = req.params.id

  RecordModel.findOne({ _id: recordId }, (err, record) => {
    if (err || !record) {
      return next(err)
    }

    const result = {}
    result.xData = _.map(record.summaries, (summary) => {
      return summary.action
    })
    result.yDataActivity = _.map(record.summaries, (summary) => {
      return summary.activity
    })

    result.logs = record.logs

    return res.status(200).json(result)
  })
}

// module.exports.summary = (req, res, next) => {
//   const recordId = req.params.id
//   const action = parseInt(req.body.action, 10)
//   const widget = parseInt(req.body.widget, 10)
//   const state = parseInt(req.body.state, 10)
//   const activity = parseInt(req.body.activity, 10)
//   const data = {
//     widget,
//     action,
//     activity,
//     state,
//   }
//   RecordModel.findOne({ _id: recordId }, (err, record) => {
//     if (err) {
//       return next(err)
//     }

//     record.summaries.push(data)
//     record.save((error) => {
//       if (error) return next(error)
//       return res.status(200).send('success')
//     })
//   })
// }




// module.exports.activity = (req, res, next) => {
//   const recordId = req.params.id
//   const activity = req.body.message

//   RecordModel.findOne({ _id: recordId }, (err, record) => {
//     if (err) {
//       return next(err)
//     }

//     record.activities.push(activity)
//     record.save((error) => {
//       if (error) return next(error)
//       return res.status(200).send('success')
//     })
//   })
// }

// module.exports.widget = (req, res, next) => {
//   const recordId = req.params.id
//   const widget = req.body.message

//   RecordModel.findOne({ _id: recordId }, (err, record) => {
//     if (err) return next(err)

//     record.widgets.push(widget)
//     record.save((error) => {
//       if (error) return next(error)
//       return res.status(200).send('success')
//     })
//   })
// }

// module.exports.action = (req, res, next) => {
//   const recordId = req.params.id
//   const action = req.body.message
//   // io.sockets.emit("action", action);

//   RecordModel.findOne({ _id: recordId }, (err, record) => {
//     if (err) return next(err)

//     record.actions.push(action)
//     record.save((error) => {
//       if (error) return next(error)
//       return res.status(200).send('success')
//     })
//   })
// }

// module.exports.state = (req, res, next) => {
//   const recordId = req.params.id
//   const state = req.body.message

//   RecordModel.findOne({ _id: recordId }, (err, record) => {
//     if (err) return next(err)

//     record.states.push(state)
//     record.save((error) => {
//       if (error) return next(error)
//       return res.status(200).send('success')
//     })
//   })
// }


const ApkModel = require('../../models/model_apk')
const RecordModel = require('../../models/model_record')
const TestcaseModel = require('../../models/model_testcase')
const Eventproxy = require('eventproxy')
const _ = require('lodash')

module.exports.create = (req, res, next) => {
  const apk = new ApkModel()
  apk.name = req.body.name
  apk.version = req.body.version
  apk.package_name = req.body.package_name
  apk.activity_name = req.body.activity_name

  apk.save((err, data) => {
    if (err) {
      return next(err)
    }
    return res.status(200).json(data)
  })
}

module.exports.update = (req, res, next) => {
  const apkId = req.params.id
  const name = req.body.name
  const version = req.body.version
  const packageName = req.body.package_name
  const activityName = req.body.activity_name

  ApkModel.findOne({ _id: apkId }).exec((err, apk) => {
    apk.name = name
    apk.version = version
    apk.package_name = packageName
    apk.activity_name = activityName

    apk.save((error) => {
      if (error) return next(error)
      return res.status(200).send('save success')
    })
  })
}

module.exports.remove = (req, res, next) => {
  const ep = new Eventproxy()
  ep.fail(next)

  const apkId = req.params.id

  ep.all('records', 'testcases', 'apk', (records, testcase, apk) => {
    res.status(200).json(apk)
  })

  TestcaseModel.find({ apk_id: apkId }).remove(ep.done('testcases'))
  RecordModel.find({ apk_id: apkId }).remove(ep.done('records'))
  ApkModel.findOneAndRemove({ _id: apkId }).exec(ep.done('apk'))
}


module.exports.addBlacklist = (req, res, next) => {
  const apkId = req.params.id
  const item = req.body.item.trim()

  if (!apkId || ! item) {
    return res.status(422).send('error')
  }

  ApkModel.findOne({ _id: apkId }).exec((err, apk) => {
    const index = apk.blacklist.indexOf(item)

    if (index !== -1) {
      res.status(200).send('save success')
    } else {
      apk.blacklist.push(item)
      apk.save((error) => {
        if (error) return next(error)
        return res.status(200).send('save success')
      })
    }
  })
}

module.exports.removeBlacklist = (req, res, next) => {
  const apkId = req.params.id
  const item = req.body.item.trim()

  if (!apkId || ! item) {
    return res.status(422).send('error')
  }

  ApkModel.findOne({ _id: apkId }).exec((err, apk) => {
    const index = apk.blacklist.indexOf(item)
    if (index === -1) {
      res.status(404).send('not found')
    } else {
      apk.blacklist.splice(index, 1)

      apk.save((error) => {
        if (error) return next(error)
        return res.status(200).send('delete success')
      })
    }
  })
}

module.exports.removeActpath = (req, res, next) => {
  const apkId = req.params.id
  const actName = req.params.actpath.trim()

  ApkModel.findOne({ _id: apkId }).exec((err, apk) => {
    _.remove(apk.actpaths, (actPath) => {
      return actPath.activity === actName
    })

    apk.save((error) => {
      if (error) return next(error)
      return res.status(200).send('save success')
    })
  })
}

module.exports.getactions = (req, res, next) => {
  const apkId = req.params.id
  const actName = req.params.actpath.trim()

  ApkModel.findOne({ _id: apkId }).exec((err, apk) => {
    if (err) return next(err)

    const actPath = _.find(apk.actpaths, { activity: actName })
    if (actPath) {
      const actions = actPath.actions.join('\n') || ''
      return res.status(200).json(actions)
    }
    return res.status(404).send('no action path')
  })
}


module.exports.testcases = (req, res, next) => {
  const apkId = req.params.id

  TestcaseModel.find({ apk_id: apkId, type: 'complete', isFinish: true })
  .exec((err, testcases) => {
    if (err) return next(err)

    return res.status(200).json(testcases)
  })
}

module.exports.actpath = (req, res, next) => {
  const packageName = req.params.package
  const activityName = req.body.activity_name
  let actions = req.body.actions

  if (!activityName || ! actions) {
    return res.status(422).send('error')
  }

  actions = actions.trim().split('\n')

  ApkModel.findOne({ package_name: packageName }).exec((err, apk) => {
    const actPaths = apk.actpaths
    const actPath = _.find(actPaths, { activity: activityName })
    if (!actPath) {
      const newActPath = {
        activity: activityName,
        actions,
      }
      apk.actpaths.push(newActPath)
      apk.save((error) => {
        if (error) return next(error)
        return res.status(200).send('insert success')
      })
    } else if (actPath.actions.length > actions.length) {
      actPath.actions = actions
      apk.save((error) => {
        if (error) return next(error)
        return res.status(200).send('update shorter')
      })
    } else {
      res.status(200).send('not change')
    }
  })
}


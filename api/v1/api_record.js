var RecordModel = require('../../models/model_record.js');
var TestcaseModel = require('../../models/model_testcase.js');
var eventproxy = require('eventproxy');
var _ = require('lodash');

module.exports.create = function (req, res, next) {
  var ep = new eventproxy();
  ep.fail(next);

  var record = new RecordModel();
  record.device_id = req.body.device_id;
  record.apk_id = req.body.apk_id;
  record.action_count = req.body.action_count;
  record.algorithm = req.body.algorithm;
  record.status = "ready";
  var testcase_id = req.body.setup;
  console.log("testcase: " + testcase_id);

  ep.on('setup', function () {
    console.log("setup ");
    record.save(function (err, record) {
      if (err) {
        return next(err);
      } else {
        res.status(200).json(record);
      }
    });
  })


  if (testcase_id) {
    TestcaseModel.findOne({_id: testcase_id}).exec(ep.done(function (testcase) {
      for (var i = 0; i < testcase.actions.length; i++) {
        record.setup.push(testcase.actions[i]);
      }
      ep.emit('setup');
    }));
  } else {
    ep.emit('setup');
  }


};

module.exports.remove = function (req, res, next) {
  var record_id = req.params.id;
  RecordModel.findOneAndRemove({
    _id: record_id
  }, function (err, record) {
    if (err || !record) {
      return res.status(500).json();
    }
    res.status(200).json(record);
  });
};

module.exports.start = function (req, res, next) {
  var record_id = req.params.id;
  var ep = new eventproxy();
  ep.fail(next);

  ep.once('record', function (record) {
    record.status = "running";
    record.save(ep.done('status'))
  })

  ep.once('status', function (record) {

  })

  RecordModel.findOne({_id: record_id}).exec(ep.done('record'))
}

module.exports.cancel = function (req, res, next) {
  var record_id = req.params.id;
  RecordModel.findOne({
    _id: record_id
  }, function (err, record) {
    if (err || !record) {
      return res.status(500).json();
    }

    record.status = "failure";
    record.save(function (err) {
      if (err) return next(err);
      res.status(200).send("success");
    });
  });
};

module.exports.finish = function (req, res, next) {
  var record_id = req.params.id;
  RecordModel.findOne({
    _id: record_id
  }, function (err, record) {
    if (err || !record) {
      return res.status(500).json();
    }

    record.status = "success";
    record.save(function (err) {
      if (err) return next(err);
      res.status(200).send("success");
    });
  });
};

module.exports.getSummary = function (req, res, next) {
  var record_id = req.params.id;

  RecordModel.findOne({_id: record_id}, function (err, record) {
    if (err) {
      return next(err);
    }
    var result = {};
    result.xData = _.map(record.summaries, function (summary) {
      return summary.action;
    });
    result.yDataWidget = _.map(record.summaries, function (summary) {
      return summary.widget;
    });
    result.yDataActivity = _.map(record.summaries, function (summary) {
      return summary.activity;
    });

    //console.log(record.summaries);
    res.status(200).json(result);
  });
}

module.exports.summary = function (req, res, next) {
  var record_id = req.params.id;
  var action = parseInt(req.body.action, 10);
  var widget = parseInt(req.body.widget, 10);
  var state = parseInt(req.body.state, 10);
  var activity = parseInt(req.body.activity, 10);
  var data = {
    widget: widget,
    action: action,
    activity: activity,
    state: state
  };

  // io.sockets.emit("summary", data);

  RecordModel.findOne({
    _id: record_id
  }, function (err, record) {
    if (err || !record) {
      return res.status(500).json();
    }

    record.summaries.push(data);
    record.save(function (err) {
      if (err) return next(err);
      res.status(200).send("success");
    });
  });
}

module.exports.activity = function (req, res, next) {
  var record_id = req.params.id;
  var activity = req.body.message;

  // io.sockets.emit("activity", activity);

  RecordModel.findOne({
    _id: record_id
  }, function (err, record) {
    if (err || !record) {
      return res.status(500).json();
    }

    record.activities.push(activity);
    record.save(function (err) {
      if (err) return next(err);
      res.status(200).send("success");
    });
  });
};

module.exports.widget = function (req, res, next) {
  var record_id = req.params.id;
  var widget = req.body.message;

  // io.sockets.emit("widget", widget);

  RecordModel.findOne({
    _id: record_id
  }, function (err, record) {
    if (err || !record) {
      return res.status(500).json();
    }

    record.widgets.push(widget);
    record.save(function (err) {
      if (err) return next(err);
      res.status(200).send("success");
    });
  });
};

module.exports.action = function (req, res, next) {
  var record_id = req.params.id;
  var action = req.body.message;
  // io.sockets.emit("action", action);

  RecordModel.findOne({
    _id: record_id
  }, function (err, record) {
    if (err || !record) {
      return res.status(500).json();
    }

    record.actions.push(action);
    record.save(function (err) {
      if (err) return next(err);
      res.status(200).send("success");
    });
  });
};

module.exports.state = function (req, res, next) {
  var record_id = req.params.id;
  var state = req.body.message;

  RecordModel.findOne({
    _id: record_id
  }, function (err, record) {
    if (err || !record) {
      return res.status(500).json();
    }

    record.states.push(state);
    record.save(function (err) {
      if (err) return next(err);
      res.status(200).send("success");
    });
  });
};


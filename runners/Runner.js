var dfsRunner = require('nata-dfs');

process.on('message', function (m) {
  if (m.type === 'start') {
    console.log('get start command');
    new dfsRunner(m.device_id, null, m.pkg, m.act).play()
    .then(function () {
      process.send(
        {type: 'success', device_id: m.device_id}
      );
    })
    .catch(function(err){
      console.log(err);
      process.send({type: 'failure',device_id: m.device_id});
    })


  } else if (m.type === 'stop') {
    console.log('get stop command');
  }
});

//process.send({ Hello: 'conan'});

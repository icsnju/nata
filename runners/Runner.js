'use strict'
const DfsRunner = require('nata-dfs')

process.on('message', (m) => {
  if (m.type === 'start') {
    console.log('get start command')
    new DfsRunner(m.device_id, null, m.pkg, m.act).play()
    .then(() => {
      process.send(
        { type: 'success', device_id: m.device_id }
      )
    })
    .catch((err) => {
      console.log(err)
      process.send({ type: 'failure', device_id: m.device_id })
    })
  } else if (m.type === 'stop') {
    console.log('get stop command')
  }
})

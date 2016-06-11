'use strict'
const DfsRunner = require('nata-dfs')

const map = new Map()

process.on('message', (m) => {
  if (m.type === 'start') {
    const runner = new DfsRunner(m.device_id, null, m.pkg, m.act)
    map.set(m.device_id, runner)
    // track summary
    const result = runner.result
    result.on('summary', (summary) => {
      process.send(
        { type: 'summary', record_id: m.record_id, summary }
      )
    })

    runner.play().then(() => {
      process.send(
        { type: 'success', device_id: m.device_id }
      )
    }).catch((err) => {
      console.log(err)
      process.send({ type: 'failure', device_id: m.device_id })
    })
  } else if (m.type === 'stop') {
    map.get(m.device_id).stop()
    map.delete(m.device_id)
  }
})

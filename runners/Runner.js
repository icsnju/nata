'use strict'
const DfsRunner = require('nata-dfs')

const map = new Map()

process.on('message', (m) => {
  if (m.type === 'start') {
    console.log(m.setup)
    const runner = new DfsRunner(m.device_id, m.pkg, m.act, {
      setup: m.setup,
      action_count: m.action_count,
    })
    map.set(m.device_id, runner)
    // track summary
    const result = runner.result
    result.on('summary', (summary) => {
      process.send(
        { type: 'summary', record_id: m.record_id, summary }
      )
    })

    result.on('activity', (activity) => {
      process.send(
        { type: 'log', record_id: m.record_id, log: `new activity: ${activity}` }
      )
    })

    result.on('action', (action) => {
      process.send(
        { type: 'log', record_id: m.record_id, log: `action: ${action}` }
      )
    })

    runner.play().then(() => {
      process.send(
        { type: 'success', device_id: m.device_id, record_id: m.record_id}
      )
    }).catch((err) => {
      console.log(err)
      process.send({ type: 'failure', device_id: m.device_id,record_id: m.record_id })
    })
  } else if (m.type === 'stop') {
    const device = map.get(m.device_id)
    if (device) {
      device.stop()
      map.delete(m.device_id)
    }
  }
})

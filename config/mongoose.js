'use strict'
const config = require('./config')
const mongoose = require('mongoose')

module.exports = () => {
  const db = mongoose.connect(config.db, (err) => {
    if (err) {
      console.log('connection error', err)
    } else {
      console.log(`connection successful : ${config.db}`)
    }
  })
  return db
}
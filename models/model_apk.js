'use strict'
const mongoose = require('mongoose')

const ActPathSchema = new mongoose.Schema({
  activity: {
    type: String,
    unique: true,
    trim: true,
  },
  actions: [String],
}, { id: false })


const ApkSchema = new mongoose.Schema({
  name: String,
  version: String,
  package_name: {
    type: String,
    unique: true,
    trim: true,
  },
  actpaths: [ActPathSchema],
  activity_name: String,
  blacklist: [String],
  create_at: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Apk', ApkSchema)

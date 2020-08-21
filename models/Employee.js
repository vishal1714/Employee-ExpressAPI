const mongoose = require('mongoose');
const uuid = require('uuid');
const moment = require('moment-timezone');
const autoIncrement = require('mongoose-auto-increment');
const ConnectDB = require('../config/db');

autoIncrement.initialize(ConnectDB);

const EmployeeSchema = new mongoose.Schema({
  Name: {
    type: String,
    trim: true,
    required: [true, 'Please Enter Name'],
  },
  DOB: {
    type: String,
    trim: true,
    required: [true, 'Please Enter Date Of Birth'],
  },
  Age: {
    type: Number,
    required: [true, 'Please Enter Employee Age'],
  },
  Department: {
    type: String,
    trim: true,
    required: [true, 'Please Enter Department Name'],
  },
  Salary: {
    type: Number,
    required: [true, 'Please Enter Employee Salary PA'],
  },
  CreatedAt: {
    type: String,
    default: function() { return moment().tz('Asia/Kolkata').format("MMMM Do YYYY, hh:mm:ss A")},
  },
  __v: { type: Number, versionKey: false },
});


EmployeeSchema.plugin(autoIncrement.plugin, 'Employee');

module.exports = mongoose.model('Employee', EmployeeSchema);

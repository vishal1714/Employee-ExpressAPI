var fs = require('fs');
const moment = require('moment');
const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env' });
const EmployeeAPILog = require('../models/APILogSchema');
const { SendMQ } = require('./APIMQ');

// ! Log Add Delete Update Employee Requests and Response
const Log = (req, Response, IP, reqKey, reqmethod, key) => {
  if (process.env.LOG_MODE != 'OFF') {
    try {
      var LogDate = moment()
        .tz('Asia/Kolkata')
        .format('MMMM Do YYYY, hh:mm:ss A');
      var FileDate = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
      const ReqResLogLocal = {
        ReqBody: req,
        ResBody: Response,
        Method: reqmethod,
        APIClientID: reqKey,
        ClientIP: IP,
        LoggedAt: LogDate,
      };

      if (process.env.LOG_MODE == 'Cloud' || process.env.LOG_MODE == 'ALL') {
        const ReqResLogCloud = {
          ReqBody: req,
          EncKey: key,
          ResBody: Response,
          Method: reqmethod,
          APIClientID: reqKey,
          ClientIP: IP,
          LoggedAt: LogDate,
        };
        // ? Log API request in MongoDB Database -> apilogs
        //EmployeeAPILog.create(ReqResLogCloud);
        SendMQ('APILog', ReqResLogCloud);
      }

      if (process.env.LOG_MODE == 'Internal' || process.env.LOG_MODE == 'ALL') {
        //console.log(ReqRes);
        var LogedinDB = JSON.stringify(ReqResLogLocal);
        //console.log('Log' + LogedinDB);
        var LogData = '|' + LogDate + '|' + LogedinDB;

        let filename = process.env.LOG_FILE + '-' + FileDate + '.log';

        fs.appendFile(filename, LogData + '\n', function (err) {
          if (err) throw err;
        });
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    //Pass
  }
};

// ! Create Log Dir if it is not exist
function CreatePath(filePath) {
  if (fs.existsSync(filePath)) {
  } else {
    fs.mkdirSync(filePath);
  }
}

module.exports = { Log, CreatePath };

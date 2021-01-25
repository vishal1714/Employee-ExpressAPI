const APILog = require('../models/APILogSchema');
const APIUser = require('../models/APIUserSchema');
const moment = require('moment-timezone');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env' });

const AdminAPIKey = process.env.AdminAPIKey;

var Hash = (string) => {
  return crypto.createHash(process.env.HashAlgo).update(string).digest('hex');
}

//@dec      Get API Logs
//@route    /apiadmin/log
//@access   Private (Admin Only with API-KEY)
exports.GetAPIlog = async (req, res, next) => {
  try {
    const getapilog = await APILog.find().select('-__v');
    //Send Success Response
    res.status(200).json({
      Status: 'Success',
      Count: getapilog.length,
      Log: getapilog,
    });
  } catch (err) {
    console.log(err);
    //Send Error
    res.status(500).json({
      Error: {
        message: 'Internal Server Error',
        info: err,
      },
    });
  }
};

//@dec      Add API Client with Key
//@route    POST /APIUser/createKey
//@access   Private (Admin Only with API-KEY)
exports.AddUser = async (req, res) => {
  var reqKey = req.header('API-Admin-Key');
  var IP = req.header('X-Real-IP');

  if (reqKey == AdminAPIKey) {
    try {
      const { Username, Email, Password } = req.body;
      const adduserreq =  {
        Username : Hash(Username),
        Email : Hash(Email),
        Password : Hash(Password)
      }
      const addUser = await APIUser.create(adduserreq);
      res.status(200).json({
        Status: 'Successful',
        Data: addUser,
        Message: 'API user has been created',
      });
    } catch (err) {
      //console.log(err);
      res.status(500).json({
        Error: {
          message: 'Internal Server Error',
          info: err.message,
        },
      });
    }
  } else {
    //if API-Key is not valid
    res.status(401).json({
      Error: {
        message: 'Unauthorized ( Who are you Dude ?)',
      },
    });
  }
};

//@dec      Update API Client with Key
//@route    POST /APIUser/updateUserKey
//@access   Private (Admin Only with API-KEY)
exports.UpdateUser = async (req, res) => {
  var date = moment().tz('Asia/Kolkata').format('MMMM Do YYYY, hh:mm:ss A');
  var reqKey = req.header('API-Admin-Key');

  if (reqKey == AdminAPIKey) {
    
      if (req.body.Username == null) {
        //Send Error
        const Response = {
          Error: {
            message: 'UserName not present in request body',
          },
        };
        //Send Response
        res.status(400).json(Response);
      }

      const APIClientInfo = await APIUser.findOne({
        Username: Hash(req.body.Username),
        Password: Hash(req.body.Password),
      });
      if(APIClientInfo) {
      try {
      //Update Key Info
      const PasswordHash = Hash(req.body.Password);
      const updateKey = await APIUser.updateOne(
        { Username: req.body.Username, Password: PasswordHash },
        {
          $set: {
            APIClientID: req.body.APIClientID,
            APISecretKey: req.body.APISecretKey,
            ModifiedAt: date,
          },
        }
      ).select('-__v');
      //console.log(updateKey)
        const Response = {
          Status: 'Success',
          Data: req.body,
          Message: 'Successfully! Key has been updated.',
        };
        res.status(200).json(Response);
      }
     catch (err) {
      var Response = {
        Error: {
          message: 'Internal Server Error',
          info: err,
        },
      };
      res.status(500).json(Response);
    }
  }
    else {
      const Responsefailed = {
        Status: 'Failed',
        Message: 'Username or Password is not Valid!.',
      };
      res.status(400).json(Responsefailed);
    }
  } else {
    //if API-Key is not valid
    res.status(401).json({
      Error: {
        message: 'Unauthorized',
      },
    });
  }
};

//@dec      Get API Client Status
//@route    /apiadmin/apiStatus
//@access   Public
exports.UserStatus = async (req, res, next) => {
  try {
    const {Username , Password} = req.body;
    if (Username != undefined && Password != undefined) {
      const APIClientResponse = await APIUser.findOne({
        Username: Hash(Username),
        Password: Hash(Password),
      }).select('-Username').select('-Password');
      if (APIClientResponse == null) {
        const Response = {
          Error: {
            message: 'User Credentials are Incorrect or Not Found',
          }
        }
        res.status(404).json(Response);
      } else {
        const Response = {
          APIStatus : APIClientResponse
        }
        res.status(200).json(Response);
      }

    } else {
      res.status(400).json({
        Error: {
          message: 'Username or Password is missing',
        },
      })
    }
  } catch (err) {
    console.log(err);
    //Send Error
    res.status(500).json({
      Error: {
        message: 'Internal Server Error',
        info: err,
      },
    });
  }
};
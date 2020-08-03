const express = require('express');
const {
  AddEmployee,
  GetEmployeeByID,
  GetEmployees,
  UpdateEmployee,
  DelEmployeeByID,
} = require('../controllers/EmpFunctions');
const {
  GetRenderEmployees,
  AddRenderEmployee,
  UpdateRenderEmployee,
} = require('../controllers/EmpRenderFunctions');

const Employee = require('../models/Employee');

const route = express.Router();

route
  .route('/')
  .get(GetRenderEmployees)
  .post(AddRenderEmployee)
  .patch(UpdateRenderEmployee);

route
  .route('/api/employee')
  .get(GetEmployees)
  .post(AddEmployee)
  .patch(UpdateEmployee);

route.route('/:id').get(GetEmployeeByID).delete(DelEmployeeByID);

module.exports = route;

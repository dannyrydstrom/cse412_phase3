'use strict';

let app = require('../app');
let express = require('express');
let mysql_tool = require('../bin/mysql_tool');
let aes_tool = require('../bin/aes_tool');
let bcrypt = require('bcrypt-nodejs');
let redis_tool = require('../bin/redis_tool');
let session_tool = require('../bin/session_tool');
let validator_tool = require('../bin/validator_tool');
let checkInput = validator_tool.checkInput;

let router = express.Router();

// Website start point
router.get('/', function(req, res) {
  if (req.session.userID) {
    res.redirect('/calendar');
  }
  else res.render('login');
});

// Authorize login
router.post('/auth', function(req, res) {
  // get userID and pass from request
  let  givenUID = req.body.username;
  let  givenPass = req.body.password;
  //let encrpyt_pass = aes_tool.encrypt(givenPass);

  // format query to prevent sql injection
  let querystr = "SELECT ?? " +
    "FROM ?? " +
    "WHERE ?? = ? " +
    "AND ?? = ?";
  let sql = mysql_tool.format(querystr, ['userID', 'user','userID', 
    givenUID, 'password', givenPass]);

  // run query to get user from user table
  mysql_tool.query( sql,
    function(response) {
      if (response) {
          let SQLuser = response.rows[0]["userID"];
          req.session.userID = SQLuser;
          res.redirect('/calendar');
        }
        else {
          res.redirect('/?error=1');
        }
    });
});

// Logout
router.get('/logout',function(req,res){
    if(req.session.userID) {
    req.session.destroy(function(){
      res.redirect('/');
    });
    } else {
        res.redirect('/');
    }
});

// Register POST request
router.post('/register', function(req, res) {
  // get userID and pass from request
  let  givenUID = req.body.username;
  let  givenPass = req.body.password;
  //let encrpyt_pass = aes_tool.encrypt(givenPass);

  // format query to prevent sql injection
  let querystr = "START TRANSACTION; " +
                  "INSERT INTO user (userID, password) " +
                    "VALUES (?, ?); " +
                  "INSERT INTO partof(userID, groupID) " +
                    "SELECT ?, groupID " +
                    "FROM groups " +
                    "WHERE groupID IN ( " +
		                  "SELECT groupID " +
		                  "FROM groups " +
		                  "WHERE isDefault = 1 ); " +
                  "COMMIT;"
  let sql = mysql_tool.format(querystr, [givenUID, givenPass, givenUID]);

  // run query to get user from user table
  mysql_tool.query( sql,
    function(response) {
      if (response && response.rows) {
          let SQLuser = response.rows[0]["userID"];
          req.session.userID = SQLuser;
          res.redirect('/calendar');
      }
      else if (response && response.error) {
          if(response.error.code == "ER_DUP_ENTRY")
            res.redirect('/?error=2');
          else res.redirect('/?error=3');          
      }
      else res.redirect('/?error=3');
    });
});

module.exports = router;

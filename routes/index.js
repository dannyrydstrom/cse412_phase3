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
    res.redirect('/calendars');
  }
  else res.render('login');
});

router.get('/groups', function(req, res) {
  if (req.session.userID) {
    let querystr = 
        "SELECT ??, COUNT(??) AS numberofusers " +
        "FROM ?? " +
        "WHERE EXISTS (SELECT ?? " +	
        "FROM ?? " +
        "WHERE ?? = ? " +
        "AND ?? = ??) " +
        "GROUP BY ??";
    
        let sql = mysql_tool.format(querystr, 
        ['partof.groupID', 'partof.userID', 
        'partof', 
        'managesgroup.groupID', 
        'managesgroup', 
        'managesgroup.userID', req.session.userID, 
        'managesgroup.groupID','partof.groupID',
        'partof.groupID'
        ]);


        mysql_tool.query( sql, function(response) {
            console.log(response.rows);

            let groupsRes = {};
            if(response.rows) groupsRes = response.rows;
            res.render('groups',{
                groups : groupsRes
            })
        });
  }
  else res.render('login');
});

// List of all User Calendars
router.get('/calendars', function(req, res){
   if(req.session.userID){

       // format query to prevent sql injection
       let querystr = "SELECT ??, ?? " +
           "FROM ??, ?? " +
           "WHERE ?? = ?? " +
           "AND ?? = ? ";

       let sql = mysql_tool.format(querystr, [
           'calendar.calID', 'calendar.name','calendar', 'managescal', 'managescal.calID', 'calendar.calID', 'managescal.userID', req.session.userID,
       ]);

       // run query to get all managed calendars for user
       mysql_tool.query( sql, function(response1) {
               //query to get group
               let querystr = "SELECT sg.groupID, cal.calID, cal.name " +
                        "FROM calendar cal, partof p, sharescalgroup sg, user u " +
                        "WHERE cal.calID = sg.calID " +
                        "AND sg.groupID = p.groupID " +
                        "AND u.userID = p.userID " +
                        "AND u.userID = ? " ;
                let sql = mysql_tool.format(querystr, [req.session.userID]);
                mysql_tool.query( sql, function(response2) {
                    // query to get shared
                    let querystr = "SELECT ??, ?? " +
                        "FROM ??, ?? " +
                        "WHERE ?? = ?? " +
                        "AND ?? = ? ";
                    let sql = mysql_tool.format(querystr, 
                        ['calendar.calID', 'calendar.name',
                        'calendar', 'sharescal', 
                        'sharescal.calID', 'calendar.calID', 
                        'sharescal.userID', req.session.userID]
                    );
                    mysql_tool.query( sql, function(response3) {
                        console.log(response3.error);
                        let calendars = {};
                        let shared = {};
                        let group = {};
                        if(response1.rows) calendars = response1.rows;
                        if(response2.rows) group = response2.rows;
                        if(response3.rows) shared = response3.rows;
                        
                        res.render('all-calendars',{
                            calendars: calendars,
                            groupcals: group,
                            sharedcals: shared
                        })
                        
                });
            });
       });
   } else res.render('login');
});

// Get all the events for a specific calendar
router.get('/calendar', function(req, res) {
  if (req.session.userID) {
      let calId = req.query.id;

      // format query to prevent sql injection
      let querystr = "SELECT e.EventID, e.Title, e.Location, e.Label, e.Description, es.FromDate, es.ToDate " +
          "FROM event e " +
          "JOIN containsevent ce ON e.EventID = ce.EventID " +
          "JOIN eventschedule es ON ce.EventID = es.EventID " +
          "WHERE ce.CalendarID = ?";

      let sql = mysql_tool.format(querystr, calId);

      // Get all events for a specific calendar
      mysql_tool.query( sql, function(response) {
              if (response) {
                  res.render('calendar', {
                      calendar: response.rows,
                      calID: calId
                  });
              }
              else{
                  console.log("No events for calendar");
                  res.render('calendar',{
                      calendar: [],
                      calID: calId
                  });
              }
          });
  } else res.render('login');
});

// Directs to the Create-Calendar template
router.get('/create-calendar', function(req, res){
    if(req.session.userID){
        res.render('create-calendar');
    } else res.render('login');
});

// Create a new Calendar for a user
router.post('/calendar/create', function(req, res){
    if(req.session.userID){
        console.log("Creating cal");
        let nextId = 0;
        let newId;
        mysql_tool.query('SELECT MAX(CONVERT(SUBSTRING(calID, 4), SIGNED INTEGER)) as next FROM calendar', function(response){
            if (response && response.error) {
                if(response.error.code == "ER_DUP_ENTRY") { res.redirect('/?error=2');}
                else res.redirect('/?error=3');
            } else if(!response) {res.redirect('/?error=3');}
            else { // Success
                // Create new ID
                nextId = response.rows[0].next + 1;
                newId = 'cal' + nextId;

                let querystr =
                    "INSERT INTO calendar(calID, name) " +
                    "VALUES (?, ?); " +
                    "INSERT INTO managesCal(userID, calID) " +
                    "VALUES(?, ?);";
                let sql = mysql_tool.format(querystr, [
                    newId, req.body.name,
                    req.session.userID, newId
                ]);

                // run query to Update Calendar and managesCal Table
                mysql_tool.query( sql, function(response) {
                        if (response) { res.redirect('/calendars'); }
                        else { res.redirect('/?error=1'); }
                });
            }
        });
    } else res.render('login');
});

// Directs to the create-event template
router.get('/create-event/:calId', function(req, res){
   if(req.session.userID){
       res.render('create-event', {
           calId: req.params.calId
       });
   } else res.render('login');
});

router.post('/event/create/:calId', function(req, res){
   if(req.session.userID){
       let calId = req.params.calId;
       let title = req.body.Title;
       let label = req.body.Label;
       let desc = req.body.Description;
       let location = req.body.Location;
       let from = req.body.FromDate;
       let to = req.body.ToDate;
       let nextId = 0;
       let newId;

       // Get the next ID
       mysql_tool.query('SELECT MAX(CONVERT(SUBSTRING(EventID, 6), SIGNED INTEGER)) as next FROM event', function(response) {
           if(!response || response.error) res.redirect('/?error=1');
           else{
               // Create new ID
               nextId = response.rows[0].next + 1;
               newId = 'event' + nextId;

               let querystr =
                   "INSERT INTO event(eventID, Description, Location, Title, Label) " +
                   "VALUES(?, ?, ?, ?, ?); " +
                   "INSERT INTO eventschedule(EventID, FromDate, ToDate) " +
                   "VALUES(?, ?, ?); " +
                   "INSERT INTO containsevent(EventID, CalendarID) " +
                   "VALUES(?, ?); " +
                   "INSERT INTO manageseve(userID, eventID) " +
                   "VALUES(?, ?);"

               let sql = mysql_tool.format(querystr, [
                   newId, desc, location, title, label,
                   newId, from, to,
                   newId, calId,
                   req.session.userID, newId
               ]);

               mysql_tool.query( sql, function(response) {
                   if(!response || response.error){
                       console.log('Error creating event');
                       res.redirect('/?error=1');
                   }else{
                       console.log('Event created for calendar: ' + calId);
                       res.redirect('/calendar?id=' + calId);
                   }
               });
           }
       });
   } else res.render('login');
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
      if (response.rows.length > 0) {
          let SQLuser = response.rows[0]["userID"];
          req.session.userID = SQLuser;
          res.redirect('/calendars');
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
          res.redirect('/calendars');
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

'use strict';

let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let mysql_tool = require('./bin/mysql_tool');
let redis_tool = require('./bin/redis_tool');
let session_tool = require('./bin/session_tool');

let index = require('./routes/index');

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('./public'));
app.use(express.static('./public/stylesheets'));
app.use(express.static('./public/images'));
app.use(express.static('./public/javascripts'));
app.use(session_tool);

app.use('/', index);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(function(req, res) {
  res.render('lost');
});

// Uncomment to host on port 3000
/*
app.listen(3000,function(){
    console.log("App Started on PORT 3000");
});
*/

module.exports = app;

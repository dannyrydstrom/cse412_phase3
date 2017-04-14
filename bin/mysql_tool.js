'use strict';

let mysql = require('mysql');
let db_config = require('./secret_settings').db_config;

let connection = new mysql.createConnection(db_config);
connection.connect();

console.log("connected to database");

    

let mysql_tool = {};

// takes the querystring, and then a callback function with 1 argument to 
// represent a dictionary with values error, rows, and info
// info contains information about the query
// error will be null unless there is an error
// rows contains is a dictionary where key is the column
mysql_tool.query = function(querystring, callback) {
  if(querystring && callback && (typeof(querystring) == 'string' ) && (typeof(callback) == 'function'))
  {
    connection.query(
      querystring,
      function (error, results, fields) {
        if (error) throw error;
        let result = {
          error: error,
          rows: results,
          info: fields
        }
        callback(result);
      }
    )
  }
  else {
    let result = {
          error: "Input not of type string",
          rows: null,
          info: null
    }
  }
};

module.exports = mysql_tool;

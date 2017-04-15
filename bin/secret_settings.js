'use strict';

let mysql_user;
let mysql_db;
let mysql_pass;
let mysql_host;
let mysql_port;
let mysql_ssl;

let aes_alg;
let aes_pass;

let sesh_name;
let sesh_secret;

let redis_port;
let redis_host;
let redis_password;


if (process.env.im_live) {
  console.log('loading prod settings..');
  mysql_user = process.env.mysql_user;
  mysql_db = process.env.mysql_db;
  mysql_pass = process.env.mysql_pass;
  mysql_host = process.env.mysql_host;
  mysql_port = process.env.mysql_port;
  aes_alg = process.env.aes_alg;
  aes_pass = process.env.aes_pass;
  sesh_name = process.env.sesh_name;
  sesh_secret = process.env.sesh_secret;
  mysql_ssl = process.env.mysql_ssl;
  redis_port = process.env.redis_port;
  redis_host = process.env.redis_host;
  redis_password = process.env.redis_password;
}
else {
  console.log('loading local settings..');
  let local_settings = require('./local_settings');
  mysql_user = local_settings.mysql_user;
  mysql_db = local_settings.mysql_db;
  mysql_pass = local_settings.mysql_pass;
  mysql_host = local_settings.mysql_host;
  mysql_port = local_settings.mysql_port;
  aes_alg = local_settings.aes_alg;
  aes_pass = local_settings.aes_pass;
  sesh_name = local_settings.sesh_name;
  sesh_secret = local_settings.sesh_secret;
  mysql_ssl = local_settings.mysql_ssl;
  redis_port = local_settings.redis_port;
  redis_host = local_settings.redis_host;
  redis_password = local_settings.redis_password;
}

let db_config = {
  user: mysql_user,
  database: mysql_db,
  password: mysql_pass,
  multipleStatements: true,
  host: mysql_host,
  port: mysql_port,
  max: 12,
  idleTimeoutMillis: 30000,
};

let aes_config = {
  algorithm: aes_alg,
  password: aes_pass
};

let session_config = {
  sesh_name: sesh_name,
  sesh_secret: sesh_secret
};

let api_settings = {
  //api keys and what not go here//s
};

let redis_config = {
  port: redis_port,
  host: redis_host,
  password: redis_password
};

let secret_settings = {
  db_config: db_config,
  aes_config: aes_config,
  session_config: session_config,
  mysql_ssl: mysql_ssl,
  api_settings: api_settings,
  redis_config: redis_config
};

module.exports = secret_settings;

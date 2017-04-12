'use strict';

// Replace the null values with real values and rename the file to 'local_settings.js' //
// NEVER commit the real settings file to Git. EVER. //

let local_settings = {
  pg_user: 'root',
  pg_db: 'cse412_phase3',
  pg_pass: '',
  pg_host: 'localhost', //localhost for local
  pg_port: 5432, //usually 5432 for local
  pg_ssl: false, //usually false for local and true for cloud
  aes_alg: 'aes-256-ctr', //there are others if you wanna Google the NodeJS crypto library
  aes_pass: 'null', //pick a really long and secure string
  sesh_name: 'calookie', //calendar cookie
  sesh_secret: 'null', //pick a really long and secure string
  redis_port: 6379, //usually 6379 for local
  redis_host: 'localhost', //localhost for local
  redis_password: null //usually null for local
};

module.exports = local_settings;

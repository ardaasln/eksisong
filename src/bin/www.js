#!/usr/bin/env node

/**
 * Module dependencies.
 */

import * as async from 'async';
import * as fs from 'fs';
import * as youtube from '../work/youtube.js';
import app from '../app.js';
import * as crawler from '../work/crawl.js';
let debug = require('debug')('eksisong:server');
let http = require('http');

/**
 * Get port from environment and store in Express.
 */

let port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

let server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * YouTube Auth & Crawling
 */

let clientSecrets = '';
async.series([
  function(callback) {
    fs.readFile('youtube_client.json', function processClientSecrets(err, content) {
      if (err) {
        console.log('Error loading client secret file: ' + err);
        return;
      }
      let parsedContent = JSON.parse(content);
      clientSecrets = parsedContent;
      youtube.authorize(parsedContent, callback);
    });
  },
  function(callback) {
    let url = 'https://eksisozluk.com/su-anda-calan-sarki--2405586';
    crawler.crawl(url, callback);
  },
]);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  let port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  let bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  let addr = server.address();
  let bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

export {clientSecrets};

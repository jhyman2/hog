/*
 * @license MIT
 * @file
 * @copyright KeyW Corporation 2016
 */


'use strict';

module.exports = function (io) {

  /*io.on('connection', function (socket) {

    socket.connectDate = new Date();
    socket.ip = (socket.handshake.address) ? socket.handshake.address : null;

    // sockets inserts

    socket.on('disconnect', function () {
      console.log('[%s] %s disconnected.', new Date().toUTCString(), socket.ip);
    });

    console.log('[%s] %s logged.', socket.connectDate.toUTCString(), socket.ip);

  });*/
    // nps inserts
  require('../api/pig/pig.socket.js').register(io);
  require('../api/settings/settings.socket.js').register(io);
};
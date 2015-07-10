module.exports = function(webServer, options) {
  "use strict";

  var
    WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({ server: webServer }),
    sqlite3 = require("sqlite3").verbose(),
    db = new sqlite3.Database(options.file);

  wss.on("connection", function(ws) {

    console.log("web sockets open");

    ws.on("error", function(data) {
      console.log("web sockets error");
    });

    ws.on("close", function(data) {
      console.log("web sockets closed");
    });

    ws.on("message", function(data) {
			
      db.serialize(function() {
        var
          message = JSON.parse(data),
          stmt;

          if (message.messageType === "log") {
          stmt = db.prepare("insert into eventlog (source, message, severity, created) values (?, ?, ?, ?)");
          stmt.run(message.messageData.source, message.messageData.message, message.messageData.severity, new Date(), function(err) {
            if (err) {
              console.log(err);
              ws.send(err);
            } else {
              console.log("log request processed");
              ws.send("log request processed");
            }
          });
          stmt.finalize();
        }
      });
			
    });

    // returns a function to close the database
    return function() {
      var deferred = q.defer();
      console.log("closing the database");
      db.close(function() {
        console.log("database closed");
        deferred.resolve();
      });
      return deferred.promise;
    };

  });

};

module.exports = function (webServerOptions, dbSqlLiteOptions) {
  "use strict";

  return {
    start: function () {

      var
      http = require("http"),
      express = require('express'),
      bodyParser = require('body-parser'),
      q = require("q"),
      restService = require("./restService.js"),
      webSockets = require("./webSockets.js"),
      app = express(),
      appStart = q.defer(),
      webServer, restServiceCloseDb, webSocketsCloseDb;

      setTimeout(function () {

        // initialize the express web server and set a static route
        app
        .use('/', express["static"](webServerOptions.rootFolder))
        .use(bodyParser.json());

        // if database options are set then add db config and routes
        if (dbSqlLiteOptions) {
          restServiceCloseDb = restService(app, dbSqlLiteOptions).configureRoutes();
        }

        // start listening...
        webServer = http.createServer(app);
        webServer.listen(webServerOptions.port, function () {

          // setup WebSocketServer
          webSocketsCloseDb = webSockets(webServer, dbSqlLiteOptions);

          var cleanUpExecuted = false;

          function cleanUp(fn) {

            var p;
            if (!cleanUpExecuted) {
              p = (fn instanceof Array) ? q.all(fn) : fn();
              p.then(function() {
                console.log("exiting...");
                process.exit();
              });
              cleanUpExecuted = true;
            }
          }

          //do something when app is closing
          process.on('exit', cleanUp.bind(null, [webSocketsCloseDb, restServiceCloseDb]));

          //catches ctrl+c event
          process.on('SIGINT', cleanUp.bind(null, [webSocketsCloseDb, restServiceCloseDb]));

          //catches uncaught exceptions
          process.on('uncaughtException', cleanUp.bind(null, [webSocketsCloseDb, restServiceCloseDb]));

          appStart.resolve();
        });


      }, 0);

      return appStart.promise;
    }
  };

};

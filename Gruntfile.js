module.exports = function (grunt) {
  "use strict";

  grunt.initConfig({
    webServer: {
      port: 8080,
      rootFolder: 'app/www'
    },
    dbSqlLite: {
      file: "data/lab.db"
    }
  });

  // register a task to run the express server
  grunt.registerTask('default', 'Start a web server', function () {

    var
      webServerOptions = grunt.config("webServer"),
      dbSqlLiteOptions = grunt.config("dbSqlLite"),
      webServer = require("./app/webServer");

      // tells the task this will run async otherwise the task will
      // end the web server when it completes this method
      this.async();

    webServer(webServerOptions, dbSqlLiteOptions)
      .start()
      .then(function () {
        grunt.log.writeln("Started connect web server on port " + webServerOptions.port);
        grunt.log.writeln("ctrl+c to exit");
      })
      .catch(function (err) {
        grunt.log.error(err.message || err);
      });

  });

};

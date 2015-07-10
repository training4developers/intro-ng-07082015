module.exports = function(app, options) {

  var
    myApp = app,
    myOptions = options,
    fs = require("fs"),
    sqlite3 = require("sqlite3").verbose(),
    q = require("q"), db,
    dbExists = fs.existsSync(myOptions.file);

  // create and initialize the database if it does not exist
  if(!dbExists) {

    console.log("Creating database file: " + myOptions.file);
    fs.openSync(myOptions.file, "w");

    db = new sqlite3.Database(myOptions.file);
    db.serialize(function() {

      console.log("Creating tables.");
      db.run("create table widgets (id integer primary key, name text not null, description text, color text, size text, quantity int not null)");
      db.run("create table eventlog (id integer primary key, source text not null, message text not null, severity int not null, created datetime not null)");

      console.log("Creating sample data.");
      db.run("insert into widgets (name, description, color, size, quantity) values ('Red small gear', 'A red gear that is small.', 'red', 'small', 100)");
      db.run("insert into widgets (name, description, color, size, quantity) values ('Green large gear', 'A green gear that is large.', 'green', 'large', 10)");
      db.run("insert into widgets (name, description, color, size, quantity) values ('Blue tiny gear', 'A blue gear that is tiny.', 'blue', 'tiny', 45)");
      db.run("insert into widgets (name, description, color, size, quantity) values ('Saffron medium gear', 'An saffron gear that is medium.', 'saffron', 'medium', 23)");
    });
  } else {
    db = new sqlite3.Database(myOptions.file);
  }

  return {
    configureRoutes: function() {

      // updates an existing record
      myApp.put('/svc/widgets/:widgetId', function(req, res) {

        var
          widget = req.body,
          stmt = db.prepare("update widgets set name = ?, description = ?, color = ?, size = ?, quantity = ? where id = ?");

        stmt.run(widget.name, widget.description, widget.color, widget.size, widget.quantity, req.params.widgetId, function(err) {
          if (err) {
            res.json(err);
          } else {
            res.json({ widgets_updated: this.changes });
          }
        });

        stmt.finalize();

      });

      // inserts a new record
      myApp.post('/svc/widgets', function(req, res) {

        var
          widget = req.body,
          stmt = db.prepare("insert into widgets (name, description, color, size, quantity) values (?, ?, ?, ?, ?)");

        stmt.run(widget.name, widget.description, widget.color, widget.size, widget.quantity, function(err) {
          if (err) {
            res.json(err);
          } else {
            res.json({ widget_id: this.lastID});
          }
        });

        stmt.finalize();

      });

      // deletes an existing record with the specified post id
      myApp["delete"]('/svc/widgets/:widgetId', function(req, res) {

        var stmt = db.prepare("delete from widgets where id = ?");

        stmt.run(req.params.widgetId, function(err) {
          if (err) {
            res.json(err);
          } else {
            res.json({ widgets_deleted: this.changes });
          }
        });

        stmt.finalize();

      });

      // gets all records
      myApp.get('/svc/widgets', function(req, res) {

        db.all("select * from widgets", function(err, widgets) {
          if (err) {
            res.json(err);
          } else {
            res.json(widgets);
          }
        });

      });

      // gets a record by id
      myApp.get('/svc/widgets/:widgetId', function(req, res) {

        db.get("select * from widgets where id = ?", [req.params.widgetId], function(err, widget) {
          if (err) {
            res.json(err);
          } else {
            res.json(widget);
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
    }
  };
};

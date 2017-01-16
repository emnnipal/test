var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var moment = require('moment-timezone');
var index = require('./routes/index');
var users = require('./routes/users');
var addnew = require('./routes/addnew');

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;

var app = express();
var db;

var mdbUrl = "mongodb://mod2:rudeemman@ds161048.mlab.com:61048/student"
MongoClient.connect(mdbUrl, function(err, database) {

    if (err) {
        console.log(err)
        return;
    }

    console.log("Connected to DB!");

    // set database
    db = database;

    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');

    // uncomment after placing your favicon in /public
    //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));

    app.use('/', index);
    app.use('/addnew', addnew);
    app.get('/departments/addnew', function(req, res) {
        var departmentCollection = db.collection('module3');
        departmentCollection.find().toArray(function(err, data) {
           console.log('data loaded', data);
          res.render('addnew', {
            addnew:data
          });
        })
    });


    app.get('/departments', function(req, res) {
        var departmentCollection = db.collection('module3');
        departmentCollection.find().toArray(function(err, data) {
           console.log('data loaded', data);
          res.render('departments', {
            departments:data
          });
        })

    });

    app.post('/departments/addnew', function(req, res) {
        console.log(req.body);
        var dataToSave = {
            dep_name: req.body.dep_name,
            abbrv: req.body.abbrv,
            head: req.body.head,
            website: req.body.website,
            contact: req.body.contact,
            createdate: moment().tz("Asia/Manila").format('LLL'),
            fb:req.body.fb,
            tw:req.body.tw,
            //socialpages:[{pagename:req.body.pagename}],

        };
        db.collection('module3')
          .save(dataToSave, function(err, student){
            if (err) {
                console.log('Saving Data Failed!');
                return;
            }
            console.log("Saving Data Successful!");
            res.redirect('/departments');
        })
    });

    app.get('/departmentdata/:departmentId', function(req, res) {
        var departmentId = req.params.departmentId;
        var departmentCollection = db.collection('module3');
        departmentCollection.findOne({ _id: new ObjectId(departmentId) }, function(err, data) {
            res.render('departmentdata', {
                departmentdata: data
            });
        });	
    });
    
    app.get('/departmentdata/:departmentId/update', function(req, res) { 
        //res.render('edit', {studentId:req.params.studentId})
     	var departmentId = req.params.departmentId;
        var departmentCollection = db.collection('module3');
        departmentCollection.findOne({ _id: new ObjectId(departmentId)}, function(err, data) {
            console.log('data loaded', data);
            res.render('update', {
                update: data
            });
        });
    });

    app.post('/departmentdata/:departmentId/update', function(req, res) {
        var departmentId = req.params.departmentId;
        var departmentCollection = db.collection('module3');
        var dataupdate={
			dep_name: req.body.dep_name,
            abbrv: req.body.abbrv,
            head: req.body.head,
            website: req.body.website,
            contact: req.body.contact,
            updatedate: moment().tz("Asia/Manila").format('LLL'),
            fb:req.body.fb,
            tw:req.body.tw,
        };
        departmentCollection.updateOne({ _id: new ObjectId(departmentId)},{$set: dataupdate}, function(err, data) {
            if(err){
			return console.log(err)
			}
			console.log("Updating Data Successful!");
            res.redirect('/departmentdata/'+departmentId)
			
        });
    });

    app.get('/departmentdata/:departmentId/delete', function(req, res) {
        var departmentId = req.params.departmentId;
        var departmentCollection = db.collection('module3');
        departmentCollection.deleteOne({ _id: new ObjectId(departmentId)}, function(err, data) {
            if(err){
            return console.log(err)
            }
            console.log("Deleting Data Successful!");
            res.redirect('/departments/')

        });
    });

    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
      var err = new Error('Not Found');
      err.status = 404;
      next(err);
    });

    // error handler
    app.use(function(err, req, res, next) {
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};

      // render the error page
      res.status(err.status || 500);
      res.render('error');
    });
});





module.exports = app;

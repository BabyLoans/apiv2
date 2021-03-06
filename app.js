var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var jwt = require('jsonwebtoken');
require('dotenv').config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: 5432,
  ssl: true
})

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('superSecret', process.env.SECRET_JWT);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

var myRouter = express.Router(); 
app.use(myRouter); 

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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


/**
 * Route : Get all tokens infos 
 */
myRouter.route('/rate/tokens').get(function(req, res){ 
  res.set('Access-Control-Allow-Origin', '*');

  pool.query('SELECT * FROM token INNER JOIN rate ON token.id = rate.token_id', (error, results) => {
    if (error) {
      response.status(400).json("error")
    }
    response.status(200).json(results.rows)
  })
});


// /**
//  * Route : database test
//  */
// myRouter.route('/db_test').get(function(req,res){

//   db.one("SELECT pg_is_in_recovery()")
//     .then(function (data) {

//       return res.status(200).json({
//         success: true,
//         results: data
//       });

//     })
//     .catch(function (error) {

//         return res.status(200).json({
//           success: false,
//           message: error
//         });

//     });

// });


/**
 * Route : connexion de l'utilisateur
 */
myRouter.route('/login').get(function(req, res){

    // obtention du token
    var token = getTokenJWT();

    // return the information including token as JSON
    return res.status(200).json({
      success: true,
      message: 'Connexion r??ussie',
      token: token,
      session_id : req.sessionID
    });

});


/**
 * Validation du token
 */
 function validJWT(token){

  var allowed = false;

  if(token){

    jwt.verify(token, app.get('superSecret'), function(err, decoded) {    
      allowed = err ? false : true;
    });
      
  }else{
    allowed = false;
  }
  return allowed;

}



/**
 * Cr??ation du token
 */
 function getTokenJWT() {

  var token = jwt.sign({
    exp: Math.floor(Date.now() / 1000) + (60 * 60),
    data: 'foobar'
  }, app.get('superSecret'));

  return token;

}

module.exports = app;
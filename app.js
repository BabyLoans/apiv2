var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');


// /**
//  * Connexion à la base de données
//  */
// var connection = mysql.createConnection({
//   host     : `${process.env.DB_HOST}`,
//   user     : `${process.env.DB_USER}`,
//   password : `${process.env.DB_PASSWORD}`,
//   database : `${process.env.DB_DATABASE}`
// });
// connection.connect();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('superSecret', `${process.env.SECRET_JWT}`);

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
 * Route : bonjour
 */
 myRouter.route('/hello').get(function(req,res){ 
  
  var token = req.query.token;
  var allowed = validJWT(token);

  if(allowed){

    res.status(200).json({
      message : "Hello world !"
    });

  } else {

    return res.status(401).json({ success: false, message: 'Echec de l\'authentification avec jeton !' }).end();   
        
  }
});



/**
 * Route : connexion de l'utilisateur
 */
myRouter.route('/login').get(function(req, res){

    // obtention du token
    var token = getTokenJWT();

    // return the information including token as JSON
    return res.status(200).json({
      success: true,
      message: 'Connexion réussie',
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
 * Création du token
 */
 function getTokenJWT() {

  var token = jwt.sign({
    exp: Math.floor(Date.now() / 1000) + (60 * 60),
    data: 'foobar'
  }, app.get('superSecret'));

  return token;

}

module.exports = app;
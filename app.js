var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var lessMiddleware = require('less-middleware');
var morgan = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

const { createLogger, transports, format } = require('winston');
const Postgres = require('@markjackson02/winston-pg-native');
const options = {
  connectionString: 'postgresql://david:David123@localhost:6016/KZDev02',
  level: 'debug',
  json:true,
  format: format.json(),
  poolConfig: {
    // number of milliseconds to wait before timing out when connecting a new client
    // by default this is 0 which means no timeout
    connectionTimeoutMillis: 0,
    // number of milliseconds a client must sit idle in the pool and not be checked out
    // before it is disconnected from the backend and discarded
    // default is 10000 (10 seconds) - set to 0 to disable auto-disconnection of idle clients
    idleTimeoutMillis: 10000,
    // maximum number of clients the pool should contain
    // by default this is set to 10.
    max: 10
  },
  tableName: 'winston_logs'
};


const logger = createLogger({
  transports: [
        new transports.Console({
          level: "debug",
          handleExceptions: true,
          format: format.json(),
          json: true,
          colorize: true,
          PrettyPrint: true
        }),
    new Postgres(options)
  ]
});
logger.stream = {
  write: function(message, encoding){
    logger.info(message);
  }
};

module.exports = logger;

morgan.token('body', function (req, res) {
  if(  req.body.password != null){
    let logbody = Object.assign(req.body);
    logbody.password = "*********";
    return JSON.stringify(logbody);
  }
  return JSON.stringify(req.body);
});
// app.use(morgan('combined', { stream: logger }));
app.use(morgan('{"remote_addr": ":remote-addr", ' +
    '"remote_user": ":remote-user", ' +
    '"date": ":date[clf]", ' +
    '"url": ":url", ' +
    '"method": ":method", ' +
    '"body": ":body", ' +
    '"http_version": ":http-version", ' +
    '"status": ":status", ' +
    '"result_length": ":res[content-length]", ' +
    '"referrer": ":referrer", ' +
    '"user_agent": ":user-agent", ' +
    '"response_time": ":response-time"}', {stream: logger.stream}
))
;
// app.use(logger.log('info', 'message',{stuff:'dev'}));
logger.log('info', 'test message', 'fred','ethel', 'ricky','lucy');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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

module.exports = app;

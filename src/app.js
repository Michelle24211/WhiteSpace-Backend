const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const itemRoute = require('./routes/itemRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

//1)GLOBAL MIDDLEWARES

//Set Security HTTP headers
app.use(helmet());

app.use(cors());

//Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.static('public/img/items'));

//Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try it again in an hour',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

//Data sanitation against NOSQL query injection
app.use(mongoSanitize());
//Data sanitization against XSS
app.use(xss());
//Prevent parament pollution, clear up query string
app.use(hpp({ whitelist: ['duration'] }));

//2)ROUTES
app.use('/api/v1/item', itemRoute);
app.use('/api/v1/user', userRoutes);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server`,
  // });

  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;
  // next(err);

  next(new AppError(`Can't  find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;

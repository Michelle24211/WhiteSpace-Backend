const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOPtions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // Cookie cannot be access or modified by browser
    // Browser can only receive, store, and send it along with every request
    httpOnly: true,
  };

  // if (process.env.NODE_ENV === 'production') {
  //   // Using https
  //   cookieOPtions.secure = true;
  // }
  res.cookie('jwt', token, cookieOPtions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password, passwordConfirm } = req.body;
  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password,
    passwordConfirm,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.isPasswordCorrect(password, user.password))) {
    return next(new AppError('Incorrect email or password!', 401));
  }
  // 3) If everything is ok , send token to client
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 5),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(new AppError('You are not logged in!', 401));
  }
  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // 3) Check if user (that is trying to access the route) still exists
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(
      new AppError('User belonging to the token no longer exists', 401)
    );
  }
  // 4) Check if user changed password after the token was issued
  if (user.isPasswordChangedAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password. Please login again.', 401)
    );
  }

  // Grant access to protected route
  req.user = user;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };

// Only for rendered pages, no error!
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    // 1)Verify token
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );

    // 2) Check if user (that is trying to access the route) still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(202).json({
        status: 'no user',
      });
    }
    // 3) Check if user changed password after the token was issued
    if (user.isPasswordChangedAfter(decoded.iat)) {
      return res.status(202).json({
        status: 'password changed',
      });
    }

    // There is a logged in user
    return res.status(202).json({
      status: 'success',
      data: {
        user,
      },
    });
  }
  return res.status(202).json({
    status: 'fail',
  });
});

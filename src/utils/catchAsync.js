module.exports = (fn) => (req, res, next) => {
  //next: err => next(err)
  fn(req, res, next).catch(next);
};

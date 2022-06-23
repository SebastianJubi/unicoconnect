module.exports = function logRequest(req, res, next) {
  console.log(`Logged  ${req.url}  ${req.method} -- ${new Date()}`);
  next();
};
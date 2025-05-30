/**
 * Utility function to catch async errors in Express route handlers
 * Eliminates the need for try-catch blocks in every async route handler
 *
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    // Execute the async function and catch any errors
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;

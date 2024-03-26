// middleware/errorMiddleware.js
function errorMiddleware(error, req, res, next) {
    console.error(error); // Log the error for debugging
    const status = error.status || 500;
    const message = error.message || 'Something went wrong on the server.';
    res.status(status).send({ message });
}

module.exports = errorMiddleware;

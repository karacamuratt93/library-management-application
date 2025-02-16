const userRoutes = require('./users');
const bookRoutes = require('./books');

module.exports = function(app) {
    app.get('/', (req, res) => {
        res.send('Library Management Application!');
    });

    app.use('/users', userRoutes);
    app.use('/books', bookRoutes);
};
// initDB.js
const sequelize = require('./models/index');
const User = require('./models/User');
const Book = require('./models/Book');
const UserBooks = require('./models/UserBooks');

/**
 * Immediately-invoked asynchronous function expression to synchronize the database.
 *
 * This function attempts to synchronize the database using Sequelize's `sync` method
 * with the `force` option set to `true`, which drops and recreates all tables. It logs
 * a success message upon successful synchronization. If an error occurs during the 
 * synchronization process, it logs the error message. Finally, it ensures that the 
 * database connection is closed regardless of the outcome.
 *
 * @async
 * @function
 * @returns {Promise<void>} - A promise that resolves when the database is synced and closed.
 * @throws {Error} - Logs an error if the database synchronization fails.
 */
(async () => {
    try {
        await sequelize.sync({ force: true });
        console.log('Database synced successfully');
    } catch (error) {
        console.error('Error syncing database:', error);
    } finally {
        await sequelize.close();
    }
})();

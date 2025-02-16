const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const { createUser, getAllUsers, getUserById } = require('./../helpers/usersHelper');
const { borrowBook, returnBook } = require('./../helpers/booksHelper');

const User = require('../models/User');
const Book = require('../models/Book');
const UserBooks = require('../models/UserBooks');

User.belongsToMany(Book, { through: UserBooks });
Book.belongsToMany(User, { through: UserBooks });

/**
 * Handles the HTTP GET request for retrieving all users.
 *
 * This route fetches all user records from the database and returns them
 * as a JSON response.
 *
 * @async
 * @function
 * @param {Object} req - The request object, representing the HTTP request.
 * @param {Object} res - The response object, used to send back the desired HTTP response.
 * @returns {Promise<void>} - A promise that resolves when the user data is successfully retrieved and sent as a JSON response.
 */
router.get('/', async (req, res) => {
    const users = await getAllUsers(User);
    res.json(users);
});

/**
 * Handles the creation of a new user via a POST request.
 *
 * This route expects a JSON body with a 'name' field. It validates the presence of the 'name'
 * and returns a 400 status with an error message if the validation fails. If the validation
 * passes, it attempts to create a new user in the database.
 *
 * @name CreateUser
 * @route {POST} /
 *
 * @param {Object} req - Express request object
 * @param {Object} req.body - The request body
 * @param {string} req.body.name - The name of the user to be created
 * @param {Object} res - Express response object
 *
 * @returns {Object} - JSON response with the created user data or an error message
 *
 * @throws {Error} 400 - If the 'name' field is missing in the request body
 * @throws {Error} 500 - If an error occurs while creating the user in the database
 */
router.post('/', body('name').notEmpty().withMessage('Name is required'), async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await createUser(User, req.body.name);
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while creating the user' });
    }
});

/**
 * Handles the GET request to retrieve a user by their ID, including their associated books.
 * The response includes details of books currently borrowed and those borrowed in the past.
 *
 * @param {Object} req - The request object, containing parameters and other request details.
 * @param {Object} req.params - The parameters of the request.
 * @param {string} req.params.userId - The ID of the user to be retrieved.
 * @param {Object} res - The response object used to send back the desired HTTP response.
 *
 * @returns {void} - Sends a JSON response containing user details and their books.
 *                   If the user is not found, a 404 status with an error message is returned.
 *                   In case of an error during the process, a 500 status with an error message is returned.
 *
 * @async
 */
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await getUserById(userId, User, Book);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'An error occurred while fetching the user' });
    }
});

/**
 * Handles the return of a borrowed book by a user. Updates the user's score for the book and marks it as not currently borrowed.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The route parameters.
 * @param {string} req.params.userId - The ID of the user returning the book.
 * @param {string} req.params.bookId - The ID of the book being returned.
 * @param {Object} req.body - The request body.
 * @param {number} req.body.score - The score given by the user for the book.
 * @param {Object} res - The response object.
 *
 * @returns {void} Sends a JSON response with a success message or an error message.
 *
 * @throws {Error} If there is an issue with the database operation, a 500 status code is returned with an error message.
 */
router.post('/:userId/return/:bookId', async (req, res) => {
    const { userId, bookId } = req.params;
    const { score } = req.body;

    try {
        const returnedBookResult = await returnBook(userId, bookId, User, Book, UserBooks, score);

        if (returnedBookResult.success) {
            res.status(returnedBookResult.status).json({ message: returnedBookResult.message });
        } else {
            res.status(returnedBookResult.status).json({ error: returnedBookResult.message });
        }
    } catch (error) {
        console.error('Error returning book:', error);
        res.status(500).json({ error: 'An error occurred while returning the book' });
    }
});

/**
 * Handles the borrowing of a book by a user. This endpoint allows a user to borrow a book if it is available.
 * It checks if both the user and the book exist, and ensures the book is not currently borrowed by another user.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The parameters from the request URL.
 * @param {string} req.params.userId - The ID of the user attempting to borrow the book.
 * @param {string} req.params.bookId - The ID of the book to be borrowed.
 * @param {Object} res - The response object.
 *
 * @returns {void} - Sends a JSON response with a success message if the book is borrowed successfully,
 *                   or an error message if the operation fails due to various conditions such as the book
 *                   being already borrowed or an internal server error.
 *
 * @throws {Error} - Logs and returns a 500 status code with an error message if an unexpected error occurs.
 */
router.post('/:userId/borrow/:bookId', async (req, res) => {
    const { userId, bookId } = req.params;

    try {
        const borrowBookResult = await borrowBook(userId, bookId, User, Book, UserBooks);

        if (borrowBookResult.success) {
            res.status(borrowBookResult.status).json({ message: borrowBookResult.message });
        } else {
            res.status(borrowBookResult.status).json({ error: borrowBookResult.message });
        }
    } catch (error) {
        console.error('Error borrowing book:', error);
        res.status(500).json({ error: 'An error occurred while borrowing the book' });
    }
});

module.exports = router;

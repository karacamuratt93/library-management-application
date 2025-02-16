const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const { getBookWithScore, getAllBooks } = require('./../helpers/booksHelper');

const Book = require('../models/Book');
const User = require('../models/User');
const UserBooks = require('../models/UserBooks');

User.belongsToMany(Book, { through: UserBooks });
Book.belongsToMany(User, { through: UserBooks });


/**
 * Handles the HTTP GET request to retrieve all books.
 *
 * This route responds with a JSON array of all books available in the database.
 * If an error occurs during the retrieval process, it logs the error and responds
 * with a 500 status code and an error message.
 *
 * @async
 * @function
 * @param {Object} req - The request object from the client.
 * @param {Object} res - The response object to send data back to the client.
 * @returns {void} Sends a JSON response containing all books or an error message.
 */
router.get('/', async (req, res) => {
    try {
        const allBooks = await getAllBooks(Book);
        res.json(allBooks);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ error: 'An error occurred while fetching books' });
    }
});

/**
 * Handles the creation of a new book entry in the database.
 * This route expects a POST request with a non-empty 'name' field in the request body.
 * Validates the input and returns a 400 status with error details if validation fails.
 * If validation passes, it creates a new book entry and returns it with a 201 status.
 *
 * @name CreateBook
 * @route {POST} /
 * @bodyparam {string} name - The name of the book to be created. Must not be empty.
 * @returns {Object} - A JSON response containing the created book object.
 * @throws {400} - If the 'name' field is empty, returns a JSON object with validation errors.
 * @throws {201} - If the book is successfully created, returns the created book object.
 */
router.post('/', body('name').notEmpty(), async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const book = Book.sync().then(async () => {
        await Book.create({ name: req.body.name })
    });

    res.status(201).json(book);
});

/**
 * Handles GET requests to retrieve a book by its ID.
 *
 * This route fetches a book from the database using the provided ID in the request parameters.
 * If the book is found, it returns the book data as a JSON response.
 * If the book is not found, it responds with a 404 status and an error message.
 *
 * @name GET /:id
 * @function
 * @memberof module:routes/books
 * @inner
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.id - The ID of the book to retrieve
 * @param {Object} res - Express response object
 * @returns {void} - Sends a JSON response with the book data or an error message
 */
router.get('/:id', async (req, res) => {
    const book = await getBookWithScore(req.params.id, Book, User);

    if (!book) {
        return res.status(404).json({ error: 'Book not found' });
    }

    res.json(book);
});

module.exports = router;

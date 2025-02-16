
/**
 * Retrieves a book by its ID and calculates the average user score for it.
 *
 * This function fetches a book from the database using its primary key and includes
 * associated user scores. It calculates the average score from all users who have
 * rated the book. If no scores are available, it returns a default score of -1.
 *
 * @async
 * @param {number} bookId - The unique identifier of the book to retrieve.
 * @param {Object} Book - The Book model used to query the database.
 * @param {Object} User - The User model used to include user scores.
 * @returns {Promise<Object|null>} A promise that resolves to an object containing
 * the book's ID, name, and average score, or null if the book is not found.
 *
 * @property {number} id - The unique identifier of the book.
 * @property {string} name - The name of the book.
 * @property {string|number} score - The average score of the book, formatted to two decimal places,
 * or -1 if no scores are available.
 */
const getBookWithScore = async (bookId, Book, User) => {
    const book = await Book.findByPk(bookId, {
        include: [{
            model: User,
            through: {
                attributes: ['userScore']
            }
        }]
    });

    if (!book) {
        return null;
    }

    let totalScore = 0;

    book.Users.forEach(user => {
        const userScore = user.UserBooks.userScore;

        if (userScore !== null && userScore !== undefined) {
            totalScore += userScore;
        }
    });

    const averageScore = totalScore !== 0 ? (totalScore / book.Users.length).toFixed(2) : 0;

    if (averageScore !== 0) {
        return {
          id: book.id,
          name: book.name,
          score: averageScore,
        };
    }

    return {
        id: book.id,
        name: book.name,
        score: -1
    };
};

/**
 * Retrieves all books from the database and formats them into a simplified object structure.
 *
 * This function synchronizes with the database model and fetches all book entries,
 * selecting only the 'id' and 'name' attributes for each book. The resulting list of books
 * is then mapped to a new array of objects, each containing only the 'id' and 'name' properties.
 *
 * @async
 * @param {Object} Book - The Sequelize model representing the 'Book' entity in the database.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of book objects, 
 * each containing 'id' and 'name' properties.
 */
const getAllBooks = async (Book) => {
    const books = await Book.sync().then(async () => {
        return await Book.findAll({
            attributes: ['id', 'name']
        });
    });

    const formattedBooks = books.map(book => {
        return {
            id: book.id,
            name: book.name
        };
    });

    return formattedBooks;
};

/**
 * Handles the return process of a borrowed book for a user, updating the database and user score.
 *
 * @async
 * @function returnBook
 * @param {number} userId - The unique identifier of the user returning the book.
 * @param {number} bookId - The unique identifier of the book being returned.
 * @param {Object} User - The User model used to interact with the users database table.
 * @param {Object} Book - The Book model used to interact with the books database table.
 * @param {Object} UserBooks - The UserBooks model used to manage the relationship between users and books.
 * @param {number} score - The score to be updated for the user upon returning the book.
 * @returns {Promise<Object>} A promise that resolves to an object containing the result of the operation:
 * - `success` {boolean}: Indicates if the operation was successful.
 * - `message` {string}: Provides a message about the operation's outcome.
 * - `status` {number}: HTTP-like status code representing the result (e.g., 200 for success, 404 for not found).
 *
 * @throws Will throw an error if there is an issue with database access or updating records.
 *
 * @example
 * const result = await returnBook(1, 101, User, Book, UserBooks, 5);
 * console.log(result.message); // 'Book returned successfully'
 */
const returnBook = async (userId, bookId, User, Book, UserBooks, score) => {
    let result = {
        success: true,
        message: '',
        status: 201
    };

    const user = await User.findByPk(userId);
    const book = await Book.findByPk(bookId);

    if (!user || !book) {
        result.success = false;
        result.message = 'User or Book not found';
        result.status = 404;
        return result;
    }

    const userBookEntry = await UserBooks.findOne({
        where: { userId, bookId, isCurrentlyBorrowed: true }
    });

    if (!userBookEntry) {
        result.success = false;
        result.message = 'This book is not currently borrowed by the user';
        result.status = 400;
        return result;
    }

    await userBookEntry.update({
      isCurrentlyBorrowed: false,
      userScore: score
    });

    result.success = true;
    result.message = 'Book returned successfully';
    result.status = 200;

    return result;
};

/**
 * Handles the borrowing of a book by a user, ensuring the book is available and updating the records accordingly.
 *
 * @async
 * @param {number} userId - The unique identifier of the user attempting to borrow the book.
 * @param {number} bookId - The unique identifier of the book to be borrowed.
 * @param {Object} User - The User model used to query user data.
 * @param {Object} Book - The Book model used to query book data.
 * @param {Object} UserBooks - The UserBooks model used to manage the relationship between users and books.
 *
 * @returns {Promise<Object>} A promise that resolves to an object containing the result of the operation:
 * - `success` {boolean}: Indicates whether the operation was successful.
 * - `message` {string}: Provides a descriptive message about the outcome of the operation.
 * - `status` {number}: HTTP-like status code representing the result (e.g., 200 for success, 404 for not found).
 *
 * @throws Will throw an error if there is a problem accessing the database or performing the operations.
 */
const borrowBook = async (userId, bookId, User, Book, UserBooks) => {
    let result = {
        success: true,
        message: '',
        status: 201
    };

    const user = await User.findByPk(userId);
    const book = await Book.findByPk(bookId);

    if (!user || !book) {
        result.success = false;
        result.message = 'User or Book not found';
        result.status = 404;
        return result;
    }

    const existingEntry = await UserBooks.findOne({
        where: { bookId, isCurrentlyBorrowed: true }
    });

    if (existingEntry) {
        const byUserMessage = existingEntry.userId == userId ? ' this user' : ' someone else';

        result.success = false;
        result.message = 'Book is already borrowed by' + byUserMessage;
        result.status = 400;
        return result;
    }

    await UserBooks.sync().then(async () => {
        const isPreviouslyBorrowed = await UserBooks.findOne({
            where: { bookId, userId, isCurrentlyBorrowed: false }
        });

        if (isPreviouslyBorrowed) {
            await UserBooks.update({
                isCurrentlyBorrowed: true,
                userScore: 0
            }, {
                where: { bookId, userId }
            });
        } else {
            await UserBooks.create({
                userId,
                bookId,
                isCurrentlyBorrowed: true
            });
        }
    });

    result.success = true;
    result.message = 'Book borrowed successfully';
    result.status = 200;

    return result;
};

module.exports = {
    getBookWithScore,
    getAllBooks,
    returnBook,
    borrowBook
};

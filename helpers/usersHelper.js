/**
 * Asynchronously retrieves all user records from the database.
 *
 * @async
 * @function getAllUsers
 * @param {Object} User - The User model object that provides access to the user data.
 * @returns {Promise<Array>} A promise that resolves to an array of user objects.
 */
const getAllUsers = async (User) => {
    const users = await User.findAll();
    return users;
};

/**
 * Asynchronously creates a new user with the specified username in the database.
 *
 * @async
 * @param {Object} User - The User model object that provides methods to interact with the database.
 * @param {string} userName - The name of the user to be created.
 * @returns {Promise<Object>} A promise that resolves to the created user object.
 */
const createUser = async (User, userName) => {
    const user = User.sync().then(async () => {
        await User.create({ name: userName })
    });

    return user;
};

/**
 * Retrieves a user by their ID, including their associated books and categorizes them
 * into past and present based on their borrowing status.
 *
 * @async
 * @param {number} userId - The unique identifier of the user to be retrieved.
 * @param {Object} User - The User model used to query the database.
 * @param {Object} Book - The Book model to be included in the query, representing the books associated with the user.
 * @returns {Promise<Object|null>} A promise that resolves to an object containing the user's details and their books categorized into past and present. Returns null if no user is found.
 */
const getUserById = async (userId, User, Book) => {
    const user = await User.findByPk(userId, {
        include: [{
            model: Book,
            through: {
                attributes: ['userScore', 'isCurrentlyBorrowed']
            }
        }]
    });

    if (!user) {
        return null;
    }

    let pastBooks = [];
    let presentBooks = [];

    user.Books.forEach(book => {
        const { userScore, isCurrentlyBorrowed } = book.UserBooks;

        if (isCurrentlyBorrowed) {
            presentBooks.push({ name: book.name });
        } else {
            pastBooks.push({ name: book.name, userScore });
        }
    });

    return {
        id: user.id,
        name: user.name,
        books: {
            past: pastBooks,
            present: presentBooks
        }
    };
};

module.exports = {
    getAllUsers,
    createUser,
    getUserById
};

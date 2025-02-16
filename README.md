Library Management Application

This application is a library management system built with Node.js, Express, and Sequelize. It allows users to manage members and the borrowing of books by members. The application supports various operations such as listing users and books, borrowing and returning books, and viewing user and book details.

Features

User Management:

    -List all users.
    -View user details, including past and current borrowed books.
    -Create a new user.

Book Management:

    -List all books.
    -View book details, including average rating.
    -Create a new book.

Borrowing and Returning:

    -Borrow a book (ensures the book is not already borrowed by another user).
    -Return a book and provide a user score.


Technology Stack
    -Node.js: JavaScript runtime for building the server-side application.
    -Express.js: Web framework for building RESTful APIs.
    -Sequelize: ORM for interacting with the SQLite database.
    -SQLite: Relational database for storing application data.

Installation

Clone the Repository:

    git clone <repository-url>

    cd library-management

Install Dependencies:

    npm install

Initialize the Database:

Run the database initialization script to set up the database schema.

    node initDB.js

Start the Server:

    node app.js




API Endpoints


User Endpoints
    List Users:

        -GET /users
        -Response: List of all users.

    Get User Details:

        -GET /users/:userId
        -Response: User details with past and present borrowed books.

    Create User:

        -POST /users
        -Request Body: { "name": "User Name" }
        -Response: Created user object.

    Borrow Book:

        -POST /users/:userId/borrow/:bookId
        -Response: Success message or error if the book is already borrowed.

    Return Book:

        -POST /users/:userId/return/:bookId
        -Request Body: { "score": 5 }
        -Response: Success message.



Book Endpoints
    List Books:

        -GET /books
        -Response: List of all books.

    Get Book Details:

        -GET /books/:bookId
        -Response: Book details with average score.

    Create Book:

        -POST /books
        -Request Body: { "name": "Book Name" }
        -Response: Created book object.




Models
    User Model
        Fields:
            id: Integer, Primary Key, Auto-increment.
            name: String, Not Null.
    Book Model
        Fields:
            id: Integer, Primary Key, Auto-increment.
            name: String, Not Null.
            averageRating: Float, Default 0.
    UserBooks Model
        Fields:
            userId: Integer, Foreign Key, References User.
            bookId: Integer, Foreign Key, References Book.
            userScore: Integer, Nullable.
            isCurrentlyBorrowed: Boolean, Default True.


Associations
        User and Book:
            Many-to-Many relationship through UserBooks.
                User.belongsToMany(Book, { through: UserBooks })
                Book.belongsToMany(User, { through: UserBooks })


Error Handling
    Proper error handling is implemented for all endpoints to manage cases such as missing users or books, and database errors."# library-management-application" 
"# library-management-application" 

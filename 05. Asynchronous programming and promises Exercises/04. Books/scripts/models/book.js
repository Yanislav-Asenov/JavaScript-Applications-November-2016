function validateProperties (title, author, isbn) {
    if (title === '') {
        throw new Error('Error: Title is required');
    }

    if (author === '') {
        throw new Error('Error: Author is required');
    }

    if (isbn === '') {
        throw new Error('Error: Isbn is required');
    }
}

class Book {
    constructor (title, author, isbn) {
        validateProperties(title, author, isbn);
        this.title = title;
        this.author = author;
        this.isbn = isbn;
    }
}

module.exports = Book;

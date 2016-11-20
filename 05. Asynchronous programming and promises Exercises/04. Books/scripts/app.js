let Book = require('./models/book.js');

const appKey = 'kid_SJvZS7Tbx';
const appSecret = '1da20e92084348f2939be73712845d48';
const baseUrl = `https://baas.kinvey.com/appdata/${appKey}`;
const username = 'guest';
const password = 'guest';
const base64auth = btoa(`${username}:${password}`);
const authHeaders = {
    "Authorization": `Basic ${base64auth}`,
    "Content-Type": 'application/json'
};

let booksContainer = $('#books-container');
let bookDetailsContainer = $('#book-details-container');
let bookTitleField = $('#book-title');
let bookAuthorField = $('#book-author');
let bookIsbnField = $('#book-isbn');

$(attachEvents);

function attachEvents () {
    $('#load-books-btn').click(loadBooks);
    $('#add-book-btn').click(createBook);
}

function createBook () {
    let createBookReqeust = {
        method: 'POST',
        url: `${baseUrl}/books`,
        headers: authHeaders,
        data: getNewBookData(),
        success: loadBooks,
        error: displayError
    };

    $.ajax(createBookReqeust).then(resetInputFelds);
}

function resetInputFelds () {
    bookAuthorField.val('');
    bookIsbnField.val('');
    bookTitleField.val('');
}

function getNewBookData () {
    let author = bookAuthorField.val();
    let title = bookTitleField.val();
    let isbn = bookIsbnField.val();
    let newBook = new Book(title, author, isbn);

    return JSON.stringify(newBook);
}

function loadBooks () {
    let getBooksRequest = {
        method: 'GET',
        url: `${baseUrl}/books`,
        headers: authHeaders,
        success: displayBooks,
        error: displayError
    };

    $.ajax(getBooksRequest);
}

function displayBooks (books) {
    let html = '';
    for (let book of books) {
        html += `<li class="book-list-item" data-id="${book._id}">
                    <a>
                        <h2 class="book-title">${book.title}</h2>
                        <p class="book-author">${book.author}</p>
                    </a>
                </li>`;
    }

    booksContainer.html(html);
    $('.book-list-item').on('click', getBookDetails);
}

function getBookDetails (event) {
    let bookId = $(event.delegateTarget).attr('data-id');
    let getBookRequest = {
        method: 'GET',
        url: `${baseUrl}/books/${bookId}`,
        headers: authHeaders,
        success: displayBookDetails,
        error: displayError
    };

    $.ajax(getBookRequest);
}

function displayBookDetails (book) {
    let html = `<h3 id="book-details-title">${book.title}</h3>
                <span>by</span><h4 id="book-details-author">${book.author}</h4>
                <span>ISBN:</span><h4 id="book-details-isbn">${book.isbn}</h4>
                <button data-id="${book._id}" id="update-book-btn">Update</button>
                <button data-id="${book._id}" id="delete-book-btn">Delete</button>`;

    bookDetailsContainer.html(html);
    $('#delete-book-btn').on('click', deleteBook);
    $('#update-book-btn').on('click', showUpdateBookForm);
}

function showUpdateBookForm () {
    let updateButton =  $('#update-book-btn');
    if (updateButton.hasClass('edit-mode')) {
        updateBook();
    } else {
        $('#book-details-title').addClass('editable').attr('contenteditable','true');
        $('#book-details-author').addClass('editable').attr('contenteditable','true');
        $('#book-details-isbn').addClass('editable').attr('contenteditable','true');
        updateButton.addClass('edit-mode');
    }
}

function updateBook () {
    let newTitle = $('#book-details-title').text();
    let newAuthor = $('#book-details-author').text();
    let newIsbn = $('#book-details-isbn').text();
    let newBook = new Book(newTitle, newAuthor, newIsbn);
    let bookId =  $('#update-book-btn').attr('data-id');

    let updateBookRequest = {
        method: 'PUT',
        url: `${baseUrl}/books/${bookId}`,
        headers: authHeaders,
        data: JSON.stringify(newBook),
        success: updateBookDetails,
        error: displayError
    };

    $.ajax(updateBookRequest)
        .then(loadBooks)
        .catch(displayError);
}

function updateBookDetails (book) {
    $('#book-details-title').removeClass('editable').attr('contenteditable','false');
    $('#book-details-author').removeClass('editable').attr('contenteditable','false');
    $('#book-details-isbn').removeClass('editable').attr('contenteditable','false');
    $('#update-book-btn').removeClass('edit-mode');
}

function deleteBook (event) {
    let bookId = $(event.target).attr('data-id');

    let deleteBookRequest = {
        method: 'DELETE',
        url: `${baseUrl}/books/${bookId}`,
        headers: authHeaders,
        success: loadBooks,
        error: displayError
    };

    $.ajax(deleteBookRequest).then(clearBookDetails);
}

function clearBookDetails () {
    bookDetailsContainer.html('');
}

function displayError (err) {
    console.log(`Error: ${err.status}`);
}

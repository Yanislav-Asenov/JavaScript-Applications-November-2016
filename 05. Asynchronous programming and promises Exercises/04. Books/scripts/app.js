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
let tagsList = $('#book-tags');
let newTag = $('#new-tag');

$(attachEvents);

function attachEvents () {
    $('#load-books-btn').click(loadBooks);
    $('#add-book-btn').click(createBook);
    $('#add-tag-btn').click(function () {
        addTag('#book-tags', '#new-tag');
    });
    $('#remove-tag-btn').click(function () {
        removeTagFromList('#book-tags');
    });
}

function addTag (selectListSelector, newItemInputSelector) {
    let selectList = $(selectListSelector);
    let inputField = $(newItemInputSelector);
    let newItemValue = inputField.val();
    if (newItemValue !== '') {
        let option = $('<option>');
        option.text(newItemValue);
        inputField.val('');
        selectList.append(option);
    }
}

function removeTagFromList (selectListSelector) {
    let selectList = $(selectListSelector);
    selectList.find('option:selected').remove();
    if (selectList.children().length === 0) {
        selectList.val('');
    }
}

function createBook () {
    let createBookReqeust = {
        method: 'POST',
        url: `${baseUrl}/books`,
        headers: authHeaders,
        data: getNewBookData()
    };

    $.ajax(createBookReqeust)
        .then(addBookTags)
        .then(loadBooks)
        .then(resetInputFelds)
        .catch(displayError);
}

function addBookTags (book) {
    let tags = tagsList.children().toArray().map(x => $(x).text());
    let createTagRequet = {
        method: 'POST',
        url: `${baseUrl}/tags`,
        headers: authHeaders
    };
    for (let tag of tags) {
        let data = {
          name: tag,
          book_id: book._id,
          error: displayError
        };

        createTagRequet.data = JSON.stringify(data);
        $.ajax(createTagRequet);
    }
}

function resetInputFelds () {
    bookAuthorField.val('');
    bookIsbnField.val('');
    bookTitleField.val('');
    tagsList.empty();
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
    $('.book-list-item').on('click', function (event) {
        let bookId = $(event.currentTarget).attr('data-id');
        getBookDetails(bookId);
    });
}

function getBookDetails (bookId) {
    let getBookRequest = $.ajax({
        method: 'GET',
        url: `${baseUrl}/books/${bookId}`,
        headers: authHeaders
    });

    let getBookTagsRequest = $.ajax({
        method: 'GET',
        url: `${baseUrl}/tags/?query={"book_id":"${bookId}"}`,
        headers: authHeaders
    });

    Promise.all([getBookRequest, getBookTagsRequest])
        .then(displayBookDetails)
        .catch(displayError);
}

function displayBookDetails ([book, tags]) {
    let html = `<h3 id="book-details-title">${book.title}</h3>
                <span>by</span><h4 id="book-details-author">${book.author}</h4>
                <span>ISBN:</span><h4 id="book-details-isbn">${book.isbn}</h4>
                <span>Tags:</span><ul id="book-details-tags">`; 
    
    for (let tag of tags) {
        html += `<li class="tag-item" data-id="${tag._id}">#${tag.name}</li>`;
    }

    html += `</ul>
            <button id="update-book-btn" data-id="${book._id}">Update</button>
            <button id="delete-book-btn" data-id="${book._id}">Delete</button>`;

    bookDetailsContainer.html(html);
    $('#delete-book-btn').on('click', deleteBook);
    $('#update-book-btn').on('click', getBookTags);
}

function getBookTags (event) {
    let bookId = $(event.target).attr('data-id');
    let getBookTagsRequest = {
        method: 'GET',
        url: `${baseUrl}/tags/?query={"book_id":"${bookId}"}`,
        headers: authHeaders
    };

    $.ajax(getBookTagsRequest)
        .then(function (tags) {
            showUpdateBookForm(tags)
        })
        .catch(displayError);
}

function showUpdateBookForm (tags) {
    let bookId = $('#update-book-btn').attr('data-id');
    let bookTitle = $('#book-details-title').text();
    let bookAuthor = $('#book-details-author').text();
    let bookIsbn = $('#book-details-isbn').text();
    let bookTags = tags;
    let tagsHtml = '<select id="update-book-tags-list">'
    for (let tag of bookTags) {
        tagsHtml += `<option data-id="${tag.book_id}" value="${tag._id}">${tag.name}</option>`;
    }
    tagsHtml += '</select>'

    let html = `<span>Title:</span><input type="text" id="book-details-title" value="${bookTitle}">
                <span>by</span><input type="text" id="book-details-author" value="${bookAuthor}">
                <span>ISBN:</span><input type="text" id="book-details-isbn" value="${bookIsbn}">
                <span>Tags:${tagsHtml}
                <input type="text" id="update-add-new-tag" data-id="${bookId}" placeholder="new tag name"><button id="update-add-tag-btn">Add tag</button>
                <button id="update-remove-tag-btn">Remove tag</button>
                <hr>
                <button data-id="${bookId}" id="save-book-btn">Save</button>`;

    bookDetailsContainer.html(html);
    $('#update-add-tag-btn').click(function () {
        let inputField = $('#update-add-new-tag');
        if (inputField.val() !== '') {
            let newTag = {
                name: inputField.val(),
                book_id: inputField.attr('data-id')
            };

            let addTagRequest = {
                method: 'POST',
                url: `${baseUrl}/tags`,
                headers: authHeaders,
                data: JSON.stringify(newTag)
            }

            $.ajax(addTagRequest)
                .then(function () {
                    addTag('#update-book-tags-list', '#update-add-new-tag');
                })
                .catch(displayError);
        }
    });
    
    $('#update-remove-tag-btn').click(function () {
        let tagId = $('#update-book-tags-list').val();
        let removeTagRequest = {
            method: 'DELETE',
            url: `${baseUrl}/tags/${tagId}`,
            headers: authHeaders
        };

        $.ajax(removeTagRequest)
            .then(function (success) {
                removeTagFromList('#update-book-tags-list');
            })
            .catch(displayError);
    });

    $('#save-book-btn').click(function (event) {
        let bookId = $(event.currentTarget).attr('data-id');
        let newTitle = $('#book-details-title').val();
        let newAuthor = $('#book-details-author').val();
        let newIsbn = $('#book-details-isbn').val();
        let updatedBook = new Book(newTitle, newAuthor, newIsbn);
        let updateBookRequest = {
            method: 'PUT',
            url: `${baseUrl}/books/${bookId}`,
            headers: authHeaders,
            data: JSON.stringify(updatedBook)
        };

        $.ajax(updateBookRequest)
            .then(function () {
                getBookDetails(bookId);
            })
            .then(loadBooks)
            .catch(displayError);
        
    });
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
        headers: authHeaders
    };

    $.ajax(updateBookRequest)
        .then(loadBooks)
        .catch(displayError);
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

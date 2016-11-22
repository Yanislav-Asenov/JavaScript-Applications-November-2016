const kinveyBaseUrl = 'https://baas.kinvey.com';
const kinveyAppKey = 'kid_rkcLxcUr';
const kinveyAppSecret = 'e234a245b3864b2eb7ee41e19b8ca4e5';
const base64auth = btoa(`${kinveyAppKey}:${kinveyAppSecret}`);
const kinveyAppAuthHeaders = {
    'Authorization': `Basic ${base64auth}`,
    'Content-Type': 'application/json'
};

function startApp () {
    sessionStorage.clear();
    showHideMenuLinks();
    showView('viewHome');

    // Bind the navigation menu links
    $("#linkHome").click(showHomeView);
    $("#linkLogin").click(showLoginView);
    $("#linkRegister").click(showRegisterView);
    $("#linkListBooks").click(listBooks);
    $("#linkCreateBook").click(showCreateBookView);
    $("#linkLogout").click(logoutUser);

    // Bind the form submit buttons
    $("#buttonLoginUser").click(loginUser);
    $("#buttonRegisterUser").click(registerUser);
    $("#buttonCreateBook").click(createBook);
    $("#buttonEditBook").click(editBook);

    // Bind the info / error boxes: hide on click
    $("#infoBox, #errorBox").click(function() {
        $(this).fadeOut();
    });

    // Attach AJAX "loading" event listener
    $(document).on({
        ajaxStart: function () {
            $("#loadingBox").show(); 
        },
        ajaxStop: function () { 
            $("#loadingBox").hide(); 
        }
    });

    function showHideMenuLinks () {
        $("#linkHome").show();
        if (sessionStorage.getItem('authToken')) {
            // We have logged in user
            $("#linkLogin").hide();
            $("#linkRegister").hide();
            $("#linkListBooks").show();
            $("#linkCreateBook").show();
            $("#linkLogout").show();
        } else {
            // No logged in user
            $("#linkLogin").show();
            $("#linkRegister").show();
            $("#linkListBooks").hide();
            $("#linkCreateBook").hide();
            $("#linkLogout").hide();
        }
    }

    function showView (viewName) {
        // Hide all views and show the selected view only
        $('main > section').hide();
        $('#' + viewName).show();
    }

    function showHomeView () {
        showView('viewHome');
    }

    function showLoginView () {
        showView('viewLogin');
        $('#formLogin').trigger('reset');
    }

    function showRegisterView () {
        $('#formRegister').trigger('reset');
        showView('viewRegister');
    }

    function showCreateBookView () {
        $('#formCreateBook').trigger('reset');
        showView('viewCreateBook');
    }

    function loginUser () { 
        let userData = {
            username: $('#formLogin input[name=username]').val(),
            password: $('#formLogin input[name=passwd]').val()
        };

        $.ajax({
            method: "POST",
            url: `${kinveyBaseUrl}/user/${kinveyAppKey}/login`,
            headers: kinveyAppAuthHeaders,
            data: JSON.stringify(userData),
            success: loginSuccess,
            error: handleAjaxError
        });

        function loginSuccess (userInfo) {
            saveAuthInSession(userInfo);
            showHideMenuLinks();
            listBooks();
            showInfo('Login successful.');
        }
    }

    function registerUser () { 
        let userData = {
            username: $('#formRegister input[name=username]').val(),
            password: $('#formRegister input[name=passwd]').val()
        };
        $.ajax({
            method: 'POST',
            url: `${kinveyBaseUrl}/user/${kinveyAppKey}`,
            headers: kinveyAppAuthHeaders,
            data: JSON.stringify(userData),
            success: registerSuccess,
            error: handleAjaxError
        });

        function registerSuccess (userInfo) {
            saveAuthInSession(userInfo);
            showHideMenuLinks();
            listBooks();
            showInfo('User registration successful.');
        }
    }

    function saveAuthInSession (userInfo) {
        let userAuth = userInfo._kmd.authtoken;
        sessionStorage.setItem('authToken', userAuth);
        let userId = userInfo._id;
        sessionStorage.setItem('userId', userId);
        let username = userInfo.username;
        $('#loggedInUser').text(`Welcome, ${username}!`);
    }

    function handleAjaxError (response) {
        let errorMsg = JSON.stringify(response);

        if (response.readyState === 0) {
            errorMsg = 'Cannot connect due to network error.';
        }

        if (response.responseJSON && response.responseJSON.description) {
            errorMsg = response.responseJSON.description;
        }

        showError(errorMsg);
    }

    function showInfo (message) {
        $('#infoBox').text(message);
        $('#infoBox').show();
        setTimeout(function() {
            $('#infoBox').fadeOut();
        }, 3000);
    }

    function showError (errorMsg) {
        $('#errorBox').text("Error: " + errorMsg);
        $('#errorBox').show();
    }

    function logoutUser () { 
        function logoutUser() {
            sessionStorage.clear();
            $('#loggedInUser').text("");
            showHideMenuLinks();
            showView('viewHome');
            showInfo('Logout successful.');
        }
    }

    function listBooks () {
        $('#books').empty();
        let authToken = sessionStorage.getItem('authToken');
        showView('viewBooks');
        let getBooksRequest = {
            method: 'GET',
            url: `${kinveyBaseUrl}/appdata/${kinveyAppKey}/books`,
            headers: {
                'Authorization': `Kinvey ${authToken}`
            },
            success: displayBooks,
            error: handleAjaxError
        };

        $.ajax(getBooksRequest);

        function displayBooks (books) {
            let table = $(`<table>
                            <tr>
                                <th>Title</th>
                                <th>Author</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>`);
            for (let book of books) {
                let tr = $('<tr>');
                let titleCol = $('<td>').text(book.title);
                let authorCol = $('<td>').text(book.author);
                let descriptionCol = $('<td>').text(book.description);
                tr.append(titleCol)
                    .append(authorCol)
                    .append(descriptionCol);
                table.append(tr);
            }

            $('#books').append(table);
        }
    }

    function createBook () {
        let newBook = {

        };
    }

    function editBook () {
        // TODO 
    }

    function deleteBook () {
        // TODO 
    }



}

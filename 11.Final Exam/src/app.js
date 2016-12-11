const kinveyBaseUrl = 'https://baas.kinvey.com';
const kinveyAppKey = 'kid_ryMj6O5mg';
const kinveyAppSecret = '0bbc974897614535a0b13663dcda90e4';
const base64auth = btoa(`${kinveyAppKey}:${kinveyAppSecret}`);
const kinveyAppAuthHeaders = {
    'Authorization': `Basic ${base64auth}`,
    'Content-Type': 'application/json'
};

function startApp() {
    displayUserGreetingMessages();

    showHideMenuLinks();

    attachMenuLinksEvents();
    attachHomeViewLinkEvents();
    attachButtonsEvents();

    showViewHome();

    $(document).on({
        ajaxStart: () => $('#loadingBox').show(),
        ajaxStop: () => {
            $('#loadingBox').hide();
        }
    });
}



/*
    Display user greeting messages functions
*/
function displayUserGreetingMessages () {
    if (sessionStorage.getItem('authToken')) {
        $('#spanMenuLoggedInUser').text(`Welcome, ${sessionStorage.getItem('username')}!`);
        $('#viewUserHomeHeading').text(`Welcome, ${sessionStorage.getItem('username')}!`);
    } else {
        $('#spanMenuLoggedInUser').text(``);
    }
}



/*
    Attach events functions
*/
function attachButtonsEvents () {
    $('#formLogin').submit(loginUser);
    $('#formRegister').submit(registerUser);
    $('#formSendMessage').submit(sendMessage);
}

function attachMenuLinksEvents () {
    $('#linkMenuAppHome').click(showViewHome);
    $('#linkMenuLogin').click(showViewLogin);
    $('#linkMenuRegister').click(showViewRegister);
    $('#linkMenuUserHome').click(showViewHome);
    $('#linkMenuMyMessages').click(loadMyMessages);
    $('#linkMenuArchiveSent').click(loadSentMessages);
    $('#linkMenuSendMessage').click(loadUsers);
    $('#linkMenuLogout').click(logoutUser);
}

function attachHomeViewLinkEvents () {
    $('#linkUserHomeMyMessages').click(loadMyMessages);
    $('#linkUserHomeSendMessage').click(showViewSendMessage);
    $('#linkUserHomeArchiveSent').click(loadSentMessages);
}



/*
    Login functions
*/
function loginUser (event) {
    event.preventDefault();
    let userData = {
        username: $('#loginUsername').val(),
        password: $('#loginPasswd').val()
    };

    let loginUserRequest = {
        method: 'POST',
        url: `${kinveyBaseUrl}/user/${kinveyAppKey}/login`,
        headers: kinveyAppAuthHeaders,
        data: JSON.stringify(userData)
    };

    $.ajax(loginUserRequest)
        .then(loginSuccess)
        .then(() =>  showInfoBox('Login successful.'))
        .catch(handleAjaxError);

    function loginSuccess (userInfo) {
        // reset input fields values
        $('#loginUsername').val('');
        $('#loginPasswd').val('');
        $('#spanMenuLoggedInUser').text(`Welcome, ${userInfo.username}!`);
        $('#viewUserHomeHeading').text(`Welcome, ${userInfo.username}!`);

        saveAuthInSession(userInfo);
        showHideMenuLinks();
        showViewHome();
    }
}



/*
    Register functions
*/
function registerUser (event) {
    event.preventDefault();
    let userData = {
        username: $('#registerUsername').val(),
        password: $('#registerPasswd').val(),
        name: $('#registerName').val()
    };

    let loginUserRequest = {
        method: 'POST',
        url: `${kinveyBaseUrl}/user/${kinveyAppKey}/`,
        headers: kinveyAppAuthHeaders,
        data: JSON.stringify(userData)
    };

    $.ajax(loginUserRequest)
        .then(registerSuccess)
        .then(() =>  showInfoBox('User registration successful.'))
        .catch(handleAjaxError);

    function registerSuccess (userInfo) {
        // reset input fields values
        $('#registerUsername').val('');
        $('#registerPasswd').val('');
        $('#registerName').val('');
        $('#spanMenuLoggedInUser').text(`Welcome, ${userInfo.username}!`);
        $('#viewUserHomeHeading').text(`Welcome, ${userInfo.username}!`);

        saveAuthInSession(userInfo);
        showHideMenuLinks();
        showViewHome();
    }
}



/*
    Notifications functions
*/
function showInfoBox (message) {
    $('#infoBox').text(message).show().fadeOut(5000);
}

function showError(message) {
     $('#errorBox').text(message).show().click(() => {
         $('#errorBox').hide();
     });
}



/*
    Authentication functions
*/
function saveAuthInSession (userInfo) {
    sessionStorage.setItem('authToken', userInfo._kmd.authtoken);
    sessionStorage.setItem('userId', userInfo._id);
    sessionStorage.setItem('username', userInfo.username);
    sessionStorage.setItem('name', userInfo.name);
}



/*
    Handle errors functions
*/
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


/*
    My messages section functions
*/
function loadMyMessages (event) {
    $('#myMessages').empty();
    let authToken = sessionStorage.getItem('authToken');
    let username = sessionStorage.getItem('username');
    let getMyMessagesRequest = {
        method: 'GET',
        url: `${kinveyBaseUrl}/appdata/${kinveyAppKey}/messages?query={"recipient_username":"${username}"}`,
        headers:  getUserHeaders()
    };

    $.ajax(getMyMessagesRequest)
        .then(displayMyMessages)
        .catch(handleAjaxError);
    
    function displayMyMessages (response) {
        let table = $(`<table>
                        <thead>
                            <tr>
                                <th>From</th>
                                <th>Message</th>
                                <th>Date Received</th>
                            </tr>
                        </thead>
                    </table>`);
        
        let tableBody = $('<tbody>');
        for (let message of response) {
            let row = $('<tr>');
            let fromTd = $('<td>').text(formatSender(message.sender_name, message.sender_username));
            let messageTd = $('<td>').text(message.text);
            let dateTd = $('<td>').text(formatDate(message._kmd.lmt));

            row.append(fromTd)
                .append(messageTd)
                .append(dateTd);
            
            tableBody.append(row);
        }

        table.append(tableBody);
        $('#myMessages').append(table);
        showViewMyMessages();
    }
}



/*
    Archive sent messages functions
*/
function loadSentMessages (event) {
    $('#sentMessages').empty();
    let authToken = sessionStorage.getItem('authToken');
    let username = sessionStorage.getItem('username');
    let userId = sessionStorage.getItem('userId');
    let getMyMessagesRequest = {
        method: 'GET',
        url: `${kinveyBaseUrl}/appdata/${kinveyAppKey}/messages`,
        headers: getUserHeaders()
    };

    $.ajax(getMyMessagesRequest)
        .then(displaySentMessages)
        .catch(handleAjaxError);

    function displaySentMessages (response) {
        response = response.filter((x => x._acl.creator === sessionStorage.getItem('userId')));

        let table = $(`<table>
                        <thead>
                            <tr>
                                <th>To</th>
                                <th>Message</th>
                                <th>Date Sent</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                    </table>`);
        
        let tableBody = $('<tbody>');
        for (let message of response) {
            let row = $('<tr>');
            let toTd = $('<td>').text(message.recipient_username);
            let messageTd = $('<td>').text(message.text);
            let dateTd = $('<td>').text(formatDate(message._kmd.lmt));
            let actions = $(`<td><button data-message-id=${message._id}>Delete</button></td>`)

            row.append(toTd)
                .append(messageTd)
                .append(dateTd)
                .append(actions);
            
            tableBody.append(row);
        }

        table.append(tableBody);
        $('#sentMessages').append(table);
        showViewArchiveSent();

        $('#sentMessages button').click(deleteMessage);
    }

    function deleteMessage (event) {
        let messageId = event.currentTarget.getAttribute('data-message-id');
        let deleteMessageRequest = {
            method: 'DELETE',
            url: `${kinveyBaseUrl}/appdata/${kinveyAppKey}/messages/${messageId}`,
            headers: getUserHeaders()
        };

        $.ajax(deleteMessageRequest)
            .then(loadSentMessages)
            .then(() => showInfoBox('Message deleted.'))
            .catch(handleAjaxError);
    }
}



/*
    Send message functions
*/
function loadUsers (event) {
    $('#msgRecipientUsername').empty();

    let authToken = sessionStorage.getItem('authToken');
    let username = sessionStorage.getItem('username');
    let getUserRequest = {
        method: 'GET',
        url: `${kinveyBaseUrl}/user/${kinveyAppKey}/`,
        headers: getUserHeaders()
    };

    $.ajax(getUserRequest)
        .then(displayUsersInSelectList)
        .catch(handleAjaxError);

    function displayUsersInSelectList (response) {
        let usersSelectList = $('#msgRecipientUsername');

        for (let user of response) {
            let option = $('<option>').val(user.username).text(formatSender(user.name, user.username));
            usersSelectList.append(option);
        }


        showViewSendMessage();
    }
}

function sendMessage (event) {
    event.preventDefault();
    let messageData = {
        sender_username: sessionStorage.getItem('username'),
        sender_name: sessionStorage.getItem('name') || null,
        recipient_username: $('#msgRecipientUsername').val(),
        text: $('#msgText').val()
    };

    let sendMessageRequest = {
        method: 'POST',
        url: `${kinveyBaseUrl}/appdata/${kinveyAppKey}/messages`,
        headers: getUserHeaders(),
        data: JSON.stringify(messageData)
    };

    $.ajax(sendMessageRequest)
        .then(loadSentMessages)
        .then(() => showInfoBox('Message sent.'))
        .catch(handleAjaxError);
}



/*
    Navbar menu links functions
*/
function showHideMenuLinks () {
    if (sessionStorage.getItem('authToken')) {
        // Logged in user
        $('.useronly').show();
        $('.anonymous').hide();
    } else {
        // Not logged in user
         $('.useronly').hide();
        $('.anonymous').show();
    }
}


/*
    Show views functions
*/
function showViewHome () {
    if (sessionStorage.getItem('authToken')) {
        showView('viewUserHome');
    } else {
        showView('viewAppHome');
    }
}

function showViewLogin () {
    showView('viewLogin');
}

function showViewRegister () {
    showView('viewRegister');
}

function showViewMyMessages () {
    showView('viewMyMessages');
}

function showViewArchiveSent () {
    showView('viewArchiveSent');
}

function showViewSendMessage () {
    showView('viewSendMessage');
}

function showView (viewName) {
    $('main > section').hide();
    $('#msgText').val('');
    $(`#${viewName}`).show();
}



/*
    Logout user functions
*/
function logoutUser () {
    let logoutUserRequest = {
        method: 'POST',
        url: `${kinveyBaseUrl}/user/${kinveyAppKey}/_logout`,
        headers: getUserHeaders()
    };

    $.ajax(logoutUserRequest)
        .then(() => sessionStorage.clear())
        .then(showHideMenuLinks)
        .then(showViewHome)
        .then(() => showInfoBox('Logout successful.'))
        .catch(handleAjaxError);
}



/*
    Exam helper functions
*/
function formatDate(dateISO8601) {
    let date = new Date(dateISO8601);
    if (Number.isNaN(date.getDate())) {
        return '';
    }

    return date.getDate() + '.' + padZeros(date.getMonth() + 1) +
        "." + date.getFullYear() + ' ' + date.getHours() + ':' +
        padZeros(date.getMinutes()) + ':' + padZeros(date.getSeconds());

    function padZeros(num) {
        return ('0' + num).slice(-2);
    }
}

function formatSender (name, username) {
    if (!name) {
        return username;
    } else {
        return username + ' (' + name + ')';
    }
}

function getUserHeaders () {
    return {
        'Authorization': `Kinvey ${sessionStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
    };
}

(function () {
    let authorField = $('#author');
    let messageField = $('#content');
    let sendButton = $('#submit');
    let refreshButton = $('#refresh');
    let chatContent = $('#messages');

    reloadChatData();
    refreshButton.on('click', reloadChatData);
    sendButton.on('click', sendMessage);

    function sendMessage () {
        let author = authorField.val();
        let content = messageField.val();
        authorField.val('');
        messageField.val('');

        let date = new Date();
        let messageDate = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        let newMessage = { author, content, date: messageDate };

        let request = {
            method: 'POST',
            url: 'https://messenger-25aaf.firebaseio.com/messages.json',
            data: JSON.stringify(newMessage)
        };

        if (content === '' || content.trim().length === 0) {
            displayErrorMessage();
        } else {
            $.ajax(request)
                .then(reloadChatData)
                .catch(displayErrorMessage);
        }
    }

    function displayMessages (messages) {
        let resultChatContent = '';

        for (let index in messages) {
            let message = messages[index];
            let currentLine = `[${message.date}] ${message.author}: ${message.content}\n`;
            resultChatContent += currentLine;
        }

        chatContent.val(resultChatContent);
    }

    function reloadChatData () {
        let request = {
            method: 'GET',
            url: 'https://messenger-25aaf.firebaseio.com/messages.json'
        };

        $.ajax(request)
            .then(displayMessages)
            .catch(displayErrorMessage);
    }

    function displayErrorMessage () {
        let errorDiv = $('<div>');
        errorDiv
            .css({
                background: 'red',
                color: 'white',
                fontWeight: 'bold',
                fontSize: 30
            })
            .text('Error');
        $('#controls').prepend(errorDiv);
        errorDiv.fadeOut(5000);
    }

}());

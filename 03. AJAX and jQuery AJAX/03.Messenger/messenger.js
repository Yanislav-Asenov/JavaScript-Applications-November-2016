function attachEvents() {
    const baseUrl = 'https://messenger-25aaf.firebaseio.com/messages';
    let authorField = $('#author');
    let messageField = $('#content');
    let sendButton = $('#submit');
    let refreshButton = $('#refresh');
    let chatContent = $('#messages');

    refreshButton.on('click', reloadChatData);
    sendButton.on('click', sendMessage);

    function sendMessage () {
        let author = authorField.val();
        let content = messageField.val();
        authorField.val('');
        messageField.val('');

        let date = new Date();
        let newMessage = { author, content };

        let request = {
            method: 'POST',
            url: `${baseUrl}.json`,
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
            let currentLine = `${message.author}: ${message.content}\n`;
            resultChatContent += currentLine;
        }

        chatContent.val(resultChatContent);
        chatContent.text(resultChatContent);
    }

    function reloadChatData () {
        let request = {
            method: 'GET',
            url: `${baseUrl}.json`
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
}

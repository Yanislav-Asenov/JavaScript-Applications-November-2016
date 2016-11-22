function attachEvents () {
    let baseUrl = 'https://phonebook-1f65b.firebaseio.com/phonebook';
    let phonebook = $('#phonebook');

    $('#btnLoad').on('click', loadContacts);

    $('#btnCreate').on('click', createNewContact);

    function createNewContact () {
        let personNameInputElement = $('#person');
        let personPhoneInputElement = $('#phone');
        let person = personNameInputElement.val();
        let phone = personPhoneInputElement.val();
        personNameInputElement.val('');
        personPhoneInputElement.val('');

        let newContact = {
            person,
            phone
        };
        let createRequest = {
            method: 'POST',
            url: baseUrl + '.json',
            data: JSON.stringify(newContact)
        };

        $.ajax(createRequest)
            .then(loadContacts)
            .catch(displayError);
    }

    function loadContacts () {
        $.get(baseUrl + '.json')
            .then(displayContacts)
            .catch(displayError);
    }

    function displayContacts (contacts) {
        phonebook.empty();
        let keys = Object.keys(contacts);

        for (let key of keys) {
            let contact = contacts[key];
            let li = $('<li>');
            li.text(`${contact.person} - ${contact.phone} `);
            let deleteLink = $(`<button>[Delete]</button>`);
            deleteLink.on('click', function () {
                deleteContact(key);
            });
            li.append(deleteLink);
            phonebook.append(li);
        }
    }

    function displayError (err) {
        let errorDiv = $('<div>')
                        .css('background', 'red')
                        .css('font-weight', 'bold')
                        .css('font-size', '18')
                        .css('color', 'white')
                        .text(`Error: Cannot load contacts`)
                        .fadeOut(5000);
        $('body').prepend(errorDiv);
    }

    function deleteContact (contactKey) {
        let deleteRequest = {
            method: 'DELETE',
            url: baseUrl + `/${contactKey}.json`
        };

        $.ajax(deleteRequest)
            .then(loadContacts)
            .catch(displayError);
    }
}

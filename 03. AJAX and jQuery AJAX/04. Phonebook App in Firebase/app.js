(function (){
    let baseUrl = 'https://phonebook-1f65b.firebaseio.com/phonebook';
    let phonebook = $('#phonebook');

    $('#btnLoad').on('click', function () {
        loadContacts();
    });

    $('#btnCreate').on('click', function () {
        createNewContact();
    });

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
            .then(function () {
                $('.create-phone-info').text('Success').css('background', 'lightgreen').fadeOut(3000);
            })
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

        phonebook.append($('<li class="heading-ul-row">Person   -   Phone</li>'));
        for (let key of keys) {
            let contact = contacts[key];
            let li = $('<li>');
            li.text(`${contact.person} - ${contact.phone} `);
            let deleteLink = $(`<a href="#">[Delete]</a>`);
            deleteLink.on('click', function () {
                deleteContact(key, this);
            });
            li.append(deleteLink);
            phonebook.append(li);
        }
    }

    function displayError (err) {
        phonebook.empty();
        let errorLi = $(`<li>Error</li>`);
        phonebook.append(errorLi);
    }

    function deleteContact (contactKey, eventTarget) {
        let deleteRequest = {
            method: 'DELETE',
            url: baseUrl + `/${contactKey}.json`
        };

        $.ajax(deleteRequest)
            .then(function () {
                $(eventTarget).parent().remove();
            })
            .catch(displayError);
    }
}());
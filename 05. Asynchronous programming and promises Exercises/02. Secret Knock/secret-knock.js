function solve () {
    let baseUrl = 'https://baas.kinvey.com/appdata/kid_BJXTsSi-e/knock';
    let username = 'guest';
    let password = 'guest';
    let base64auth = btoa(`${username}:${password}`);
    let authHeaders = {
        Authorization: `Basic ${base64auth}`
    };

    let message = 'Knock Knock.';
    console.log(message);
    makeRequet(message);

    function makeRequet (message) {
        let request = {
            method: 'GET',
            url: `${baseUrl}?query=${message}`,
            headers: authHeaders
        };

        $.ajax(request)
            .then(function (response) {
                console.log(response.answer);
                if (!response.message) {
                    return;
                }
                message = response.message;
                console.log(response.message);
                makeRequet(message);
            });
    }
}

solve();

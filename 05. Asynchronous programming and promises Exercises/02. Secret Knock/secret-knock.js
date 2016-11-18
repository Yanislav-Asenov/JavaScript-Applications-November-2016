function solve () {
    let baseUrl = 'https://baas.kinvey.com/appdata/kid_BJXTsSi-e/knock';
    let appKey = 'kid_BJXTsSi-e';
    let appSecret = '447b8e7046f048039d95610c1b039390';
    let username = 'guest';
    let password = 'guest';
    let base64auth = btoa(`${username}:${password}`);
    let authHeaders = {
        Authorization: `Basic ${base64auth}`
    };

    let message = 'Knock Knock.';

    getRequet(message);

    function getRequet (message) {
        if (!message) {
            return;
        }
        
        let getRequest = {
            method: 'GET',
            url: `${baseUrl}?query=${message}`,
            headers: authHeaders
        };

        $.ajax(getRequest)
            .then(function (response) {
                getRequet(response.message);
                console.log(response.message);
                console.log(response.answer);
            });
    }
}

solve();

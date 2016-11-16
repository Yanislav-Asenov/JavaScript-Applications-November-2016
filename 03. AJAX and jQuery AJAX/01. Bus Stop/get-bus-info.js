(function (){
    let busesUl = $('#buses');
    let stopNameContainer = $('#stopName');

    function getInfo () {
        let stopId = $('#stopId').val();
        let request = {
            url: `https://judgetests.firebaseio.com/businfo/${stopId}.json`,
            method: 'GET'
        };

        $.ajax(request)
            .then(loadBusesInfo)
            .catch(displayError);

    }

    function loadBusesInfo (data) {
        busesUl.empty();
        stopNameContainer.text(data.name);

        for (let index in data.buses) {
            let li = $(`<li>Bus ${index} arrives in ${data.buses[index]}</li>`);
            busesUl.append(li);
        }
    }

    function displayError () {
        stopNameContainer.text('Error');
    }
}());

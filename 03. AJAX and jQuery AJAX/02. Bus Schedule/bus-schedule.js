(function (){
    let currentStop = 'depot';
    let departButton = $('#depart');
    let arriveButton = $('#arrive');
    let infoBox = $('#info');

    $('#depart').on('click', function () {
        getNextStop();
    });

    $('#arrive').on('click', function () {
        getArrivingInfo();
    });

    function getArrivingInfo () {
        let getRequest = {
            url: `https://judgetests.firebaseio.com/schedule/${currentStop}.json`,
            method: 'GET'
        };

         $.ajax(getRequest)
            .then(showArrivingInfo)
            .catch(showError);
    }

    function showArrivingInfo (data) {
        infoBox.text(`Arriving at ${data.name}`);
        departButton.prop("disabled", false);
        arriveButton.prop("disabled", true);
        currentStop = data.next;
    }

    function getNextStop () {
        let getRequest = {
            url: `https://judgetests.firebaseio.com/schedule/${currentStop}.json`,
            method: 'GET'
        };

        $.ajax(getRequest)
            .then(updateInfoBox)
            .catch(showError);
    }

    function updateInfoBox (data) {
        infoBox.text(`Next stop ${data.name}`);
        departButton.prop("disabled", true);
        arriveButton.prop("disabled", false);
    }

    function showError () {
        infoBox.text('Error');
    }
}());

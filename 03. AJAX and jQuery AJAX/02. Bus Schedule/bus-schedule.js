function solve() {
    let apiUrl = 'https://judgetests.firebaseio.com/schedule/';
    let currentStop = 'depot';
    let nextStop = 'depot';

    function depart() {
        $.ajax({
            method: 'GET',
            url: apiUrl + currentStop + '.json',
            success: function (data) {
                nextStop = data.next;
                $('#info').find('span').text(`Next stop ${data.name}`);
                $('#depart').attr('disabled', 'disabled');
                $('#arrive').removeAttr('disabled');
            }
        });
    }

    function arrive() {
        $.ajax({
            method: 'GET',
            url: apiUrl + currentStop + '.json',
            success: function (data) {
                $('#info').find('span').text(`Arriving at ${data.name}`);
                currentStop = nextStop;
                $('#arrive').attr('disabled', 'disabled');
                $('#depart').removeAttr('disabled');
            }
        });
    }

    return {
        depart,
        arrive
    };
}

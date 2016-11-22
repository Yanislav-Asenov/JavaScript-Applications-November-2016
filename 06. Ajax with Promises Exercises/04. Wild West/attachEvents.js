let appKey = 'kid_SyNh07Wfl';
let baseUrl = 'https://baas.kinvey.com';
let username = 'guest';
let password = 'guest';
let base64auth = btoa(`${username}:${password}`);
let authHeaders = {
    'Authorization': `Basic ${base64auth}`,
    'Content-Type': 'application/json'
};
let playersContainer;
let newPlayerName;

function attachEvents() {
    newPlayerName = $('#addName');
    playersContainer = $('#players');
    $('#save').click(savePlayerProgress);
    $('#addPlayer').click(addPlayer);
    loadPlayers(); 
}

function savePlayerProgress (event) {
    
}

function loadPlayers () {
    let getPlayersRequest = {
        method: 'GET',
        url: `${baseUrl}/appdata/${appKey}/players`,
        headers: authHeaders
    };

    $.ajax(getPlayersRequest)
        .then(displayPlayers)
        .catch(displayError);
}

function displayPlayers (players) {
    let html = '';

    for (let player of players) {
        html += `<div class="player" data-id="${player._id}">
                    <div class="row">
                        <label>Name:</label>
                        <label class="name">${player.name}</label>
                    </div>
                    <div class="row">
                        <label>Money:</label>
                        <label class="money">${player.money}</label>
                    </div>
                    <div class="row">
                        <label>Bullets:</label>
                        <label class="bullets">${player.bullets}</label>
                    </div>
                    <button class="play">Play</button>
                    <button class="delete" data-id="${player._id}">Delete</button>
                </div>`;
    }

    playersContainer.html(html);
    attachPlayersEvents();
}

function attachPlayersEvents() {
    $('.delete').click(deletePlayer);
}

function addPlayer (event) {
    let newPlayer = {
        name: newPlayerName.val(),
        money: 500,
        bullets: 6
    };
    newPlayerName.val('');

    let addNewPlayerRequest = {
        method: 'POST',
        url: `${baseUrl}/appdata/${appKey}/players`,
        headers: authHeaders,
        data: JSON.stringify(newPlayer)
    };

    $.ajax(addNewPlayerRequest)
        .then(loadPlayers)
        .catch(displayError);
}

function deletePlayer (event) {
    let playerId = $(event.currentTarget).attr('data-id');
    let deletePlayerRequest = {
        method: 'DELETE',
        url: `${baseUrl}/appdata/${appKey}/players/${playerId}`,
        headers: authHeaders
    };

    $.ajax(deletePlayerRequest)
        .then(loadPlayers)
        .catch(displayError);
}

function displayError (error) {

}

function loadRepos () {
    $('#repos').empty();

    let username = $('#username').val();
    let url = `https://api.github.com/users/${username}/repos`;

    return $.ajax({
        url,
        success: displayRepos,
        error: displayError
    });

    function displayRepos (repositories) {
        for (let repository of repositories) {
            let li = $(`<li><a href="${repository.html_url}">${repository.full_name}</a></li>`);
            $('#repos').append(li);
        }
    }

    function displayError (err) {
        $('#repos').append($('<li>Error</li>'));
    }
}

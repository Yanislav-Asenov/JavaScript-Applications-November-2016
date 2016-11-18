$(attachEvents);

function attachEvents () {
    const baseUrl = 'https://baas.kinvey.com/appdata/kid_B1iu1jo-l';
    const appId = 'kid_B1iu1jo-l';
    const appSecret = 'abde59139e534909bbc8d06a2e13696f';
    const username = 'guest';
    const password = 'guest';
    const base64auth = btoa(`${username}:${password}`);
    const authHeaders = {
        Authorization: 'Basic ' + base64auth
    };

    let postsSelectList = $('#posts');
    postsSelectList.prop('selectedIndex', '-1');
    let postTitleHeader = $('#post-title');
    let postBodyParagraph = $('#post-body');
    let commentsUl = $('#post-comments');

    $('#btnLoadPosts').on('click', loadPosts);
    $('#btnViewPost').on('click', getPostDetails);

    function getPostDetails () {
        let postId = postsSelectList.val();
        let getPostRequest = $.ajax({
            method: 'GET',
            headers: authHeaders,
            url: `${baseUrl}/posts/${postId}`
        });

        let getPostCommentsRequest = $.ajax({
            method: 'GET',
            headers: authHeaders,
            url: `${baseUrl}/comments/?query={"post_id":"${postId}"}`
        });

        Promise
            .all([getPostRequest, getPostCommentsRequest])
            .then(displayPostDetails)
            .catch(displayError);
    }

    function displayPostDetails ([post, comments]) {
        postTitleHeader.text(post.title);
        postBodyParagraph.text(post.body);

        commentsUl.empty();
        for (let comment of comments) {
            let commentLi = $('<li>').text(comment.body);
            commentsUl.append(commentLi);
        }
    }

    function loadPosts () {
        let getPostsRequest = {
            method: 'GET',
            headers: authHeaders,
            url: `${baseUrl}/posts`
        };

        $.ajax(getPostsRequest)
            .then(addPostsToSelectList)
            .catch(displayError);
    }

    function addPostsToSelectList (posts) {
        postsSelectList.empty();
        for (let post of posts) {
            let option = $('<option>')
                            .val(post._id)
                            .text(post.title);

            postsSelectList.append(option);
        }

        let errorOption = $('<option value="Test pri nevaliden post">Nevaliden post(Test za greshka)</option>');
        postsSelectList.append(errorOption);
    }

    function displayError (err) {
        postTitleHeader.text('');
        postBodyParagraph.text('');
        console.log('Error: ' + err.message);
        let errorDiv = $('<div>')
                .css({
                    background: 'red',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '20',
                })
                .text('Error: ' + err.statusText)
                .fadeOut(5000);
        $('body').prepend(errorDiv);
    }
}

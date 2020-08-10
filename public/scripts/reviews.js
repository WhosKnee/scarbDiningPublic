$(document).ready(function () {
    let userRating;
    let url = window.location.pathname;
    let restaurantId = url.substring(url.indexOf('/') + 1, url.indexOf('/reviews'));

    function send(method, url, data, callback) {
        let xhr = new XMLHttpRequest();
        xhr.onload = function () {
            if (xhr.status !== 200) callback("[" + xhr.status + "]" + xhr.responseText, null);
            else callback(null, JSON.parse(xhr.responseText));
        };
        xhr.open(method, url, true);
        if (!data) xhr.send();
        else {
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(data));
        }
    };
            
    // adapted from https://stackoverflow.com/questions/8118266/integrating-css-star-rating-into-an-html-form
    $(".rating input:radio").attr("checked", false);

    $('.rating span label + img').click(function (e) {
        $(".rating span").removeClass('checked');
        $(this).parent().addClass('checked');
        userRating = $(this).prev().prev('.rating-star')[0].value;
    });

    $('#review-text-submit-btn').click(() => {
       let username = $("#user-id").val();
       let reviewComment = $('#review-text').val();

       if (userRating) {
           send("POST", `/${restaurantId}/reviews/`, {
               user_id: username,
               comment: reviewComment,
               rating: userRating
           }, function (err, res) {
               if (err) {
                alert('error');
               } else {
                window.location.href = url;
               }
           });
       }
    });
});
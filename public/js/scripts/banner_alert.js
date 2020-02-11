function successBannerAlert(message) {
    $("#banner_text").html(message)
    $("#banner_box").addClass('on').addClass('success')
                            .removeClass('none').removeClass('fail').removeClass('off');
    setTimeout(function() {
        $("#banner_box").addClass('off').removeClass('on');
    }, 2500)
}

function failBannerAlert(message) {
    $("#banner_text").html(message)
    $("#banner_box").addClass('on').addClass('fail')
                            .removeClass('none').removeClass('success').removeClass('off');
    setTimeout(function() {
        $("#banner_box").addClass('off').removeClass('on');
    }, 2500)
}
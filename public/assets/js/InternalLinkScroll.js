/// <reference path="jQuery/jquery-3.1.1.min.js" />
$(document).ready(function () {
    $('a[href^="#"]').on('click', function (e) {
        e.preventDefault();

        var target = this.hash;
        var $target = $(target)-50;

        $('html, body').stop().animate({
            'scrollTop': $target.offset().top
        }, 1900, 'swing', function () {
            window.location.hash = target;
        });
    });
});

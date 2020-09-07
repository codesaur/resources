var Boot4 = function() {
    return {
        init: function(settings) {
            $('.dropdown-sub-item').each(function(i, obj) {
                let archor = $(obj);
                if (archor.hasClass('active') && ! archor.hasClass('language-item')) {
                    let parent_li = archor.closest('li');
                    if (parent_li.length) {
                        parent_li.children('.nav-link').addClass('active text-light');
                    }
                }
            });

            var btnScrollToTop = $('.scroll-to-top');        
            if (btnScrollToTop.length) {
                $(window).scroll(function() {
                    if ($(window).scrollTop() > 200) {
                        btnScrollToTop.addClass('show');
                    } else {
                        btnScrollToTop.removeClass('show');
                    }
                });

                btnScrollToTop.on('click', function(e) {
                    e.preventDefault();
                    $('html, body').animate({scrollTop:0}, 'slow');
                });
            }
        }
    }
} ();

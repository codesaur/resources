/* global Dashboard */

(function($) {
    $.fn.Form = function(options) {
        var settings = $.extend(true, {
            validation: {
                focusInvalid: true,
                ignore: '',
                rules: {},
                messages: {},
                notify: {
                    title:  'Error',
                    notice: 'You have some form errors. Please check below.'
                }
            }
        }, options);
        
        var validator;
        var button = $(this);
        var form = button.closest('form');
        var container = $(settings.container);

        validator = form.validate({
            ignore: settings.validation.ignore,
            rules: settings.validation.rules,
            messages: settings.validation.messages,
            focusInvalid: settings.validation.focusInvalid,
            invalidHandler: function(event, validator) {
                if (typeof container !== 'undefined') {
                    Dashboard.scroll(container);
                } else {
                    Dashboard.scroll(form);
                }
                Dashboard.notify('error', settings.validation.notify.title, settings.validation.notify.notice);
            }
        });

        this.click(function(e) {
            e.preventDefault();
            
            if (validator.form()) {
                Dashboard.submit(form, button);
            } else {
                validator.focusInvalid();
            }
        });
        
        return (typeof validator !== 'undefined') ? validator : this;
    };
} (jQuery));

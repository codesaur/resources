/* global Dashboard, bootbox */

(function($) {
    $.fn.DeletePrompt = function(options) {
        var settings = $.extend(true, {
            selector: '.delete',
            inputType: 'text',
            ajax: {
                url:    'javascript:;',
                method: 'POST'
            },
            data: {
                /* u desire */
            },
            text: {
                yes:      'Yes',
                no:       'No',
                title:    'Confirmation',
                question: '<p class="text-danger mb-3"><i class="la la-trash"></i> Are you sure to delete this record?</p>'
            }            
        }, options);

        if (this.is('a')) {
            this.click(function(e) {
                e.preventDefault();
                
                handler($(this));
            });
        } else {
            this.on('click', settings.selector, function (e) {
                e.preventDefault();
                
                handler($(this));
            });
        }
        
        var handler = function(button) {
            settings.data['id'] = button.attr('href');

            if (typeof button.attr('alias') !== 'undefined') {
                settings.data['table'] = button.attr('alias');
            }
            
            if (typeof button.attr('logger') !== 'undefined') {
                settings.data['logger'] = button.attr('logger');
            }

            if (typeof button.attr('files_id') !== 'undefined') {
                settings.data['files_id'] = button.attr('files_id');
            }

            bootbox.prompt({
                title: settings.text.title,
                message: settings.text.question,
                inputType: settings.inputType,
                buttons: {
                    confirm: {
                        label: '<i class="fa fa-check"></i> ' + settings.text.yes,
                        className: 'btn-primary'
                    },
                    cancel: {
                        label: '<i class="fa fa-times"></i> ' + settings.text.no,
                        className: 'btn-danger'
                    }
                },
                callback: function (result) {
                    if (result) {                        
                        options.data['prompt_result'] = result;
                        
                        var form = document.createElement('form');
                        
                        let idStr = 'form' + (document.forms.length + 1);

                        form.id = idStr;
                        form.action = settings.ajax.url;
                        form.method = settings.ajax.method;
                        for (let key in settings.data) {
                            var element = document.createElement('input');
                            element.name = key;
                            element.type = 'hidden';
                            element.value = settings.data[key];

                            form.appendChild(element);
                        }
                        document.body.appendChild(form);
                        Dashboard.submit($('#' + idStr), button);
                        document.body.removeChild(form);
                    }
                }
            });
        };
        
        return this;
    }; 
} (jQuery));

/* global swal, ClassicEditor */

var Dashboard = function() {
    var options;
    
    var handleSubmit = function(selector, modal = null) {
        $(selector).click(function(e) {
            e.preventDefault();

            var button = $(this);
            var form = button.closest('form');
            
            if (form) {
                let novalidate = form.attr('novalidate');
                if (form.hasClass('needs-validation')
                        && novalidate !== false && 
                        typeof novalidate !== typeof undefined) {
                    let valid = form[0].checkValidity();
                    form[0].classList.add('was-validated');
                    if (valid === false) {
                        Dashboard.notify('error', options.text.notice, options.text.form_error);
                    } else {
                        Dashboard.submit(form, button, modal);
                    }
                } else {
                    Dashboard.submit(form, button, modal);
                }                
            }
        });
    };
    
    var setHtml = function(selector, html) {
        var ele = document.querySelector(selector);

        if (ele) {
            ele.innerHTML = html;
        }
    };
    
    return {
        init: function(settings) {
            options = $.extend(true,
            {
                submit: {
                    selector: '.submit'
                },
                modal: {
                    selector: '#modal',
                    submit:   '.submit'
                },
                notify: {
                     position: 'top',
                     velocity: 200,
                     time:     2500
                },
                text: {
                    notice:        'Notice',
                    error:         'Error',
                    processing:    'Processing ...',
                    invalid_res:   'Invalid response!',
                    conn_error:    'Connection error!',
                    cant_complete: 'Can\'t complete request'
                }
            }, settings);
            
            document.querySelectorAll('[data-toggle="modal"]').forEach(function(link) {
                link.addEventListener('click', function() {
                    Dashboard.modal(link);
                });
            });
                        
            handleSubmit(options.submit.selector);
            
            var modalLoadingContent = document.querySelector(options.modal.selector).innerHTML;
            $(options.modal.selector).on('hidden.bs.modal', function() {
                setHtml(options.modal.selector, modalLoadingContent); 
            });
        },
        
        submit: function(form, button, modal = null) {
            $(document).ajaxStop($.unblockUI);
            
            $.blockUI({message: options.text.processing, baseZ: 2000});
            
            if (typeof button !== 'undefined') {
                button.attr('data-spinner-type', 'grow');
                button.addClass('btn-spinner');
                button.buttonLoader('start');
                button.attr('disabled', true);
            }
            
            if (typeof Dashboard.textarea !== 'undefined') {
                for (var item in Dashboard.textarea) {
                    if (typeof Dashboard.textarea[item] !== 'undefined') {
                        Dashboard.textarea[item].destroy(); 
                        Dashboard.textarea[item] = undefined;
                    }
                }
            }

            var data = {};
            var a = form.serializeArray();
            $.each(a, function() {
                if (data[this.name]) {
                    if (!data[this.name].push) {
                        data[this.name] = [data[this.name]];
                    }
                    data[this.name].push(this.value || '');
                } else {
                    data[this.name] = this.value || '';
                }
            });

            form.ajaxSubmit({
                data: data,
                url: form.attr('action'),
                method: form.attr('method'),
                success: function(response, status, xhr)
                {
                    var alert = (typeof response.alert !== 'undefined') ? response.alert : 'notifyMe';
                    var type = (typeof response.status !== 'undefined') ? response.status : 'default';
                    var title = (typeof response.title !== 'undefined') ? response.title : options.text.notice;
                    var message = (typeof response.message !== 'undefined') ? response.message : options.text.invalid_res;

                    if (alert === 'SweetAlert') {
                        var sweet = {
                            /*position: 'top-right',*/
                            title: title,
                            text: message,
                            icon: type === 'default' ? 'warning' : (type === 'info' ? 'success' : type)                        
                        };

                        if (typeof response.confirm !== 'undefined') {
                            sweet.confirmButtonClass = 'btn shadow-sm btn-lg';
                            if (type !== 'default') {
                                sweet.confirmButtonClass += ' btn-' + (type === 'error' ? 'danger' : type);
                            }
                        } else {
                            sweet.timer = 1500;
                            sweet.showConfirmButton = false;
                        }

                        swal.fire(sweet).then((value) => {
                            Dashboard.complete(type, button, modal, response);
                        });
                    } else {
                        Dashboard.notify(type, title, message);
                        Dashboard.complete(type, button, modal, response);
                    }
                },
                error: function (xhr, status, error)
                {
                    Dashboard.notify('default', options.text.error, options.text.cant_complete);
                    
                    if (typeof button !== 'undefined') {
                        button.buttonLoader('stop');
                        button.attr('disabled', false);
                        button.removeClass('btn-spinner');
                        button.removeAttr('data-spinner-type');
                    }
                }
            });
        },
        
        complete: function(type, button, modal, response) {
            if (typeof button !== 'undefined') {
                if (type === 'success' || type === 'info') {
                    if (typeof button.attr('on-success') !== 'undefined') {
                        eval(button.attr('on-success'));
                    } 
                    
                    if (typeof button.attr('pre-img') !== 'undefined') {
                        document.querySelectorAll('[id="'+ button.attr('pre-img') + '"]').forEach(function(element) {
                            if (element.hasAttribute('src')) {
                                element.setAttribute('src', '');
                            }
                            element.style.display = 'none';
                        });
                        button.hide();
                    } else {
                        var table = null;
                        if (typeof button.attr('data-table') !== 'undefined') {
                            table = $('table#' + button.attr('data-table'));
                        } else {
                            table = button.closest('table');
                        }
                        if (table && table.length && $.fn.DataTable.isDataTable(table)) {
                            table.DataTable().ajax.reload(null, false);
                        }
                    }
                }
                
                button.buttonLoader('stop');
                button.attr('disabled', false);
                button.removeClass('btn-spinner');
                button.removeAttr('data-spinner-type');
            }

            if (modal) {
                if (type === 'success' || type === 'info') {
                    $(modal).modal('hide');
                }
            }
            if (typeof response.href !== 'undefined') {
                if (response.href !== 'javascript:;') {
                    window.location.href = response.href;
                }
            }
        },
        
        ajaxModal: function(parent, selector = '.ajax-modal') {
            parent.on('click', selector, function (e) {
                Dashboard.modal(this);
            });
        },
        
        modal: function(link) {
            var url = 'javascript:;';
            if (link.hasAttribute('href')) {
                url = link.getAttribute('href');
            } else if (link.hasAttribute('data-remote')) {
                url = link.getAttribute('data-remote');
            }

            if (url !== 'javascript:;') {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url);
                xhr.onload = function() {
                    if (xhr.status === 200) {
                        try {
                            var modal = link.getAttribute('data-target');
                            if (modal === null || modal === '') {
                                modal = options.modal.selector;
                            }
                            setHtml(modal, xhr.responseText);
                            handleSubmit(options.modal.submit, modal);
                            
                            var parser = new DOMParser();
                            var modalDocument = parser.parseFromString(xhr.responseText, 'text/html');
                            modalDocument.querySelectorAll('script[type="text/javascript"]').forEach(function(element) {
                                eval(element.innerHTML);
                            });
                        } catch(e) {
                        }
                    }
                };
                xhr.send();
            }
        },
        
        editor: function(id, btn = null) {
            if (typeof Dashboard.textarea === 'undefined') {
                Dashboard.textarea = [];
            }

            if (typeof Dashboard.textarea[id] !== 'undefined') {
                Dashboard.textarea[id].destroy();
                Dashboard.textarea[id] = undefined;
                if (btn) {
                    btn.innerHTML = 'html';
                }
            } else {
                ClassicEditor
                        .create(document.querySelector('#' + id))
                        .then(editor => Dashboard.textarea[id] = editor)
                        .catch(error => console.error(error));
                if (btn) {
                    btn.innerHTML = 'editor';
                }
            }
        },
        
        notify: function(type, title, text) {
            $(this).notifyMe(
                    options.notify.position,
                    type, title, text, //type: (info, success, error, default)
                    options.notify.velocity, options.notify.time);
        },
        
        text: function() {
            return options.text;
        },
        
        copy: function(elem) {
            var doc = document;
            var text = doc.getElementById(elem);            
            if (doc.body.createTextRange) { // ms
                var range = doc.body.createTextRange();
                range.moveToElementText(text);
                range.select();
            } else if (window.getSelection) { // moz, opera, webkit
                var selection = window.getSelection();            
                var range = doc.createRange();
                range.selectNodeContents(text);
                selection.removeAllRanges();
                selection.addRange(range);
            }
            document.execCommand('copy');
        },
        
        var_dump: function(obj) {
            var out = '';
            for (var i in obj) {
                out += i + ': ' + obj[i] + '\n';
            }
            alert(out);
            // or, if you wanted to avoid alerts...
            // var pre = document.createElement('pre');
            // pre.innerHTML = out;
            // document.body.appendChild(pre)
        }
    };
} ();

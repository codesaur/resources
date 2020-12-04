/* global plupload, Dashboard */

(function($) {
    $.fn.Plupload = function(options, callback) {
        var settings = $.extend(true, {
            url: 'javascript:;',
            DOM: {
                file_list: null,
                pick_files: null,
                upload_files: null
            },
            filters: {
                max_file_size: '2mb',
                prevent_duplicates: true,
                mime_types: [{title: 'Image files', extensions: 'jpg,gif,png'}]
            },
            texts: {
                remove:  'Remove',
                warning: 'Warning',
                failure: 'Failure',
                success: 'Success'
            },
            multipart_params : {
                real_name : "value"
            },
            runtimes: 'html5,flash,silverlight,html4',
            flash_swf_url: 'https://cdn.jsdelivr.net/gh/moxiecode/plupload/js/Moxie.swf',
            silverlight_xap_url: 'https://cdn.jsdelivr.net/gh/moxiecode/plupload/js/Moxie.xap'
        }, options);
        
        settings.container = $(this)[0];
        settings.browse_button = document.getElementById(settings.DOM.pick_files);

        settings.init = {
            PostInit: function() {
                $('#' + settings.DOM.file_list).html('');
                
                $('#' + settings.DOM.upload_files).removeClass('pluploader-ready btn-primary').addClass('btn-secondary');
                
                $('#' + settings.DOM.upload_files).click(function() {
                    if ($('#' + settings.DOM.upload_files).hasClass('pluploader-ready')) {
                        uploader.start();
                    }
                    
                    return false;
                });
                $('#' + settings.DOM.file_list).on('click', '.added-files .remove', function() {
                    uploader.removeFile($(this).parent('.added-files').attr('id'));

                    $(this).parent('.added-files').remove();
                    
                    if ($('#' + settings.DOM.file_list + ' .added-files').length > 0) {
                        $('#' + settings.DOM.upload_files).removeClass('btn-secondary').addClass('pluploader-ready btn-primary');
                    } else {
                        $('#' + settings.DOM.upload_files).removeClass('pluploader-ready btn-primary').addClass('btn-secondary');
                    }
                });
            },
            FilesAdded: function(up, files) {
                plupload.each(files, function(file) {
                    $('#' + settings.DOM.file_list).append('<div class="alert alert-info added-files" id="' + file.id + '">' + file.name + '(' + plupload.formatSize(file.size) + ') &nbsp;&nbsp; <span class="status badge badge-info"></span> <a href="javascript:;" style="margin-top:-5px" class="remove float-right btn btn-sm btn-danger text-lowercase"><i class="la la-trash"></i> ' + settings.texts.remove + '</a></div>');
                });
                
                if ($('#' + settings.DOM.file_list + ' .added-files').length > 0) {
                    $('#' + settings.DOM.upload_files).removeClass('btn-secondary').addClass('pluploader-ready btn-primary');
                } else {
                    $('#' + settings.DOM.upload_files).removeClass('pluploader-ready btn-primary').addClass('btn-secondary');
                }
            },
            /*BeforeUpload: function(up, file) {
                settings.multipart_params = {
                    real_name: file.name
                };
            },*/
            UploadProgress: function(up, file) {
                currentFileId = file.id;
                $('#' + file.id + ' > .status').html(file.percent + '%');
            },
            FileUploaded: function(up, file, response) {
                currentFileId = null;
                
                try {
                    var res = $.parseJSON(response.response);
                    if (!res.data) throw 'Invalid response!';
                    
                    $('#' + file.id + ' > .remove').remove();
                    $('#' + file.id).removeClass('added-files');
                    $('#' + file.id + ' > .status').removeClass('badge-light').addClass('badge-success').html('<i class="la la-check"></i> ' + settings.texts.success);

                    if (callback && typeof callback === "function") {
                        callback(file, res);
                    } else {
                        Dashboard.notify('success', settings.texts.success, 'Your file [' + file.name + '] was uploaded successfully.');
                    }
                }
                catch (err) {
                    $('#' + file.id + ' > .status').removeClass('badge-light').addClass('badge-danger').html('<i class="la la-warning"></i> ' + settings.texts.failure);
                    
                    if (err instanceof SyntaxError) err = 'Invalid request!';
                    else if (res && res.error && res.error.message) err = res.error.message;
                    
                    Dashboard.notify('error', settings.texts.failure, err);
                }

                if ($('#' + settings.DOM.file_list + ' .added-files').length > 0) {
                    $('#' + settings.DOM.upload_files).removeClass('btn-secondary').addClass('pluploader-ready btn-primary');
                } else {
                    $('#' + settings.DOM.upload_files).removeClass('pluploader-ready btn-primary').addClass('btn-secondary');
                }
            },
            Error: function(up, err) {
                if (currentFileId) {
                    $('#' + currentFileId + ' > .status').removeClass('badge-light').addClass('badge-danger').html('<i class="la la-warning"></i> ' + settings.texts.failure);
                    currentFileId = null;
                }
                
                Dashboard.notify('error', settings.texts.warning, err.message);
            }
        };
        
        var currentFileId = null;

        var uploader = new plupload.Uploader(settings);
        uploader.init();
        return uploader;
    };
} (jQuery));

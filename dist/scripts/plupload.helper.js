/* global plupload, Dashboard */

(function($) {
    $.fn.Plupload = function(options, callback) {
        var settings = $.extend(true, {
            container: $(this),
            url: 'javascript:;',
            runtimes: 'html5,flash,silverlight,html4',
            flash_swf_url: 'https://cdn.jsdelivr.net/gh/moxiecode/plupload/js/Moxie.swf',
            silverlight_xap_url: 'https://cdn.jsdelivr.net/gh/moxiecode/plupload/js/Moxie.xap',
            filters: {
                max_file_size: '2mb',
                mime_types: [{title: 'Image files', extensions: 'jpg,gif,png'}]
            },
            texts: {
                remove:  'Remove',
                warning: 'Warning',
                failed:  'Failed',
                done:    'Done'
            },
            DOM: {
                pickFile: null,
                fileList: null,
                uploadFiles: null
            }
        }, options);
        
        settings.browse_button = document.getElementById(settings.DOM.pickFile);
        
        settings.init = {
            PostInit: function() {
                $('#' + settings.DOM.fileList).html('');
                $('#' + settings.DOM.uploadFiles).click(function() {
                    uploader.start();
                    return false;
                });
                $('#' + settings.DOM.fileList).on('click', '.added-files .remove', function() {
                    uploader.removeFile($(this).parent('.added-files').attr("id"));

                    $(this).parent('.added-files').remove();
                });
            },
            FilesAdded: function(up, files) {
                plupload.each(files, function(file) {
                   currentFileId = file.id;
                   $('#' + settings.DOM.fileList).append('<div class="alert alert-info added-files" id="' + file.id + '">' + file.name + '(' + plupload.formatSize(file.size) + ') &nbsp;&nbsp; <span class="status badge badge-info"></span> <a href="javascript:;" style="margin-top:-5px" class="remove pull-right btn btn-sm btn-danger text-lowercase"><i class="fa fa-times"></i> ' + settings.texts.remove + '</a></div>');
                });
            },
            UploadProgress: function(up, file) {
                $('#' + file.id + ' > .status').html(file.percent + '%');
            },
            FileUploaded: function(up, file, response) {
                var res = $.parseJSON(response.response);
                if (res.status && res.status === 'success') {
                    $('#' + file.id + ' > .status').removeClass('badge-light').addClass('badge-success').html('<i class="fa fa-check"></i> ' + settings.texts.done);
                    $('#' + file.id + ' > .remove').addClass('hidden d-none');

                    callback(file, response);
                } else {
                    $('#' + file.id + ' > .status').removeClass('badge-light').addClass('badge-danger').html('<i class="fa fa-warning"></i> ' + settings.texts.failed);

                    Dashboard.notify('error', settings.texts.warning, res.error.message);
                }
            },
            Error: function(up, err) {
                if (currentFileId) {
                    $('#' + currentFileId + ' > .status').removeClass('badge-light').addClass('badge-danger').html('<i class="fa fa-warning"></i> ' + settings.texts.failed);
                }

                Dashboard.notify('error', settings.texts.warning, err.message);
            }
        };
        
        var uploader = new plupload.Uploader(settings);
        var currentFileId = null;

        return uploader;
    };
} (jQuery));

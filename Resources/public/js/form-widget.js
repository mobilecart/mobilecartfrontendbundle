var FormWidget = function(obj) {
    this.formEl = obj.formEl;
    this.elPrefix = obj.elPrefix;
    this.buttonEl = obj.buttonEl;
    this.attachEvents();
    return this;
};

FormWidget.prototype = {
    attachEvents: function() {
        var widget = this;

        // on submit
        widget.formEl.submit(function(e){
            e.preventDefault();
            widget.submitForm();
            return false;
        });

        // on click
        widget.buttonEl.on('click', function(e){
            e.preventDefault();
            widget.submitForm();
            return true;
        });

    },
    submitForm: function() {
        var widget = this;

        widget.buttonEl.hide();
        widget.buttonEl.siblings('.spinner').show();

        $('.has-error').removeClass('has-error');
        $('.invalid-tab').removeClass('invalid-tab');

        var formAction = widget.formEl.attr('action');
        var actionSep = '?';
        if (formAction.indexOf('?') > 0) {
            actionSep = '&';
        }

        $.ajax({
            type: 'POST',
            url: formAction + actionSep + 'format=json',
            data: widget.formEl.serialize(),
            dataType: 'json',
            success: function(response) {

                widget.buttonEl.siblings('.spinner').hide();
                widget.buttonEl.show();

                if (typeof(response['success']) != 'undefined' && response.success == 1) {

                    // redirect to success page
                    window.location = response.redirect_url;
                } else {

                    var invalid = {};
                    var errors = [];
                    if (typeof response['invalid'] != 'undefined') {
                        invalid = response.invalid;
                    }

                    if (typeof response['errors'] != 'undefined') {
                        errors = response.errors;
                    }

                    for (field in invalid) {
                        var message = invalid[field];
                        var inputId = widget.elPrefix + '_' + field;
                        if (typeof response['prefix'] != 'undefined') {
                            inputId = response.prefix + '_' + field;
                        }
                        var inputEl = $('#' + inputId);
                        inputEl.parent().addClass('has-error');
                    }

                    if (errors.length > 0) {
                        for (var x = 0; x < errors.length; x++) {
                            // todo : display error
                        }
                    }

                    widget.highlightInvalidTabs();
                }
            }
        });
    },
    highlightInvalidTabs: function() {
        $('div.form-section').each(function(){
            var section = $(this);
            var invalidFields = section.find('.has-error');
            if (invalidFields.length > 0) {
                var tab = $('#' + section.attr('data-tab'));
                tab.addClass('invalid-tab');
            }
        });
    }
};

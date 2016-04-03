
var CheckoutWidget = function(obj) {
    this.container = obj.container;
    this.sections = obj.sections;
    this.elPrefix = obj.formName;
    this.totalsDiscountsUrl = obj.totalsDiscountsUrl;
    this.totalsDiscountsSection = obj.totalsDiscountsSection;
    this.confirmOrderUrl = obj.confirmOrderUrl;
    this.confirmOrderModal = obj.confirmOrderModal;
    this.submitOrderUrl = obj.submitOrderUrl;
    this.submitOrderData = obj.submitOrderData;
    this.attachEvents();
    return this;
};

CheckoutWidget.prototype = {
    attachEvents: function() {
        var widget = this;

        $('.next-button').click(function(e){
            var self = $(this);
            self.hide();
            self.siblings('.spinner').show();
            widget.updateSection(self);
        });

        widget.confirmOrderModal.find('button.submit-order').click(function(e){
            var self = $(this);
            self.hide();
            self.siblings('.spinner').show();
            widget.submitOrder(self);
        });

        $('a.collapse-toggle').click(function(e){
            var self = $(this);
            if (self.find('.glyphicon-minus').length > 0) {
                self.find('.glyphicon-minus').removeClass('glyphicon-minus').addClass('glyphicon-plus');
            } else if (self.find('.glyphicon-plus').length > 0) {
                self.find('.glyphicon-plus').removeClass('glyphicon-plus').addClass('glyphicon-minus');
            }
        });

        $('#checkout_shipping_address_is_shipping_same').click(function(e){
            var chk = $(this);
            if (chk.is(':checked')) {
                $('.billing-input').each(function(){
                    var billing = $(this);
                    var elId = billing.attr('id');
                    var re = /billing/gi;
                    var shippingElId = elId.replace(re, 'shipping');
                    var shipping = $('#' + shippingElId);
                    shipping.val(billing.val());
                    shipping.attr('disabled', true);
                });
            } else {
                $('.shipping-input').attr('disabled', false);
            }
        });
    },
    updateSection: function(buttonEl) {

        var widget = this;

        // get section
        var sectionKey = buttonEl.data('section');
        var sectionData = widget.sections[sectionKey];
        var nextSectionKey = sectionData['next_section_id'];

        var section = $('#section-' + sectionKey);
        var heading = $('#heading-' + sectionKey);

        section.find('.has-error').removeClass('has-error');

        // build request from section
        var postData = {};

        // todo : look for input fields, if defined

        if (typeof sectionData['fields'] != 'undefined') {

            for (var x = 0; x < sectionData['fields'].length; x++) {
                var field = sectionData['fields'][x];
                var inputId = widget.elPrefix + '_' + sectionKey + '_' + field;
                var input = $('#' + inputId);
                postData[field] = input.val();
            }

        } else {

            section.find('input, select, textarea').each(function(e){
                var input = $(this);
                var name = input.attr('name');
                postData[name] = input.val();
            });
        }

        var url = sectionData['post_url'];

        // send request
        $.ajax({
            url: url,
            dataType: 'json',
            type: 'POST',
            data: postData
        }).done(function(response){

            buttonEl.show();
            buttonEl.siblings('.spinner').hide();

            // handle response
            if (typeof(response['success']) != 'undefined' && response.success == 1) {
                // show next section

                if (nextSectionKey.length > 0) {

                    var nextSection = $('#section-' + nextSectionKey);
                    var nextHeading = $('#heading-' + nextSectionKey);

                    if (nextSectionKey == widget.totalsDiscountsSection) {
                        widget.updateTotalsDiscounts(section, nextSection);
                    } else {
                        section.collapse('hide');
                        heading.find('.glyphicon-minus').removeClass('glyphicon-minus').addClass('glyphicon-plus');
                        nextSection.collapse('show');
                        nextHeading.find('.glyphicon-plus').removeClass('glyphicon-plus').addClass('glyphicon-minus');
                    }
                } else if (buttonEl.hasClass('final-step')) {
                    widget.updateConfirmOrderModal();
                }
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
                    var inputId = widget.elPrefix + '_' + sectionKey + '_' + field;
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
            }

            // todo: toggle +/- buttons

        });
    },
    updateTotalsDiscounts: function(section, nextSection) {
        var widget = this;
        var url = widget.totalsDiscountsUrl;
        var heading = section.siblings('.section-heading');
        var nextHeading = nextSection.siblings('.section-heading');
        $.ajax({
            url: url
        }).done(function(response){
            nextSection.find('.panel-body div.container').replaceWith(response);
            section.collapse('hide');
            heading.find('.glyphicon-minus').removeClass('glyphicon-minus').addClass('glyphicon-plus');
            nextSection.collapse('show');
            nextHeading.find('.glyphicon-plus').removeClass('glyphicon-plus').addClass('glyphicon-minus');
        });
    },
    updateConfirmOrderModal: function() {
        var widget = this;
        var url = widget.confirmOrderUrl;
        $.ajax({
            url: url
        }).done(function(response){
            widget.confirmOrderModal.find('div.modal-body').html(response);
            widget.confirmOrderModal.modal('show');
        });
    },
    preSubmitOrder: function() {
        // over-ride this method for submitting tokenized payments, etc
        return true;
    },
    submitOrder: function(buttonEl) {
        var widget = this;
        // open a section with errors, close all other sections

        if (!widget.preSubmitOrder()) {
            buttonEl.show();
            return false;
        }

        // send request
        $.ajax({
            url: widget.submitOrderUrl,
            dataType: 'json',
            type: 'POST',
            data: widget.submitOrderData
        }).done(function(response){

            buttonEl.siblings('.spinner').hide();

            // handle response
            if (typeof(response['success']) != 'undefined' && response.success == 1) {

                // redirect to success page
                window.location = response.redirect_url;

            } else {
                buttonEl.show();

                // todo : open invalid section, highlight invalid fields

            }
        });

        return false;
    }
};

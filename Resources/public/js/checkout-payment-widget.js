var CheckoutPaymentWidget = function(obj) {
    this.containerEl = obj.containerEl;
    this.buttonEl = obj.buttonEl;
    this.modalEl = obj.modalEl;
    this.postUrl = obj.postUrl;
    this.confirmOrderUrl = obj.confirmOrderUrl;
    this.submitOrderUrl = obj.submitOrderUrl;
    this.postData = {};
    this.postDataGetter = {};
    this.paymentMethod = '';
    this.submitCallbacks = [];
    this.attachEvents();
    return this;
};

CheckoutPaymentWidget.prototype = {
    attachEvents: function() {

        var widget = this;

        var selected = $('input.payment-option-input:checked').val();
        if (typeof selected != 'undefined' && selected.length > 0) {
            $('div.payment-option-form').hide();
            $('div.payment-option-form.payment-' + selected).show();
        }

        // handle radio inputs; show and hide sub-forms
        $('input.payment-option-input').click(function() {
            var self = $(this);
            var code = self.attr('data-code');
            $('div.payment-option-form').hide();
            $('div.payment-option-form.payment-' + code).show();
        });

        widget.modalEl.find('button.submit-order').click(function(e){
            var self = $(this);
            self.hide();
            self.siblings('.spinner').show();
            widget.submitOrder(self);
            return false;
        });

        widget.buttonEl.click(function(e){
            var self = $(this);
            self.hide();
            self.siblings('.spinner').show();
            widget.handlePayment();
            return false;
        });

        return this;
    },
    setPostData: function(postData) {
        this.postData = postData;
        return this;
    },
    getPostData: function() {
        return this.postData;
    },
    getMethodPostData: function(paymentMethod) {
        if (typeof this.postDataGetter[paymentMethod] != 'undefined') {
            this.postData = this.postDataGetter[paymentMethod]();
        }
        return this.postData;
    },
    addPostDataGetter: function(paymentMethod, callback) {
        this.postDataGetter[paymentMethod] = callback;
        return this;
    },
    setPostUrl: function(postUrl) {
        this.postUrl = postUrl;
        return this;
    },
    getPostUrl: function() {
        return this.postUrl;
    },
    setPaymentMethod: function(paymentMethod) {
        this.paymentMethod = paymentMethod;
        return this;
    },
    getPaymentMethod: function() {
        return this.paymentMethod;
    },
    addSubmitCallback: function(callback) {
        this.submitCallbacks.push(callback);
        return this;
    },
    getSubmitCallbacks: function() {
        return this.submitCallbacks;
    },
    updateModal: function() {
        var self = this;
        var url = self.confirmOrderUrl;
        $.ajax({
            url: url
        }).done(function(response){
            self.modalEl.find('div.modal-body').html(response);
            self.modalEl.modal('show');
        });
        return true;
    },
    handlePayment: function() {
        var self = this;
        var paymentMethod = $('input.payment-option-input:checked').attr('data-code');
        self.setPaymentMethod(paymentMethod);
        var postData = self.getMethodPostData(paymentMethod);

        if (typeof postData.callback == 'undefined') {
            self.submitPayment();
        } // otherwise, assume the callback will call submitPayment()

        return this;
    },
    submitPayment: function() {
        var self = this;

        // send request
        $.ajax({
            url: self.getPostUrl(),
            dataType: 'json',
            type: 'POST',
            data: self.getPostData()
        }).error(function(jqxhr, status, errorThrown){

            self.buttonEl.show();
            self.buttonEl.siblings('.spinner').hide();

        }).done(function(response){

            self.buttonEl.show();
            self.buttonEl.siblings('.spinner').hide();

            // handle response
            if (typeof(response['success']) != 'undefined' && response.success == true) {
                // show next section
                self.updateModal();
            } else {

            }
        });

        return true;
    },
    preSubmitOrder: function() {
        var self = this;
        var isValid = true;
        if (this.submitCallbacks.length > 0) {
            for (var x = 0; x < self.submitCallbacks.length; x++) {
                if (!self.submitCallbacks[x]()) {
                    isValid = false;
                }
            }
        }
        return isValid;
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
            data: {}
        }).done(function(response){

            buttonEl.siblings('.spinner').hide();

            // handle response
            if (typeof(response['success']) != 'undefined' && response.success == true) {

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

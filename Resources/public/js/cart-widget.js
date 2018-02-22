var CartWidget = function(obj) {
    this.containerEl = obj.containerEl;
    this.url = obj.url;
    this.updateShippingUrl = obj.updateShippingUrl;
    this.updateQtyUrl = obj.updateQtyUrl;
    this.updateCallback = obj.updateCallback;
    this.attachEvents();
    return this;
};

CartWidget.prototype = {
    containerEl: {},
    url: '',
    updateCallback: null,
    attachEvents: function() {
        var self = this;

        // Note : need to assume here that the elements are constantly being re-populated with ajax html responses

        // change qty on a cart item
        // change shipping method
        // change promo code, update

        self.containerEl.on('change', 'select[name="shipping_method"]', function(){

            self.containerEl.find('div.totals-container .spinner').show();

            var code = $(this).val();

            var values = {
                shipping_method: code
            };

            $.ajax({
                url: self.updateShippingUrl,
                method: 'POST',
                dataType: 'json',
                data: values
            }).done(function(){
                self.render();
            });
        });

        self.containerEl.on('change', 'select.multi-shipping', function(e){

            self.containerEl.find('div.totals-container .spinner').show();

            var postData = {};
            $('select.multi-shipping').each(function(){
                var self = $(this);
                var name = self.attr('name');
                postData[name] = self.val();
            });

            $.ajax({
                url: self.updateShippingUrl,
                method: 'POST',
                dataType: 'json',
                data: postData
            }).done(function(){
                self.render();
            });
        });

        self.containerEl.on('change', 'input.qty-input', function(e){
            self.updateCart();
        });

        self.containerEl.on('change', 'select.product-shipping', function(e){
            self.updateCart();
        });

    },
    updateCart: function() {
        var self = this;

        self.containerEl.find('.spinner').show();

        var postData = {};

        // first gather all qty inputs, and their values
        self.containerEl.find('input.qty-input').each(function(){
            var qtyInput = $(this);
            var key = qtyInput.attr('name');
            postData[key] = qtyInput.val();
        });

        /*
        $('select.product-shipping').each(function(){
            var self = $(this);
            var name = self.attr('name');
            postData[name] = self.val();
        }); //*/

        $.ajax({
            url: self.updateQtyUrl,
            method: 'POST',
            dataType: 'json',
            data: postData
        }).done(function(){
            self.render();
        });
    },
    render: function(skipCallback) {
        var self = this;

        self.containerEl.find('.spinner').show();

        $.ajax({
            url: self.url
        }).done(function(html){
            self.containerEl.html(html);
            if (skipCallback != true && typeof self.updateCallback != 'undefined') {
                self.updateCallback();
            }
        });

        return self;
    }
};

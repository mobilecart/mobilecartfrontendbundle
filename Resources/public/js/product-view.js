
App.models.ProductConfig = Backbone.Model.extend({});

// View for product view page
App.views.ProductView = Backbone.View.extend({
    events: {
        'click a.addtocart': 'addToCart'
    },
    addToCart: function(e) {
        e.preventDefault();
        var self = $(e.target);
        var url = self.attr('href') + '?format=json';
        $.ajax({
            url: url,
            dataType: 'json'
        }).done(function(response){
            var items = response.items;
            var totals = response.totals;

            $('.cart-dropdown').html('');
            App.collections.cartInfo.fetch();
            $('.cart-dropdown').parent().addClass('open');
        });
        return false;
    },
    el : '.cart-buttons',
    initialize: function() {

        return this;
    }
});

App.views.ConfigurableProductOptionsView = Backbone.View.extend({

});

App.views.ConfigurableProductOptionView = Backbone.View.extend({
    initialize: function() {

        return this;
    },
    render: function() {

        return this;
    }
});

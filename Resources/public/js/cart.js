
// CartInfo : Totals, Items, Shipments, etc
App.models.CartInfo = Backbone.Model.extend({});
App.collections.CartInfoCollection = Backbone.Collection.extend({
    model: App.models.CartInfo,
    url: App.serverURL + '/cart/view?format=json',
    parse: function (response) {

        App.collections.totals = new App.collections.TotalCollection(response.totals);
        App.collections.items = new App.collections.CartItemCollection(response.items);

        //load cart dropdown
        App.views.cartView = new App.views.CartView();
        App.views.cartView.render();

        return response.items;
     }
});

// CartTotal
App.models.Total = Backbone.Model.extend({});
App.collections.TotalCollection = Backbone.Collection.extend({
    model: App.models.Total,
    url: App.serverURL + '/cart/totals'
});

// CartItem
App.models.CartItem = Backbone.Model.extend({});
App.collections.CartItemCollection = Backbone.Collection.extend({
    model: App.models.CartItem,
    url: App.serverURL + '/cart/view?format=json'
});

// CartButtons
App.views.CartButtonView = Backbone.View.extend({
    tagName: 'li',
    template: _.template($('#cart-buttons').html()),
    initialize: function() {
        this.render();
        return this;
    },
    render: function() {
        $('.cart-dropdown').append(this.template({}));
        return this;
    }
});

// Shopping Cart Dropdown
App.views.CartView = Backbone.View.extend({
    el: '.cart-dropdown',
    initialize: function() {
        return this;
    },
    render: function() {
        this.$el.html('');
        var self = this;

        App.views.cartTotals = new App.views.CartTotalView({collection: App.collections.totals});
        App.views.cartItems = new App.views.CartItemView({collection:App.collections.items});
        App.views.cartButtons = new App.views.CartButtonView();

        this.$el.parent().addClass('open');
        setTimeout(function() {
            self.$el.parent().removeClass('open');
        }, 1000);

        return this;
    }
});

// Shopping Cart Totals
App.views.CartTotalView = Backbone.View.extend({
    tagName: 'li',
    template: _.template($('#cart-total').html()),
    initialize: function() {
        this.collection.on('add', this.render, this);
        this.render();
        return this;
    },
    addTotal: function(total) {
        $('.cart-dropdown').append(this.template(total.toJSON()));
        return this;
    },
    render: function() {
        var self = this;
        this.collection.each(function(total) {
            self.addTotal(total);
        });
        return this;
    }
});

// Shopping Cart Items
App.views.CartItemView = Backbone.View.extend({
    tagName: 'li',
    template: _.template($('#cart-item').html()),
    initialize: function() {
        this.collection.on('add', this.render, this);
        this.render();
        return this;
    },
    addItem: function(item) {
        if (_.has(item.attributes, 'parent_options')) {
            item.attributes.slug = item.attributes.parent_options.slug;
        }
        $('.cart-dropdown').append(this.template(item.toJSON()));
        return this;
    },
    render: function() {
        var self = this;
        this.collection.each(function(item) {
            self.addItem(item);
        });
        return this;
    }
});

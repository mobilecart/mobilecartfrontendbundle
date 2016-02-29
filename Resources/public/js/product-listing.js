
// Facet
App.models.Facet = Backbone.Model.extend({});
App.collections.FacetCollection = Backbone.Collection.extend({
    model: App.models.Facet
});

// FacetOption
App.models.FacetOption = Backbone.Model.extend({});
App.collections.FacetOptionCollection = Backbone.Collection.extend({
    model: App.models.FacetOption
});

// Products
App.models.Item = Backbone.Model.extend({});
App.collections.PaginatedCollection = Backbone.PageableCollection.extend({
    url: App.serverURL + '/products',
    mode: 'server',
    model: App.models.Item,
    state: {
        pageSize: 30,
        sortKey: 'name',
        order: 1,
        currentPage: 1,
        totalPages: null,
        totalRecords: null
    },
    queryParams: {
        sortKey: 'sort',
        order: 'direction',
        directions: {
            "-1": 'asc',
            "1": 'desc'
        },
        currentPage: 'page',
        format: 'json'
    },
    parse: function (response) {
        $('.product-list').spin(false);

        // Set state
        this.state.totalRecords = parseInt(response.total);
        this.state.totalPages = parseInt(response.pages);

        // Render Faceted Search
        App.collections.facets = new App.collections.FacetCollection(response.facetCounts);
        App.views.facets = new App.views.FacetCollectionView({collection: App.collections.facets});
        App.views.facets.$el.html('');
        App.views.facets.render();

        return response.entities;
    }
});

// View for FacetCollection
App.views.FacetCollectionView = Backbone.View.extend({
    tagName: 'ul',
    className: 'side-menu nav',
    initialize: function() {

        var items = this.collection;
//        items.on('add', this.addFacet, this);
        items.on('all', this.render, this);
//        items.on('reset', this.render, this);
//        items.on('sync', this.render, this);

        return this;
    },
    render: function() {
        var self = this;
        //$('.sidebar-collapse').spin();

        $('.sidebar-collapse').html(App.views.facets.el);
        this.collection.each(function(facet) {
            //if (facet.get('terms').length > 0) {
                self.addFacet(facet);
            //}
        });

        //$('.sidebar-collapse').spin(false);


        return this;
    },
    addFacet: function(item) {
        var view = new App.views.FacetLabelView({model:item});
        this.$el.append(view.render().el);
    }
});

// View for FacetLabel - embedded list, ul/li elements
App.views.FacetLabelView = Backbone.View.extend({
    events: {
        'click a.facet-label': 'toggleCollapse'
    },
    tagName: 'li',
    className: '',
    template: _.template($('#facetLabel').html()),
    initialize: function() {
        this.model.bind('change', this.render, this);
        this.model.bind('remove', this.remove, this);
    },
    toggleCollapse: function(e) {
        e.preventDefault();
        var link = $(e.target);
        var ul = link.parent().find('ul');
        ul.toggleClass('collapse');
    },
    render: function () {
        this.$el.html('');

        // append label, link
        this.$el.append(this.template(this.model.toJSON()));

        var terms = this.model.get('terms');

        // append list of options
        var termCollection = new App.collections.FacetOptionCollection(terms);
        var view = new App.views.FacetOptionCollectionView({collection: termCollection});

        if (this.model.get('isActive')) {
            view.$el.removeClass('collapse');
        }

        this.$el.append(view.render().el);

        return this;
    }
});

// View for FacetOptionCollection - embedded list
App.views.FacetOptionCollectionView = Backbone.View.extend({
    tagName: 'ul',
    className: 'nav nav-second-level collapse',
    initialize: function() {
        var items = this.collection;
//        items.on('add', this.addOne, this);
        items.on('all', this.render, this);
//        this.render();
    },
    render: function () {
        var self = this;
        this.$el.html('');
        this.collection.each(function(facet){
//            facet.set({urlToken: urlToken}); // performance hit
            self.addOne(facet);
        });
        return this;
    },
    addOne: function (facet) {
        var view = new App.views.FacetOptionView({model:facet});
        this.$el.append(view.render().el);
    }
});

// View for FacetOption
App.views.FacetOptionView = Backbone.View.extend({
    events: {
        'click a.facet-link': 'addOption',
        'click a.facet-remove-link': 'removeOption'
    },
    tagName: 'li',
    className: '',
    template: _.template($('#facetLink').html()),
    initialize: function() {
        this.model.bind('change', this.render, this);
        this.model.bind('remove', this.remove, this);
    },
    addOption: function(e) {
        e.preventDefault();
        var urlToken = this.model.get('urlToken');
        App.collections.paginatedItems.queryParams[urlToken] = this.model.get('term');
        App.collections.paginatedItems.state.currentPage = 1;
        App.collections.paginatedItems.fetch();
        return false;
    },
    removeOption: function(e) {
        e.preventDefault();
        var urlToken = this.model.get('urlToken');
        App.collections.paginatedItems.queryParams[urlToken] = null;
        App.collections.paginatedItems.state.currentPage = 1;
        App.collections.paginatedItems.fetch();
        return false;
    },
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }
});

// View for product listing
App.views.AppView = Backbone.View.extend({
    events: {
        'click a.addtocart': 'addToCart'
    },
    el : '.product-list',
    initialize: function() {

        var items = this.collection;
        items.on('add', this.addOne, this);
//        items.on('all', this.render, this);
        this.render();
    },
    render: function() {
        this.$el.html('');
        this.$el.spin();
        return this;
    },
    addOne: function(item) {
        var view = new App.views.ItemView({model:item});
        this.$el.append(view.render().el);
        return this;
    },
    addToCart: function(e) {
        e.preventDefault();
        var self = $(e.target);
        var url = self.attr('href') + '?format=json';
        $.ajax({
            url: url,
            dataType: 'json'
        }).done(function(response){
            $('.cart-dropdown').html('');
            App.collections.cartInfo.fetch();
            $('.cart-dropdown').parent().addClass('open');
        });
        return false;
    }
});

App.views.ItemView = Backbone.View.extend({
    tagName: 'div',
    className: 'col-sm-4 col-lg-4 col-md-4',
    template: _.template($('#product-grid-single').html()),
    initialize: function() {
        this.model.bind('change', this.render, this);
        this.model.bind('remove', this.remove, this);
    },
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }
});

App.views.SortedView = Backbone.View.extend({
    events: {
        'click .sort-by a': 'updateSortBy'
    },
    template: _.template($('#sortingTemplate').html()),
    initialize: function () {
        this.collection.on('reset', this.render, this);
        this.collection.on('sync', this.render, this);
        this.$el.appendTo('.sorting');
    },
    render: function () {
        var html = this.template(this.collection.state);
        this.$el.html(html);
        if (this.collection.state.sortKey == undefined){
            var sortText = this.$el.find('.sort-by').text();
        } else {
            var sortText = this.collection.state.sortKey;
        }
        $('.sort-by').text(sortText);
        return this;
    },
    updateSortBy: function (e) {
        e.preventDefault();
        var currentSort = $(e.target).attr('href');
        this.collection.setSorting(currentSort); //updateOrder(currentSort);
        $('.product-list').spin();
        return this;
    }
});

App.views.PaginatedView = Backbone.View.extend({
    events: {
        'click button.prev': 'gotoPrev',
        'click button.next': 'gotoNext',
        'click a.page': 'gotoPage'
    },
    template: _.template($('#paginationTemplate').html()),
    initialize: function () {
        this.collection.on('reset', this.render, this);
        this.collection.on('sync', this.render, this);
        this.$el.appendTo('.pager');
    },
    render: function () {
        this.$el.html(this.template(this.collection.state));
        return this;
    },
    gotoPrev: function (e) {
        e.preventDefault();
        $('.product-list').spin();
        this.collection.getPreviousPage();
        return this;
    },
    gotoNext: function (e) {
        e.preventDefault();
        $('.product-list').spin();
        this.collection.getNextPage();
        return this;
    },
    gotoPage: function (e) {
        e.preventDefault();
        $('.product-list').spin();
        var page = $(e.target).text();
        this.collection.getPage(parseInt(page));
        return this;
    }
});

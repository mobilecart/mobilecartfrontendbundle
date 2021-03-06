var CheckoutAccordion = function(obj) {
    this.sections = [];
    this.sectionCallbacks = [];
    this.attachEvents();
    return this;
};

CheckoutAccordion.prototype = {
    attachEvents: function() {

        $('a.collapse-toggle').on('click', function(e){
            var self = $(this);
            if (self.find('.glyphicon-minus').length > 0) {
                self.find('.glyphicon-minus').removeClass('glyphicon-minus').addClass('glyphicon-plus');
            } else if (self.find('.glyphicon-plus').length > 0) {
                self.find('.glyphicon-plus').removeClass('glyphicon-plus').addClass('glyphicon-minus');
            }
        });
    },
    addSection: function(section) {
        this.sections.push(section);
        return this;
    },
    addSectionCallback: function(section, callback) {
        this.sectionCallbacks.push({
            section: section,
            callback: callback
        });
        return this;
    },
    getSections: function() {
        return this.sections;
    },
    hasSection: function(section) {
        return this.sections.indexOf(section) > -1;
    },
    sectionHasCallback: function(section) {
        var widget = this;
        if (widget.sectionCallbacks.length > 0) {
            for (var x = 0; x < widget.sectionCallbacks.length; x++) {
                var sectionCallback = widget.sectionCallbacks[x];
                if (sectionCallback.section == section) {
                    return true;
                }
            }
        }
        return false;
    },
    getNextSection: function(section) {
        var widget = this;
        for (var x = 0; x < widget.sections.length; x++) {
            if (widget.sections[x] == section) {
                x++;
                if (typeof widget.sections[x] != 'undefined') {
                    return widget.sections[x];
                } else {
                    return '';
                }
            }
        }

        return '';
    },
    closeSection: function(section) {
        var widget = this;
        var sectionEl = $('#section-' + section);
        var headingEl = $('#heading-' + section);
        sectionEl.collapse('hide');
        headingEl.find('.glyphicon-minus').removeClass('glyphicon-minus').addClass('glyphicon-plus');
        return widget;
    },
    openSection: function(section) {
        var widget = this;
        var sectionEl = $('#section-' + section);
        var headingEl = $('#heading-' + section);
        sectionEl.collapse('show');
        headingEl.find('.glyphicon-plus').removeClass('glyphicon-plus').addClass('glyphicon-minus');
        return widget;
    },
    closeAndOpenNextSection: function(section) {
        var widget = this;
        widget.closeSection(section);
        var nextSection = widget.getNextSection(section);
        if (nextSection.length > 0) {
            if (widget.sectionHasCallback(nextSection)) {
                for (var x = 0; x < widget.sectionCallbacks.length; x++) {
                    var sectionCallback = widget.sectionCallbacks[x];
                    if (sectionCallback.section == nextSection) {
                        sectionCallback.callback();
                    }
                }
            } else {
                widget.openSection(nextSection);
            }
        }
        return widget;
    }
}

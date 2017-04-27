$(function(){

    var pagerForm = $('#pager-form');
    var pageInput = $('input#page');
    var sortByInput = $('input[name="sort"]');
    var sortDirInput = $('input#sort-dir');
    var textInput = $('input#text-search');

    // paginator previous
    $('button.prev').click(function(e){
        e.preventDefault();
        var page = parseInt(pageInput.val()) - 1;
        pageInput.val(page);
        pagerForm.submit();
        return false;
    });

    // paginator next
    $('button.next').click(function(e){
        e.preventDefault();
        var page = parseInt(pageInput.val()) + 1;
        pageInput.val(page);
        pagerForm.submit();
        return false;
    });

    $('a.search-filter-link').click(function(e){
        e.preventDefault();
        var self = $(this);
        var rel = self.attr('rel');
        var relEl = $('input#' + rel);
        if (relEl.attr('checked') == 'checked') {
            relEl.prop('checked', false);
        } else {
            relEl.prop('checked', true);
        }

        pageInput.val(1);
        pagerForm.submit();
        return true;
    });

    $('button.search-submit').click(function(e){
        pageInput.val(1);
        pagerForm.submit();
        return true;
    });

    $('button.search-clear').click(function(e){
        textInput.val('');
        pagerForm.submit();
        return true;
    });

    $('a.sort-by-input').click(function(e){
        e.preventDefault();
        var self = $(this);
        var radio = self.find('input[name="sort"]');
        radio.prop('checked', true);
        var sortDir = radio.attr('data-dir');
        sortDirInput.val(sortDir);
        pageInput.val(1);
        pagerForm.submit();
        return false;
    });

    // sort dropdown
    sortByInput.change(function(e){
        e.preventDefault();
        var option = sortByInput.find(':selected');
        var sortDir = option.attr('data-dir');
        sortDirInput.val(sortDir);
        pageInput.val(1);
        pagerForm.submit();
        return false;
    });

});

/*
 * tinySelect
 *
 * Licensed under MIT license.
 *
 * @version 1.0.4
 * @author Pekka Harjamäki
 */
;
(function ($) {

    "use strict";

    var TinySelect = {
        /* ******************************************************************* *
         * Class initializers
         * ******************************************************************* */
        init: function ($el, options) {
            $el.data("tinySelectObj", this);

            this.config = $.extend({
                txtLoading: "Loading...",
                txtAjaxFailure: "Error...",

                dataUrl: null,
                dataParser: null
            }, options);

            this.state = {
                container: null,
                itemContainer: null,

                searchContainer: null,
                searchBox: null,

                $el: null,

                ajaxPending: false,
                selectedValue: -1,

                originalItemData: [],
                filteredItemData: []
            };

            this.readSelect($el);
            this.createSelect($el);

        },

        createSelect: function ($el) {
            // Create container for select, search and options
            this.state.container = $("<div></div>").
            addClass("tinyselect").
            css({
                width: $el.css("width")
            });

            // Add search
            this.createSearch();

            // Create container to hold search and results
            this.state.dropdown = $("<div></div>").
            addClass("dropdown").
            hide();

            this.state.container.append(this.state.dropdown);

            // Create ul to hold items		
            this.state.itemContainer = $("<ul></ul>").
            addClass("itemcontainer");
            this.state.dropdown.append(this.state.itemContainer);

            //
            this.createItems();

            // Hide original select element and add new component to below
            $el.hide().after(this.state.container);
            this.state.$el = $el;
        },

        createItems: function (selected) {
            var l1, opt;

            // Remove all 
            this.state.itemContainer.empty();

            //
            for (l1 = 0; l1 < this.state.filteredItemData.length; l1++) {
                opt = this.state.filteredItemData[l1];

                var newLi = $("<li></li>").
                text(opt.text).
                addClass("item").
                attr("data-value", opt.val);

                if (opt.val == this.state.selectedValue) {
                    this.state.searchBox[0].setAttribute("value", opt.text);
                    newLi.addClass("selected");
                }
                newLi.on("mousedown", {
                    self: this
                }, this.onSelectLiClicked);

                this.state.itemContainer.append(newLi);
            }
        },

        createSearch: function () {
            this.state.searchContainer = $("<div></div>").
            addClass("searchcontainer");
            this.state.searchBox = $("<input type='text'></input>").
            addClass("searchbox").
            on("click", function (e) {
                e.stopPropagation();
            }).
            on("keyup", {
                self: this
            }, this.onSearchKeyPress).
            on("focusin", {
                self: this
            }, this.onToggleDropDown).
            on("focusout", {
                self: this
            }, this.onToggleDropDown).
            keydown(function (e) {
                switch (e.which) {
                case 37: // left
                    break;

                case 38: // up
                    break;

                case 39: // right
                    break;

                case 40: // down
                    break;

                default:
                    return; // exit this handler for other keys
                }
                e.preventDefault(); // prevent the default action (scroll / move caret)
            });

            this.state.searchContainer.append($("<span class='searchicon'></span>"));
            this.state.searchContainer.append(this.state.searchBox);
            this.state.container.append(this.state.searchContainer);
        },

        readSelect: function ($el) {
            var self = this;

            $el.find("option").each(function (index) {
                var opt = $(this);
                self.state.originalItemData.push({
                    val: opt.val(),
                    text: opt.text()
                });
            });

            this.state.filteredItemData = this.state.originalItemData;
            //this.state.selectedValue = $el.val();
        },

        setAjaxIndicator: function (failure) {
            this.state.ajaxPending = true;
            this.state.itemContainer.empty();

            if (this.state.searchContainer !== null)
                this.state.searchContainer.hide();

            var newLi = $("<li></li>");
            if (!failure) {
                newLi.text(this.config.txtLoading).
                addClass("loadindicator");
            } else {
                newLi.text(this.config.txtAjaxFailure).
                addClass("loaderrorindicator");
            }

            this.state.itemContainer.append(newLi);
        },

        /* ******************************************************************* *
         * Event handlers
         * ******************************************************************* */
        onSearchKeyPress: function (e) {
            var self = e.data.self,
                sval = $(e.currentTarget).val();

            if (sval.length === 0) {
                self.state.filteredItemData = self.state.originalItemData;
            } else {
                self.state.filteredItemData = self.state.originalItemData.filter(function (item) {
                    return item.text.toLowerCase().indexOf(sval) >= 0 ? true : false;
                });
            }

            self.createItems();
        },

        onToggleDropDown: function (e) {
            var self = e.data.self;

            // Do nothing, if currently animating
            if (self.state.dropdown.is(":animated"))
                return;

            if (e.type == "focusout") {
                self.state.dropdown.slideUp(100);
                return;
            } else if (e.type == "focusin") {

                // Open
                if (self.config.dataUrl !== null) {
                    self.setAjaxIndicator(false);
                    $.ajax({
                        url: self.config.dataUrl,
                        dataType: "json",
                        type: "GET"
                    }).done(function (data) {
                        self.onAjaxLoadSuccess(self, data);
                    }).
                    fail(function (data) {
                        self.onAjaxLoadError(self, data);
                    });
                }
                self.state.dropdown.slideDown(100);
            }

        },

        onAjaxLoadSuccess: function (self, data) {
            self.state.ajaxPending = false;

            if (self.config.dataParser !== null) {
                data = self.config.dataParser(data, self.state.selectedValue);
            }

            self.state.$el.empty();
            data.forEach(function (v) {

                if (v.selected)
                    self.state.selectedValue = v.val;

                self.state.$el.append(

                    $("<option></option>").text(v.text).val(v.val)
                );

            });
            self.state.$el.val(self.state.selectedValue);

            self.state.originalItemData = data;
            self.state.filteredItemData = data;

            if (this.state.searchContainer !== null)
                this.state.searchContainer.show();
            self.createItems();
        },

        onAjaxLoadError: function (self, data) {
            self.setAjaxIndicator(true);
        },

        onSelectLiClicked: function (e) {
            var self = e.data.self,
                item = $(e.currentTarget);

            self.state.dropdown.find("li").each(function () {
                $(this).removeClass("selected");
            });

            item.addClass("selected");
            self.state.searchBox[0].setAttribute("value", item.text());

            self.state.selectedValue = item.attr("data-value");
            self.state.$el.val(self.state.selectedValue);
            self.state.$el.trigger("change");
        },

        /* ******************************************************************* *
         * External callbacks
         * ******************************************************************* */

    };

    /* ******************************************************************* *
     * Plugin main
     * ******************************************************************* */
    $.fn.jctinyselect = function (options) {
        if (typeof (options) != "undefined") {}

        return this.each(function () {
            var sel = Object.create(TinySelect);
            sel.init($(this), options);
        });
    };

}(jQuery));
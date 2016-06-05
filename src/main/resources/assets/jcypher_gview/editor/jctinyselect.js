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

            this.config = $.extend({}, options);

            this.state = {
                container: null,
                itemContainer: null,

                searchContainer: null,
                searchBox: null,

                $el: null,

                droppedDown: false,
                inDropDown: false,

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
            this.state.dropdown.on('focus', 'li', function () {
                var self = $(this);
                //self.closest('div.dropdown').scrollTop(self.index() * self.outerHeight());
                //self.closest('div.dropdown').scrollTo(self);
            }).on('keydown', 'li', {
                self: this
            }, function (e) {
                var me = $(this);
                if (e.keyCode == 40) {
                    me.next().focus();
                    return false;
                } else if (e.keyCode == 38) {
                    me.prev().focus();
                    return false;
                } else if (e.keyCode == 13) { // enter
                    var self = e.data.self;
                    self.onSelectLiClicked(e);
                    return false;
                } else if (e.keyCode == 27) { // esc
                    var self = e.data.self;
                    self.closeDropdown(self, function () {
                        var strLength = self.state.searchBox.val().length;
                        self.state.droppedDown = true; // to avoid reopening the dropdown
                        self.state.searchBox.focus();
                        self.state.searchBox[0].setSelectionRange(strLength, strLength);
                        self.state.droppedDown = false;
                    });
                    return false;
                }
            });

            //
            this.createItems();

            // Hide original select element and add new component to below
            $el.hide().after(this.state.container);
            this.state.$el = $el;

            // Hide select content when clicked elsewhere in the document
            $(document).on("click", {
                self: this
            }, this.onDocumentClicked);
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
                attr("data-value", opt.val).
                attr("tabindex", opt.val);

                if (opt.val == this.state.selectedValue) {
                    this.state.searchBox[0].setAttribute("value", opt.text);
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
            addClass("searchbox nok").
            on("click", function (e) {
                e.stopPropagation();
            }).
            on("keyup", {
                self: this
            }, this.onSearchKeyPress).
            on("focusin", {
                self: this
            }, this.onSBEnter).
            on("focusout", {
                self: this
            }, this.onSBExit).
            on("keydown", {
                self: this
            }, function (e) {
                var self = e.data.self;
                switch (e.which) {
                case 37: // left
                    break;

                case 38: // up
                    break;

                case 39: // right
                    break;

                case 40: // down
                    if (!self.state.droppedDown)
                        self.openDropdown(self);
                    else
                        self.onDropDownEnter(e);
                    break;

                case 27: // esc
                    self.closeDropdown(self);
                    break;

                default:
                    return; // exit this handler for other keys
                }
                e.preventDefault(); // prevent the default action (scroll / move caret)
            });

            this.state.searchContainer.append($("<span class='glyphicon glyphicon-search searchicon'></span>"));
            this.state.searchContainer.append($("<span class='glyphicon glyphicon-ok sel-ok nok'></span>"));
            this.state.searchContainer.append($("<span class='glyphicon glyphicon-remove sel-cancel'></span>"));
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
        },
        
        setSelectedValue: function(val) {
            this.state.selectedValue = val;
            if (val == -1) {
                this.state.searchBox.removeClass("ok").addClass("nok");
                this.state.searchContainer.children(".sel-ok").removeClass("ok").addClass("nok");
            } else {
                this.state.searchBox.removeClass("nok").addClass("ok");
                this.state.searchContainer.children(".sel-ok").removeClass("nok").addClass("ok");
            }
        },

        /* ******************************************************************* *
         * Event handlers
         * ******************************************************************* */
        onDocumentClicked: function (e) {
            var self = e.data.self;

            self.closeDropdown(self);
        },

        onSearchKeyPress: function (e) {
            var self = e.data.self;
            var c = e.which;
            //37..left, 38..up, 39..right, 40..down, 13..enter
            if (c !== 0 && c !== 13 && c !== 37 && c !== 38 && c !== 39 && c !== 40 && c !== 27 &&
                !e.ctrlKey && !e.metaKey && !e.altKey
            ) {

                var sval = $(e.currentTarget).val();

                if (sval.length === 0) {
                    self.state.filteredItemData = self.state.originalItemData;
                } else {
                    self.state.filteredItemData = self.state.originalItemData.filter(function (item) {
                        return item.text.toLowerCase().indexOf(sval) >= 0 ? true : false;
                    });
                }

                self.createItems();
                var val = -1;
                if (self.state.filteredItemData.length == 1) {
                    var itm = self.state.filteredItemData[0];
                    val = (itm.text == sval) ? itm.val : -1;
                }
                self.setSelectedValue(val);
                if (val == -1)
                    self.openDropdown(self);
                else
                    self.closeDropdown(self);
            }
        },

        onSBExit: function (e) {
            var self = e.data.self;

            if (!self.state.inDropDown) {
                self.closeDropdown(self);
            }
        },

        closeDropdown: function (self, after) {
            if (self.state.droppedDown) {
                // Do nothing, if currently animating
                if (self.state.dropdown.is(":animated"))
                    return;
                self.state.droppedDown = false;
                if (after != null)
                    self.state.dropdown.slideUp(100, after);
                else
                    self.state.dropdown.slideUp(100);
            }
        },

        onSBEnter: function (e) {
            var self = e.data.self;

            if (self.state.selectedValue == -1) {
                self.openDropdown(self);
            }
        },

        openDropdown: function (self, after) {
            if (!self.state.droppedDown) {
                // Do nothing, if currently animating
                if (self.state.dropdown.is(":animated"))
                    return;
                self.state.droppedDown = true;
                if (after != null)
                    self.state.dropdown.slideDown(100, after);
                else
                    self.state.dropdown.slideDown(100);
            }
        },

        onDropDownEnter: function (e) {
            var self = e.data.self;
            var items = self.state.itemContainer.children(".item");
            if (items.length > 0) {
                self.state.inDropDown = true;
                var item = items.eq(0);
                item.focus();
            }
            return;

        },

        onSelectLiClicked: function (e) {
            var self = e.data.self,
                item = $(e.currentTarget);

            self.state.inDropDown = false; // leave dropdown

            var txt = item.text();
            self.state.searchBox.val(txt);

            self.setSelectedValue(item.attr("data-value"));
            self.state.$el.trigger("change");

            var sval = item.text();
            self.state.filteredItemData = self.state.originalItemData.filter(function (item) {
                return item.text.toLowerCase().indexOf(sval) >= 0 ? true : false;
            });

            self.closeDropdown(self, function () {
                var strLength = self.state.searchBox.val().length;
                self.state.searchBox.focus();
                self.state.searchBox[0].setSelectionRange(strLength, strLength);
                self.createItems();
            }); // close dropdown
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
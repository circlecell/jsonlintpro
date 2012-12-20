/**
 * Our Base View for validators.
 * Should be a ``FORM`` with buttons and results included
 * Can never be ``display: none`` due to lined-textarea
 */
define([
    'Underscore',
    'Backbone',
    'text!templates/errorTemplate.html'
], function (
    _,
    Backbone,
    errorTemplate
) {
	var ARROW_OFFSET = 10;

	return Backbone.View.extend({	
		initialize : function () {
			_.bindAll(this);

	        this.render();
		},
		
		render : function () {
			var el = $(errorTemplate);
							
			this.$el.replaceWith(el);
			this.setElement(el);						
		},
		
		setPosition : function (offset) {
			var topOffset =  offset.top - this.$el.outerHeight() - ARROW_OFFSET;
			
			if (topOffset < 0) {
				topOffset = offset.bottom + ARROW_OFFSET;
				
				this.$el.addClass('reverse');
			} else {
				this.$el.removeClass('reverse');				
			}
			
			this.topOffset = topOffset;
						
			this.$el.css({
				top : topOffset,
				left : offset.left
			});
		},
		
		setScrollOffset : function (offset) {
			this.$el.css({
				top: this.topOffset - offset
			});
		},
		
		setError : function (error) {
			this.$('.results').text(error);	
		},
		
		show : function () {
			if (!this.$el.is(':visible')) {
				this.$el.show();
			}
		},
		
		hide : function () {
			if (this.$el.is(':visible')) {
				this.$el.hide();
			}
		}
	});
});
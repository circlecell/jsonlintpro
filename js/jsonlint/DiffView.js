/**
 * Our Base View for validators.
 * Should be a ``FORM`` with buttons and results included
 * Can never be ``display: none`` due to lined-textarea
 */
define([
    'Underscore',
    'Backbone',
    'text!templates/diffTemplate.html'
], function (
    _,
    Backbone,
    diffTemplate
) {
	
	var TABCHARS = "    ",
		PADDING = 40,
		FADE_SPEED = 150;

	return Backbone.View.extend({	
		events : {
			'click .cancel-diff' : 'onCancel'	
		},
		
		initialize : function () {
			_.bindAll(this);
			
			this.windowObject = this.options.windowObject;
			
			$(this.windowObject).resize(this.resize);
			
	        this.render();
		},
		
		render : function () {
			var el = $(diffTemplate);
							
			this.$el.replaceWith(el);
			this.setElement(el);						

	        _.delay(this.resize, 150);
		},
		
		resize : function () {
			var height = $(this.windowObject).height();
			
			this.$('.json_input').height(height);
		},
		
		setHTML : function (html) {
			this.$('.json_input').html(html);
		},
		
		isActive : function () {
			return this.$el.hasClass('active');	
		},
		
		show : function () {
			if (this.$el.hasClass('active')) {
				return;
			}
			
			this.$el.animate({
				right: '0'
			}, 150, _.bind(function () {
				this.$el.addClass('active')
			}, this));
		},
		
		hide : function () {
			if (!this.$el.hasClass('active')) {
				return;
			}
			
			this.$el.animate({
				right: '-34%'
			}, 150, _.bind(function () {
				this.$el.removeClass('active')
			}, this));
		},
		
		onCancel : function (ev) {
			ev.preventDefault();
			
			this.trigger('diff:cancel');
		}
	});
});
/**
 * Our Base View for validators.
 * Should be a ``FORM`` with buttons and results included
 */
define([
    'Underscore',
    'Backbone',
    'jsonlint/ValidatorView',
    'text!templates/validatorTemplate.html'
], function (
    _,
    Backbone,
    ValidatorView,
    validatorTemplate
) {
	
	var TABCHARS = "    ",
		PADDING = 40,
		FADE_SPEED = 150;

	return ValidatorView.extend({
		render : function () {
			ValidatorView.prototype.render.call(this);
			
			this.$('.split-view').addClass('cancel');
			
			this.$('.diff').css('display', 'block');
		},
		 
	    onSplitView : function (ev) {
		    ev.preventDefault();
		    
		    this.trigger('split:exit');
	    }
	});
});
/**
 * Our Base View for validators.
 * Should be a ``FORM`` with buttons and results included
 * Can never be ``display: none`` due to lined-textarea
 */
define([
    'Underscore',
    'Backbone',
    'jsonlint/ValidatorView',
    'jsonlint/SecondaryValidatorView',
    'jsonlint/DiffView',
    'text!templates/jsonCompositeTemplate.html'
], function (
    _,
    Backbone,
    ValidatorView,
    SecondaryValidatorView,
    DiffView,
    jsonCompositeTemplate
) {

	return Backbone.View.extend({	
		initialize : function () {
			_.bindAll(this);
			
			this.json 			= this.options.json;
			this.windowObject 	= this.options.windowObject;
			
			$(this.windowObject).resize(this.resize);
			
	        this.render();
		},
		
		render : function () {
			var el = $(jsonCompositeTemplate);
							
			this.$el.replaceWith(el);
			this.setElement(el);
			
			this.loadSubviews();					
		},
		
		loadSubviews : function () {
			// this needs to be in a composite
			this.primaryValidator = new ValidatorView({
			    el 			: this.$('#validator-placeholder1'),
				json	 	: this.options.json,
				className	: 'primary'
		    });
		 			    
		    this.secondaryValidator  = new SecondaryValidatorView({
			    el 	: this.$('#validator-placeholder2')
		    });
		    	    			 			    
		    this.diffView  = new DiffView({
			    el 	: this.$('#diff-placeholder')
		    });
		    
			this.primaryValidator.on('split:enter', 	this.enterSplitMode);
			this.secondaryValidator.on('split:exit',   	this.exitSplitMode);
			this.secondaryValidator.on('diff',   		this.enterDiffMode);
			this.diffView.on('diff:cancel',   			this.exitDiffMode);

			this.$('.json_input').linedtextarea();
			
	        _.delay(this.resize, 150);
		},
		
		resize : function () {
			var height = $(this.windowObject).height();
			
			this.$('.json_input').height(height);
		},
		
		enterSplitMode : function () {		    
		    this.primaryValidator.enterSplitMode();
		},
	    
	    exitSplitMode : function () {		    
		    this.primaryValidator.exitSplitMode(this.secondaryValidator.resetView);
		  	
		  	this.diffView.hide();			  
	    
	        this.secondaryValidator.exitDiffMode();
	    },
	    
	    enterDiffMode : function () {
		    	this._setDiff();
	    		    	if (!this.diffView.isActive()) {

		  					    
		    this.primaryValidator.enterDiffMode();
		    
		    this.secondaryValidator.enterDiffMode();
		  	
		  	this.diffView.show();
		  	}			  
	    },
	    
	    exitDiffMode : function () {
		  	this.primaryValidator.exitDiffMode();
		    
		    this.secondaryValidator.exitDiffMode();
		    		  	
		  	this.diffView.hide();			  
	    },
	    
	    _setDiff : function () {
		   	var valA = this.primaryValidator.textarea.val(),
		  		valB = this.secondaryValidator.textarea.val(),
		  		diff = htmlDiff(valA, valB);
		  		
		  	this.diffView.setHTML(diff);
	    }
	});
});
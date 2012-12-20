/**
 * Our Base View for validators.
 * Should be a ``FORM`` with buttons and results included
 * Can never be ``display: none`` due to lined-textarea
 */
define([
    'Underscore',
    'Backbone',
    'text!templates/validatorTemplate.html'
], function (
    _,
    Backbone,
    validatorTemplate
) {
	
	var TABCHARS = "    ",
		PADDING = 40,
		FADE_SPEED = 150;

	return Backbone.View.extend({
		events : {
			'click .validate' 		: 'onValidate',
			'keyup .json_input' 	: 'onKeyUp',
			'keydown .json_input' 	: 'onKeyDown',
			'click .reset' 			: 'onReset',
			'click .split-view'     : 'onSplitView',
			'click .diff'			: 'onDiff'
		},
		
		initialize : function () {
			_.bindAll(this);
			
			_.defaults(this.options, {
				reformat 	 : true,
				jsonParam 	 : false,
				windowObject : window,
				className	 : ''
			});
			
			this.jsonParam 	= this.options.jsonParam;
			this.reformat 	= this.options.reformat;
			this.windowObject = this.options.windowObject;
			
			$(this.windowObject).resize(this.resize);
			
			this._checkForJSONParam();

	        this.render();
		},
		
		render : function () {
			var el = $(validatorTemplate);
							
			this.$el.replaceWith(el);
			this.setElement(el);
			
			this.$el.addClass(this.options.className);
						
			this.textarea = this.$('.json_input'); 			

	        _.delay(this.resize, 150);
		},
		
		resize : function () {
			var height = $(this.windowObject).height();
			
			this.$el.height(height);
			this.textarea.height(height - PADDING);	
		},
		
		/**
		* Validate any json passes in through the URL
		* @usage: ?json={}
		*/	
		_checkForJSONParam : function () {
	        if (this.jsonParam) {
	            this.textarea.val(this.jsonParam);
	            
	            validate();
	        }
		},
		
		onValidate : function (ev) {
			ev.preventDefault();
	          
	        if (this.textarea.val().trim().length === 0) {
	        	return;
	        }
	        
	        var jsonVal = $.trim(this.textarea.val());
	
	        if (jsonVal.substring(0, 4).toLowerCase() === "http") {
	            $.post("utils/proxy.php", {"url": jsonVal}, _.bind(function (responseObj) {
	                this.textarea.val(responseObj.content);
	                
	                this.validate();
	                
	            }, this), 'json');
	            
	        } else {
	            this.validate();
	        }
		},
		
		onKeyUp : function (ev) {
			this.$('.validate').removeClass('error success');
		},
		
		onKeyDown : function (ev) {
			if (ev.keyCode === 9) {
	            ev.preventDefault();
	            
	            this._insertAtCaret(TABCHARS);
	        }
		},
		
		onReset : function (ev) {
			ev.preventDefault();
			
			this.resetView();
		},
		
		resetView : function () {
			this.textarea.val('').focus();		
			this.$('.results').hide();
			this.$('.validate').removeClass('error success');
		},
		
		validate : function (options) {
			options || (options = {});
		    
		    _.defaults(options, {
			   success : $.noop,
			   error : $.noop 
		    });
		    
	        var jsonVal = this.textarea.val(),
	            result;
	                        
	        try {
	            result = jsl.parser.parse(jsonVal);
	
	            if (result) {
	                this._appendResult(jsonVal);            
	                
	                options.success();
	                
	                return;
	            }
	            
	            options.error();
	            
	        } catch (parseException) {
	        	this._handleParseException()
	            
	            options.error();
	        }
		},
		
		 _appendResult : function (jsonVal) {
	    	var tab_chars = this.reformat ? TABCHARS : "";
	   
	        this.textarea.val(JSON.stringify(JSON.parse(jsonVal), null, tab_chars));    
	    
			this.$('.validate').removeClass('error').addClass('success');
			this.$('.results').hide();
	    },
	    
	    /** 
	     * If we failed to validate, run our manual formatter and then re-validate so that we
	     * can get a better line number. On a successful validate, we don't want to run our
	     * manual formatter because the automatic one is faster and probably more reliable.
	    **/
	    _handleParseException : function () {
	        var jsonVal = this.textarea.val(),
	            result;
	            
	        try {
	            if (this.reformat) {
	                jsonVal = jsl.format.formatJson(jsonVal);
	                
	                this.textarea.val(jsonVal);
	                
	                result = jsl.parser.parse(jsonVal);
	            }
	        } catch(e) {
	            parseException = e;
	        }
	
	        var lineMatches = parseException.message.match(/line ([0-9]*)/),
				lineNum,
				lineStart,
				lineEnd;
	        
	        if (lineMatches && typeof lineMatches === "object" && lineMatches.length > 1) {
	            lineNum = parseInt(lineMatches[1], 10);
	
	            if (lineNum === 1) {
	                lineStart = 0;
	            } else {
	                lineStart = this._getNthPos(jsonVal, "\n", lineNum - 1);
	            }
	
	            lineEnd = jsonVal.indexOf("\n", lineStart);
	            if (lineEnd < 0) {
	                lineEnd = jsonVal.length;
	            }
	
	            this.textarea.focus().caret(lineStart, lineEnd);
	        }
	
	        this.$('.results').show().text(parseException.message);
	
	        this.$('.validate').removeClass('success').addClass('error');
	    },
	    
	    /**
	     * Function to insert our tab spaces
	     */
	    _insertAtCaret : function (text) {
	    	element = this.textarea[0];
	        
	        if (document.selection) {
	            element.focus();
	            var sel = document.selection.createRange();
	            sel.text = text;
	            element.focus();
	        } else if (element.selectionStart || element.selectionStart === 0) {
	            var startPos = element.selectionStart,
	            	endPos = element.selectionEnd,
	            	scrollTop = element.scrollTop;
	            
	            element.value = element.value.substring(0, startPos) + text + element.value.substring(endPos, element.value.length);
	            element.focus();
	            element.selectionStart = startPos + text.length;
	            element.selectionEnd = startPos + text.length;
	            element.scrollTop = scrollTop;
	        } else {
	            element.value += text;
	            element.focus();
	        }
	    },
	    
	    /**
	     * Get the Nth position of a character in a string
	     * @searchStr the string to search through
	     * @char the character to find
	     * @pos int the nth character to find, 1 based.
	     *
	     * @return int the position of the character found
	    **/
	    _getNthPos : function (searchStr, char, pos) {
	        var i,
	            charCount = 0,
	            strArr = searchStr.split(char);
	
	        if (pos === 0) {
	            return 0;
	        }
	
	        for (i = 0; i < pos; i++) {
	            if (i >= strArr.length) {
	                return -1;
	            }
	
	            // +1 because we split out some characters
	            charCount += strArr[i].length + char.length;
	        }
	
	        return charCount;
	    },
	    
	    hideSplitToggle : function () {
		  	this.$('.split-view').hide();  
	    },
	    
	    showSplitToggle : function () {
		  	this.$('.split-view').show();  
	    },
	    
	    onSplitView : function (ev) {
		    ev.preventDefault();
		    
		    this.trigger('split:enter');
	    },
	    
	    onDiff : function (ev) {
		    ev.preventDefault();

		    this.trigger('diff');
	    }
	});
});
/*jslint white: true, devel: true, onevar: true, browser: true, undef: true, nomen: true, regexp: true, plusplus: false, bitwise: true, newcap: true, maxerr: 50, indent: 4 */
var jsl = typeof jsl === 'undefined' ? {} : jsl,
	Validator;

/**
 * Helper Function for Caret positioning
 * Gratefully borrowed from the Masked Input Plugin by Josh Bush
 * http://digitalbush.com/projects/masked-input-plugin
**/
$.fn.caret = function (begin, end) { 
    if (this.length === 0) {
        return;
    }
    if (typeof begin === 'number') {
        end = (typeof end === 'number') ? end : begin;  
        return this.each(function () {
            if (this.setSelectionRange) {
                this.focus();
                this.setSelectionRange(begin, end);
            } else if (this.createTextRange) {
                var range = this.createTextRange();
                range.collapse(true);
                range.moveEnd('character', end);
                range.moveStart('character', begin);
                range.select();
            }
        });
    } else {
        if (this[0].setSelectionRange) {
            begin = this[0].selectionStart;
            end   = this[0].selectionEnd;
        } else if (document.selection && document.selection.createRange) {
            var range = document.selection.createRange();
            begin = -range.duplicate().moveStart('character', -100000);
            end   = begin + range.text.length;
        }
        return {"begin": begin, "end": end};
    }       
};

/**
 * GLobal validation properties
 */
var TABCHARS = "    ",
    REFORMAT,
    COMPRESS;
        
Validator = function (options) {
	this._setSettings(options || {});
	this.initialize.apply(this, arguments);
};

_.extend(Validator.prototype, {
	initialize : function () {
		_.bindAll(this);
		
		_.defaults(this.options, {
			delay : 0,
			speed : 45 * 1000
		});
		
		this.el = this.options.el;
		this.delay = this.options.delay;
		this.speed = this.options.speed;
		
		this.animate();
	},
	
	animate : function () {
		var offset = this.el.width();
		
		this.el.animate({
			left: - offset
		}, this.speed, this.reset);
	},
	
	reset : function () {
		this.el.css('left', '100%');
		
		this.animate();
	},
	
	_setSettings: function(options) {
		this.options = options;
	}
});
  
  
/**
 * jsl.interactions - provides support for interactions within JSON Lint.
 *
**/
jsl.interactions = (function () {
    /******* UTILITY METHODS *******/

    /**
     * Get the Nth position of a character in a string
     * @searchStr the string to search through
     * @char the character to find
     * @pos int the nth character to find, 1 based.
     *
     * @return int the position of the character found
    **/
    function getNthPos(searchStr, char, pos) {
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
    }

    /**
     * Get a URL parameter from the current windows URL.
     * Courtesy Paul Oppenheim: http://stackoverflow.com/questions/1403888/get-url-parameter-with-jquery
     * @param name the parameter to retrieve
     * @return string the url parameter's value, if any
    **/
    function getURLParameter(name) {
        param = (new RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || ['', null])[1];
        if (param) {
            return decodeURIComponent(param);
        } else {
            return null;
        }
    }

    /******* INTERACTION METHODS *******/
    
    function _appendResult(jsonVal) {
    	var tab_chars = reformat ? TABCHARS : "";
   
        $('#json_input').val(JSON.stringify(JSON.parse(jsonVal), null, tab_chars));    
    
		$('#validate').removeClass().addClass('success');
		$('#results').hide();
    }
    
    /** 
     * If we failed to validate, run our manual formatter and then re-validate so that we
     * can get a better line number. On a successful validate, we don't want to run our
     * manual formatter because the automatic one is faster and probably more reliable.
    **/
    function _handleParseException() {
        var jsonVal = $('#json_input').val(),
            result;
            
        try {
            if (reformat) {
                jsonVal = jsl.format.formatJson(jsonVal);
                
                $('#json_input').val(jsonVal);
                
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
                lineStart = getNthPos(jsonVal, "\n", lineNum - 1);
            }

            lineEnd = jsonVal.indexOf("\n", lineStart);
            if (lineEnd < 0) {
                lineEnd = jsonVal.length;
            }

            $('#json_input').focus().caret(lineStart, lineEnd);
        }

        $('#results').text(parseException.message);

        $('#validate').removeClass().addClass('error');
    }
    
    /**
     * Validate the JSON we've been given, displaying an error or success message.
     * @return void
    **/
    function validate(options) {
	    options || (options = {});
	    
	    _.defaults(options, {
		   success : $.noop,
		   error : $.noop 
	    });
	    
        var jsonVal = $('#json_input').val(),
            result;
                        
        try {
            result = jsl.parser.parse(jsonVal);

            if (result) {
                _appendResult(jsonVal);            
                
                options.success();
                
                return;
            }
            
            options.error();
            
        } catch (parseException) {
        	_handleParseException()
            
            options.error();
        }
    }
    
    /**
     * Function to insert our tab spaces
     */
    function insertAtCaret(text) {
        element = document.getElementById('json_input');
        
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
    }
    
    /**
     * Initialize variables, add event listeners, etc.
     *
     * @return void
    **/
    function init() {
        var reformatParam = getURLParameter('reformat'),
        	jsonParam = getURLParameter('json');
        
        REFORMAT      = reformatParam !== '0' && reformatParam !== 'no';
        COMPRESS      = reformatParam === 'compress';
        
        /**
         * Validate any json passes in through the URL
         * @usage: ?json={}
         */
        if (jsonParam) {
            $('#json_input').val(jsonParam);
            
            validate();
        }
        
        $('#validate').click(function (ev) {
          	ev.preventDefault();
          
            if ($('#json_input').val().trim().length === 0) {
            	return;
            }
            
            var jsonVal = $.trim($('#json_input').val());

            if (jsonVal.substring(0, 4).toLowerCase() === "http") {
                $.post("proxy.php", {"url": jsonVal}, function (responseObj) {
                    $('#json_input').val(responseObj.content);
                    
                    validate();
                    
                }, 'json');
                
            } else {
                validate();
            }
        });
        
        $('#json_input').keyup(function (ev) {
            $('#validate').removeClass();
            
        }).linedtextarea().keydown(function (ev) {
            if (ev.keyCode === 9) {
                ev.preventDefault();
                
                insertAtCaret(TABCHARS);
            }
        }).focus();

        $('#reset').click(function (ev) {
          	ev.preventDefault();
            
            $('#json_input').val('').focus();
        });
        
        $('#split-view').click(function (ev) {
         	ev.preventDefault();
        });
    }

    return {
        'init': init
    };
}());

$(function () {
    jsl.interactions.init();    
});

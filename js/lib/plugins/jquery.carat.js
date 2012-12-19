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
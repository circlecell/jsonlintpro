/**
 * Get a URL parameter from the current windows URL.
 * Courtesy Paul Oppenheim: http://stackoverflow.com/questions/1403888/get-url-parameter-with-jquery
 * @param name the parameter to retrieve
 * @return string the url parameter's value, if any
**/
function _getURLParameter (name) {
    param = (new RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || ['', null])[1];
    
    if (param) {
        return decodeURIComponent(param);
    } else {
        return null;
    }
}
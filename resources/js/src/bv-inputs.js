( function() {
    
    // Extension of Array to help find elements in array
    if (![].includes) {
      Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
        'use strict';
        var O = Object(this);
        var len = parseInt(O.length) || 0;
        if (len === 0) {
          return false;
        }
        var n = parseInt(arguments[1]) || 0;
        var k;
        if (n >= 0) {
          k = n;
        } else {
          k = len + n;
          if (k < 0) {k = 0;}
        }
        var currentElement;
        while (k < len) {
          currentElement = O[k];
          if (searchElement === currentElement ||
             (searchElement !== searchElement && currentElement !== currentElement)) {
            return true;
          }
          k++;
        }
        return false;
      };
    }

    function CustomEvent ( event, params ) {
      params = params || { bubbles: false, cancelable: false, detail: undefined };
      var evt = document.createEvent( 'CustomEvent' );
      evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
      return evt;
     }

    CustomEvent.prototype = window.Event.prototype;
    window.CustomEvent = CustomEvent;


    Object.defineProperty(Object.prototype, "indexOfKey", { 
      value: function(value) {
          var i = 1;
          for (var key in this){
            if (key == value){
              return i;
            }
            i++; 
          } 
          return undefined;
      }
    });


    // cache vars
    var bvinputs = document.querySelectorAll('.bv_field');

    for (var i = bvinputs.length - 1; i >= 0; i--) {
      let bv = new BvInput({ item: bvinputs[i].getAttribute('id') });
    };

})();
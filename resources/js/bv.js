;( function( window ) {

  'use strict';



  /**
   * Extend obj function
   *
   * This is an object extender function. It allows us to extend an object
   * by passing in additional variables and overwriting the defaults.
   */
  function extend( a, b ) {
    for( var key in b ) { 
      if( b.hasOwnProperty( key ) ) {
        a[key] = b[key];
      }
    }
    return a;
  }




  /**
   * BibleVerses
   *
   * @param {object} options - The options object
   */
  function BibleVerses( options ) {
    this.options = extend( {}, this.options );
    extend( this.options, options );
    // start the functionality...
    this._init();
  }


  /**
   * BibleVerses options Object
   *
   * @type {HTMLElement} wrapper - The wrapper to append alerts to.
   * @param {string} type - The type of alert.
   * @param {string} message - The alert message.
   */
  BibleVerses.prototype.options = {
    item : null
  }



  /**
   * BibleVerses _init
   *
   * This is the initializer function. 
   *
   * @type {HTMLElement} this.sa - The Bible Verses div
   * @param {string} strinner - The inner HTML for our alert
   */
  BibleVerses.prototype._init = function () {
    // create element
    console.info("INIT::BV");
    this.self = document.getElementById(this.options.item);
    this.modalLaunchBtn = this.self.querySelector('.bv_action--btn');
    this._modal();
    this._events();
  };


  BibleVerses.prototype._modal = function () {
    var modalDom = this.self.querySelector('.bv_modal');
    var modalSettings = {
      'resizable': true,
      'autoShow': false
    };
    
    this.garnishModal = new Garnish.Modal(modalDom.outerHTML, modalSettings);
  };




  BibleVerses.prototype._events = function () {

    var modal = this.garnishModal,
        modalDom = modal.$container[0];

    this.doneBtn = modalDom.querySelector('button.submit');
    this.cancelBtn = modalDom.querySelector('button.cancel');

    this.modalLaunchBtn.addEventListener('click', function (e) {
      e.preventDefault();
      modal.show();
    },false);

    this.doneBtn.addEventListener('click', function (e) {
      e.preventDefault();
      modal.quickHide();
    },false);

    this.cancelBtn.addEventListener('click', function (e){
      e.preventDefault();
      modal.quickHide();
    },false);

  };




  /**
   * Add to global namespace
   */
  window.BibleVerses = BibleVerses;

})( window );
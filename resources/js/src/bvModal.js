class Modal{

    constructor (properties) {
        this._properties = properties;
        this._dom = this._properties.dom;
        this._garnishModal = new Garnish.Modal(this.dom.outerHTML, this._properties.settings);
        this._container = this.garnishModal.$container[0];
        this._bcv = new bcv_parser;
        this._outputVerses;

        this.viewChanged = new CustomEvent("viewChanged",{
            'bubbles': true,
            'cancelable': true
        });

        this.versesReady = new CustomEvent('versesReady', {
            'bubbles': true,
            'cancelable': true
        });

        this.initModalEvents();
    }


    get properties () {
        return this._options;
    }

    set properties (newOpts) {
        this._moptions = newOpts;
    }

    get dom () {
        return this._dom;
    }

    set dom (newDOM) {
        this._dom = newDOM;
    }

    get garnishModal () {
        return this._garnishModal;
    }

    set garnishModal (newGM) {
        this._garnishModal = newGM;
    }

    get container () {
        return this._container;
    }

    set container (newCon) {
        this._container = newCon;
    }

    get bcv(){
        return this._bcv;
    }

    set bcv(newBCV){
        this._bcv = newBCV;
    }

    get outputVerses () {
        return this._outputVerses;
    }

    set outputVerses (newVER) {
        this._outputVerses = newVER;
    }


    openModal () {
        this.garnishModal.show();
    }

    hideModal () {
        this.garnishModal.quickHide();
    }



    /*
     * Set modal element events
     */
    initModalEvents () {

        var $this = this,
            modalDom = $this.container,
            done = modalDom.querySelector('button.submit'),
            cancel = modalDom.querySelector('button.cancel'),
            select = modalDom.querySelector('.bv_modal--select'),
            list = modalDom.querySelector('.bv_modal--verses'),
            books = modalDom.querySelector('.books'),
            verses = modalDom.querySelector('.chapter--verses'),
            search = modalDom.querySelector('.bv_modal--search');

        // Modal done button click event
        done.addEventListener('click', function (e) {
            e.preventDefault();
            $this.collectVerses();
            $this.hideModal();
        },false);

        // Modal cancel button click event
        cancel.addEventListener('click', function (e) {
            e.preventDefault();
         $this.hideModal();
        },false);

        // Modal book chapter click event
        books.addEventListener('click', function (e) {
            var ref,
                elm = e.target;
            if (e.target.className === 'book') {
                ref = elm.dataset.bookId;
            } else if (elm.className === 'book--name') {
                ref = elm.parentNode.dataset.bookId;
            } else if (elm.className === 'book--chapter') {
                ref = elm.dataset.chapterId;
            };

            $this.searchChapters(ref);

        },false);

        // Select a verse
        verses.addEventListener('click', function (e) {

            if (e.target && e.target.nodeName == "SPAN") {
                $this.toggleClass(e.target,'selected');
            }else{
                var result = closest(e.target,'.result');
                var ref = result.dataset.verseId;
                if (ref !== null) {
                    var pv = $this.bcv.parse(ref).parsed_entities(),
                        idx = pv[0].osis.lastIndexOf('.'),
                        bc = pv[0].osis.substring(0,idx),
                        parts = ref.split(':');

                    $this.searchChapters(parts[0] + ":" + bc, function(){
                        $this.container.addEventListener('viewChanged', $this.setVerse([ref]));
                    });
                }
            }

            //GET CLOSETS ELEMENT WITH SELECTOR
            function closest(el, sel) {
                if (el != null){
                    return el.matches(sel) ? el : (el.querySelector(sel) || closest(el.parentNode, sel));
                }
            }

        },false);

        // Toolbar list button
        select.addEventListener('click', function (e) {
            $this.modalState(2);
        },false);

        // Toolbar view button
        list.addEventListener('click', function (e) {
            $this.modalState(1);
        },false);

        // Toolbar search input
        search.addEventListener('change', function (e){
            e.preventDefault();
            var value = e.currentTarget.value;
            $this.searchBible(value);
        },false);

    }


    /**
     * Search bible by chapter
     */
    searchChapters (ref, callback) {
        var $this = this;

        // turn spinner on
        $this.toggleSpinner();

        Craft.postActionRequest('verses/ajax/getPassages', 
            {
                'apiType': 'chapters',
                'osis': ref,
                'endpoint':'chapters',
                'marginalia': false
            }, 
            function(data){                
                $this.listView(data.response.chapters);
                // Make sure the callback is a function​
                if (typeof callback === "function") {
                    // Execute the callback function and pass the parameters to it​
                    callback(true);
                }

                // output fums scripts
                $this.fums(data.response.meta.fums_js_include);
            }
        );
    }


    /**
     * Search bible by keyword phrase
     */
    searchBible (value) {
        this.modalState(1);
        this.toggleSpinner();

        var $this = this,
             ref = value;

        Craft.postActionRequest('verses/ajax/getPassages', 
            {
                'apiType': 'search',
                'query': ref,
                'version': $this.container.dataset.version 
            }, 
            function(data){ 
                var results = data.response.search.result;
                if (results.type === "verses") {
                    $this.searchView(results.verses);
                }else if (results.type === "passages"){

                    // Get verses from chapters api 
                    var result = results.passages[0],
                        parsedEURL = $this.parseUrl(result.path),
                        start_verse_id = result.start_verse_id,
                        osis = parsedEURL.segments[1];

                    // Get all verses in Chapter
                    $this.searchVerses(
                        {
                            'apiType': 'chapters',
                            'osis': osis
                        },
                        function(data){

                            // set the list with the chapter verses
                            $this.listView(data.response.chapters);

                            var start = parsedEURL.params.start,
                                end = parsedEURL.params.end,
                                selARY = [];

                            if (start == end) {
                                // If verse has same start as end only one osis verse needed.
                                selARY[0] = start_verse_id;
                            }else{

                                // If more than one verses selected create an array of them.
                                // Using start & end params to generate array of osis verses.
                                var last_dot_idx = start_verse_id.lastIndexOf('.'),
                                    base = start_verse_id.substring(0,last_dot_idx);
 
                                for (var i = start; i <= end; i++) {
                                    var newref = base + "." + i;
                                    selARY.push(newref);
                                };

                                // Select all verses initially searched for
                                $this.setVerse(selARY);
                            }
                        }
                    )
                }

                // output fums scripts
                $this.fums(data.response.meta.fums_js_include);
            }
        );
    }


    /**
     * Search for all verses in a Chapter
     * @param  {object}   options  [apiType = chapters, osis = eng-ESV:Rom.5]
     * @param  {Function} callback return verses array
     * @return {array}            verses
     */
    searchVerses (options, callback) {

        Craft.postActionRequest('verses/ajax/getPassages', options, 
        function(data){ 
            // Make sure the callback is a function​
            if (typeof callback === "function") {
                // Execute the callback function and pass the parameters to it​
                callback(data);
            }
        });

    }



    /*
    * List Verses
    */
    listView (data) {
        this.modalState(1);
        this.toggleSpinner();
        var view = this.container.querySelectorAll('.chapter--verses')[0],
            verses = data,
            output = "",
            readable = new Readable(),
            verse = verses[0].id.split(":"),
            heading = readable.osis_to_readable('long',verse[1]),
            copyElm = document.createElement('div'),
            headingElm = document.createElement('h3'),
            verse;

        for(verse of verses){
            output += verse.text;
        }

        headingElm.innerHTML = heading;
        headingElm.classList.add('bc-heading');
        copyElm.innerHTML = verses[0].copyright;
        copyElm.classList.add('copyright');

        view.innerHTML = output;
        view.appendChild(copyElm);
        view.insertBefore(headingElm,view.firstChild);

        this.container.dispatchEvent(this.viewChanged);
    }




    /**
     * Ouputs the search results to the chapter--verses dom
     * @param  {obj} data {array of verses}
     */
    searchView (data) {
        this.modalState(1);
        this.toggleSpinner();
        var view = this.container.querySelectorAll('.chapter--verses')[0],
            template = document.querySelector('.bv_result--template').innerHTML,
            results = data,
            copy = document.createElement('div'),
            output = "",
            result;

        if(results !== undefined) {

            Mustache.tags = ["<%", "%>"];
            Mustache.parse(template);

            for(result of results){
                output += Mustache.render(template, result);
            }

            copy.innerHTML = results[0].copyright;
            copy.classList.add('copyright');

            view.innerHTML = output;
            view.appendChild(copy);
        } else {
            this.modalState(3);
        }

    }


    /**
     * Selects the verses searched for in chapter--verses dom
     * @param {array} refs [array of osis chapter verses  eng-ESV:Rom.8.28]
     */
    setVerse (refs) {

        var view = this.container.querySelector('.chapter--verses'),
            readable = new Readable(),
            abbrevs = readable.abbrevs;

        if (refs.length > 0) {
            for(var i = 0; i < refs.length; i++){
                var parts = refs[i].split(':'),
                    bc = parts[1].trim(),
                    partials = bc.split('.'),
                    index = abbrevs.indexOfKey(partials[0]),
                    selector = "span.v" + index +"_"+ partials[1] +"_"+ partials[2],
                    v = view.querySelectorAll(selector)[0];
                v.classList.add('selected');
            }
        }
    }



    /*
     * Set the state of the modal
     * Toggle specific views
     */
    modalState (pos) {
        var modalDom = this.container,
            select = modalDom.querySelector('.bv_modal--select'),
            list = modalDom.querySelector('.bv_modal--verses');

        if (pos === 1) {
            modalDom.classList.add('state1');
            modalDom.classList.remove('state2');
            modalDom.classList.remove('state3');
        }

        if (pos === 2) {
            modalDom.classList.add('state2');
            modalDom.classList.remove('state1');
            modalDom.classList.remove('state3');
        }

        if (pos === 3) {
            modalDom.classList.remove('state1');
            modalDom.classList.remove('state2');
            modalDom.classList.add('state3');
        }

        this.toggleClass(select,'active');
        this.toggleClass(list,'active');
    }




    /**
     * Collect all verses with class selected from modal list
     * Sets modal variable outputVerses
     */
    collectVerses () {
        var list = this.container.querySelector('.bv_modal--list'),
            collection = [],
            output = [],
            sel = list.querySelectorAll('.selected > sup');

        for(var i = 0; i < sel.length; i++){
            var item = sel[i];
            collection.push(item.getAttribute('id'));
        }

        var parsed = this.bcv.parse(collection.join(',')),
            readable = new Readable();

        if (this.separateVerses(parsed.osis())) {
            // multiple verses
            var osS = parsed.osis();
            var mVs = osS.split(','); 
            for (var i = 0, ii = mVs.length; i < ii; i++) {
                output.push(readable.osis_to_readable('long',mVs[i]));
            }
        }else{
            // single verse
            output.push(readable.osis_to_readable('long',parsed.osis()));
        }

        // set modal variable outputVerses
        this.outputVerses = output;

        // dispatch versesReady event
        this.dom.dispatchEvent(this.versesReady);
    }



    /**
     * TOGGLE NODE CLASS ie9+
     */
    toggleClass (el,className) {
        if (el.classList) {
            el.classList.toggle(className);
        } else {
            var classes = el.className.split(' ');
            var existingIndex = classes.indexOf(className);

            if (existingIndex >= 0)
            classes.splice(existingIndex, 1);
            else
            classes.push(className);

            el.className = classes.join(' ');
        }
    }



    /**
     * Check if passage is multiple verses if so split return array of verses.
     * @param  {string} passage string of bible verse(s)
     * @return {array}  array of verses split comma
     */
    separateVerses (passage) {
        if (passage.indexOf(',') !== -1) {
            return true;
        }else{
            return false;
        }
    }



    /**
     * parse a url into its parts
     * @param  {string} url 
     * @return {object} parts of a url
     */
    parseUrl (url) {
       var a =  document.createElement('a');
       a.href = url;
       return {
           source: url,
           protocol: a.protocol.replace(':',''),
           host: a.hostname,
           port: a.port,
           query: a.search,
           params: (function(){
               var ret = {},
                   seg = a.search.replace(/^\?/,'').split('&'),
                   len = seg.length, i = 0, s;
               for (;i<len;i++) {
                   if (!seg[i]) { continue; }
                   s = seg[i].split('=');
                   ret[s[0]] = s[1];
               }
               return ret;
           })(),
           file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
           hash: a.hash.replace('#',''),
           path: a.pathname.replace(/^([^\/])/,'/$1'),
           relative: (a.href.match(/tp:\/\/[^\/]+(.+)/) || [,''])[1],
           segments: a.pathname.replace(/^\//,'').split('/')
       };
    }
    

    /**
     * Append bibles.org FUMS scripts to body
     * @param  {string} codeURL url to js file
     */
    fums (codeURL) {
        var JS = document.createElement('script');
        JS.setAttribute('src','//' + codeURL);
        document.body.appendChild(JS);
    }


    /*
    * Toggle spinner
    */
    toggleSpinner () {
        var spinner = this.container.querySelector('.spinner');
        this.toggleClass(spinner,'hidden');
    }

}
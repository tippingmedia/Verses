/*
 * BV ES6 CLASS
 */
class BvInput {

    constructor(options) {
        this._inputDom = document.getElementById(options.item);
        this._bcv = new bcv_parser();
        this._modal = new Modal({
            dom: this._inputDom.querySelector('.bv_modal'),
            settings: {
                'resizable': true,
                'autoShow': false
            }
        });
        this.initEvents();
    }

    get inputDom() {
        return this._inputDom;
    }

    set inputDom(obj) {
        this._inputDom = obj;
    }

    get bcv() {
        return this._bcv;
    }

    set bcv(newBCV) {
        this._bcv = newBCV;
    }

    get modal() {
        return this._modal;
    }

    /**
     * Initiate event listeners
     */
    initEvents() {

        var $this = this,
            btn = this.inputDom.querySelector('.bv_action--btn'),
            field = this.inputDom.querySelector('.bv_action--field'),
            elements = this.inputDom.querySelector('.bv_elements'),
            modal = this.modal;
        let huds = [];

        /** When book button click open modal */
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            modal.openModal();
        }, false);

        /** Passage input action */
        // field.addEventListener('change', function (e) {
        //     e.preventDefault();
        //     e.stopPropagation();
        //     var value = e.currentTarget.value;
        //     $this.validatePassage(value, function (response) {
        //         if (response.error === false) {
        //             $this.createTagElement(response.data);
        //         };
        //     });
        // },false);


        /** When the keydown on the input is ENTER */
        field.onkeydown = function (e) {
            e = e || event;
            if (e.keyCode == 13) {
                e.preventDefault();
                e.stopPropagation();
                $this.validatePassage(e.currentTarget.value, function (response) {
                    if (response.error === "none") {
                        $this.createTagElement(response.data);
                    };
                });
            }
        };

        /** listens for element delete button click */
        elements.addEventListener('click', function (e) {

            // clicked remove icon
            if (e.target && e.target.nodeName == "A") {
                const tg = e.target;
                tg.parentNode.classList.add('remove');
                const transitionEvent = $this.whichTransitionEvent();
                tg.parentNode.addEventListener(transitionEvent, removeElement);

                function removeElement(event) {
                    tg.parentNode.removeEventListener(transitionEvent, removeElement);
                    $this.deleteElement(event.target);
                }
            }

            // clicked the element
            if (e.target && e.target.nodeName !== "A" && (e.target.classList.contains('element') || e.target.parentNode.classList.contains('element') || e.target.parentNode.parentNode.classList.contains('element'))) {

                let tg = e.target;

                if (e.target.nodeName === "DIV" && e.target.classList.contains('element')) {
                    tg = e.target;
                } else if (e.target.nodeName === "INPUT" || e.target.nodeName === "DIV" && e.target.classList.contains('label')) {
                    tg = e.target.parentNode;
                } else if (e.target.nodeName === "SPAN" && e.target.classList.contains('title')) {
                    tg = e.target.parentNode.parentNode;
                }

                const value = tg.querySelectorAll('input')[1].value;

                //NEED CLEANER WAY TO FETCH SEARCH
                Craft.postActionRequest('verses/ajax/getPassages', {
                    'apiType': 'search',
                    'query': value,
                    'version': $this._modal._container.dataset.version
                }, function (ref) {
                    if (!huds[value]) {
                        const passage = ref.response.search.result.passages[0];
                        const hudContents = `
                            <div class="hud-header">
                                <strong>${passage.display}</strong>
                            </div>
                            <div class="content-reference-hud">${passage.text}<div class="copyright">${passage.copyright}</div></div>`;

                        const hud = new Garnish.HUD($(e.target), $(hudContents), {
                            bodyClass: 'verses-reference-hud',
                            closeOtherHUDs: true,
                            minBodyWidth: 200
                        });

                        hud.$hud.attr("id", value);
                        huds[value] = hud;

                        hud.show();
                    } else {
                        huds[value].show();
                    }
                });
            }
        }, false);

        /** 
         * Listens for custom event versesReady.
         * When event fired grabs selected verses from modal creates elements.
         */
        this.inputDom.addEventListener('versesReady', function (e) {
            var items = $this.modal.outputVerses;
            for (var i = 0, ii = items.length; i < ii; i++) {
                $this.validatePassage(items[i], function (response) {
                    if (response.error === "none") {
                        $this.createTagElement(response.data);
                    };
                });
            }
        }, false);
    }

    /**
     * Validate passage with BVC parser
     * @param  {string} passage bible verse
     * @return {boolean}         if passage is valid
     */
    validatePassage(passage, callback) {
        var parsed = this.bcv.parse(passage),
            options = {};

        if (parsed.entities.length > 0) {
            options.error = "none";
            options.data = parsed;
        } else {
            options.error = "error";
        }

        // Make sure the callback is a function​
        if (typeof callback === "function") {
            // Execute the callback function and pass the parameters to it​
            callback(options);
        }
    }

    /** Creates element tag input */
    createTagElement(passage) {
        var $this = this,
            elements = this.inputDom.querySelector('.bv_elements'),
            template = this.inputDom.querySelector('.bv_element--template').innerHTML,
            output = {},
            idx = elements.querySelectorAll('.element'),
            readable = new Readable(),
            verse;

        Mustache.tags = ["<%", "%>"];
        Mustache.parse(template);

        output.osis = passage.osis();
        output.passage = readable.osis_to_readable("long", output.osis);
        output.idx = idx.length + 1;

        var element = Mustache.render(template, output);
        $(this.inputDom).find('.bv_elements').append(element);

        var anims = elements.querySelectorAll('.el-anim');
        setTimeout(function () {
            for (var i = 0; i < anims.length; i++) {
                anims[i].classList.remove('el-anim');
            }
        }, 20);

        // Load passage into cache for HUD.
        Craft.postActionRequest('verses/ajax/getPassages', {
            'apiType': 'search',
            'query': output.osis,
            'version': $this._modal._container.dataset.version
        }, function () {});

        this.clearField();
    }

    /** Delete and element from list */
    deleteElement(elm) {
        var el = elm;
        el.parentNode.removeChild(el);
        this.reindexElements();
    }

    /**
     * When element is removed reindex input name arrays
     */
    reindexElements() {
        var elmWrapper = this.inputDom.querySelector('.bv_elements'),
            elements = elmWrapper.querySelectorAll('.element--input');
        var regex = new RegExp(/([^a-zA-Z]\d*\])/);
        var t = 1,
            i = 1,
            m = 1;
        while (i - 1 < elements.length) {
            var name = elements[i - 1].getAttribute('name');
            var newname = name.replace(regex, "[" + t + "]");
            elements[i - 1].setAttribute('name', newname);
            i++;
            // only increment t every two times. 
            if (m == 2) {
                m = 1;
                t++;
            } else {
                m++;
            }
        }
    }

    clearField() {
        var field = this.inputDom.querySelector('.bv_action--field');
        field.value = "";
    }

    whichTransitionEvent() {
        var t,
            el = document.createElement("fakeelement");

        var transitions = {
            "transition": "transitionend",
            "OTransition": "oTransitionEnd",
            "MozTransition": "transitionend",
            "WebkitTransition": "webkitTransitionEnd"
        };

        for (t in transitions) {
            if (el.style[t] !== undefined) {
                return transitions[t];
            }
        }
    }
}
class Readable {

    constructor(options) {
        this._abbrevs = {
            "Gen": ["Genesis", "Gen", "Ge"],
            "Exod": ["Exodus", "Exod", "Ex"],
            "Lev": ["Leviticus", "Lev", "Lv"],
            "Num": ["Numbers", "Num", "Nu"],
            "Deut": ["Deuteronomy", "Deut", "Dt"],
            "Josh": ["Joshua", "Josh"],
            "Judg": ["Judges", "Judg", "Jg"],
            "Ruth": ["Ruth", "Ruth", "Rt"],
            "1Sam": ["1 Samuel", "1 Sam", "1 Sa"],
            "2Sam": ["2 Samuel", "2 Sam", "2 Sa"],
            "1Kgs": ["1 Kings", "1 Kgs", "1 Kg"],
            "2Kgs": ["2 Kings", "2 Kgs", "2 Kg"],
            "1Chr": ["1 Chronicles", "1 Chr", "1 Ch"],
            "2Chr": ["2 Chronicles", "2 Chr", "2 Ch"],
            "Ezra": ["Ezra", "Ezra", "Ezr"],
            "Neh": ["Nehemiah", "Neh"],
            "Esth": ["Esther", "Esth", "Est"],
            "Job": ["Job"],
            "Ps": ["Psalms", "Ps", "Ps", "Psalm"],
            "Prov": ["Proverbs", "Prov", "Pr"],
            "Eccl": ["Ecclesiastes", "Eccl", "Ec"],
            "Song": ["Song of Songs", "Song", "Sg"],
            "Isa": ["Isaiah", "Isa", "Is"],
            "Jer": ["Jeremiah", "Jer", "Je"],
            "Lam": ["Lamentations", "Lam", "La"],
            "Ezek": ["Ezekiel", "Ezek", "Ezk"],
            "Dan": ["Daniel", "Dan", "Dn"],
            "Hos": ["Hosea", "Hos", "Ho"],
            "Joel": ["Joel", "Joel", "Jl"],
            "Amos": ["Amos", "Amos", "Am"],
            "Obad": ["Obadiah", "Obad", "Ob"],
            "Jonah": ["Jonah", "Jonah", "Jon"],
            "Mic": ["Micah", "Mic"],
            "Nah": ["Nahum", "Nah", "Na"],
            "Hab": ["Habakkuk", "Hab"],
            "Zeph": ["Zephaniah", "Zeph", "Zph"],
            "Hag": ["Haggai", "Hag"],
            "Zech": ["Zechariah", "Zech", "Zch"],
            "Mal": ["Malachi", "Mal"],
            "Matt": ["Matthew", "Matt", "Mt"],
            "Mark": ["Mark", "Mark", "Mk"],
            "Luke": ["Luke", "Luke", "Lk"],
            "John": ["John", "John", "Jn"],
            "Acts": ["Acts", "Acts", "Ac"],
            "Rom": ["Romans", "Rom", "Ro"],
            "1Cor": ["1 Corinthians", "1 Cor", "1 Co"],
            "2Cor": ["2 Corinthians", "2 Cor", "2 Co"],
            "Gal": ["Galatians", "Gal"],
            "Eph": ["Ephesians", "Eph"],
            "Phil": ["Philippians", "Phil"],
            "Col": ["Colossians", "Col"],
            "1Thess": ["1 Thessalonians", "1 Thess", "1 Th"],
            "2Thess": ["2 Thessalonians", "2 Thess", "2 Th"],
            "1Tim": ["1 Timothy", "1 Tim", "1 Ti"],
            "2Tim": ["2 Timothy", "2 Tim", "2 Ti"],
            "Titus": ["Titus"],
            "Phlm": ["Philemon", "Phlm", "Phm"],
            "Heb": ["Hebrews", "Heb"],
            "Jas": ["James", "Jas"],
            "1Pet": ["1 Peter", "1 Pet", "1 Pt"],
            "2Pet": ["2 Peter", "2 Pet", "2 Pt"],
            "1John": ["1 John", "1 John", "1 Jn"],
            "2John": ["2 John", "2 John", "2 Jn"],
            "3John": ["3 John", "3 John", "3 Jn"],
            "Jude": ["Jude"],
            "Rev": ["Revelation", "Rev", "Rv"],
            "Tob": ["Tobit", "Tob"],
            "Jdt": ["Judith", "Jdt"],
            "GkEsth": ["Greek Esther", "Gk Esth", "Gk Est"],
            "Wis": ["Wisdom", "Wis"],
            "Sir": ["Sirach", "Sir"],
            "Bar": ["Baruch", "Bar"],
            "PrAzar": ["Prayer of Azariah", "Pr Azar"],
            "Sus": ["Susannah", "Sus"],
            "Bel": ["Bel and the Dragon", "Bel"],
            "SgThree": ["Song of the Three Young Men", "SgThree"],
            "EpJer": ["Epistle of Jeremiah", "Ep Jer"],
            "1Macc": ["1 Maccabees", "1 Macc", "1 Mc"],
            "2Macc": ["2 Maccabees", "2 Macc", "2 Mc"],
            "3Macc": ["3 Maccabees", "3 Macc", "3 Mc"],
            "4Macc": ["4 Maccabees", "4 Macc", "4 Mc"],
            "1Esd": ["1 Esdras", "1 Esd"],
            "2Esd": ["2 Esdras", "2 Esd"],
            "PrMan": ["Prayer of Manasseh", "Pr Man"]
        };

        this.separators = {
            "bc": " ",
            "bv": " ",
            "cv": ":",
            "range_b": "\u2014",
            "range_c": "\u2014",
            "range_v": "\u2013",
            "sequence": ", "
        };

        this.output_types = {
            "long": 0,
            "short": 1,
            "shorter": 2,
            "single": 3
        };

        this.single_chapter_books = [];

        this._bcv = new bcv_parser();
    }

    get abbrevs() {
        return this._abbrevs;
    }

    set abbrevs(newABB) {
        this._abbrevs = newABB;
    }

    get bcv() {
        return this._bcv;
    }

    set bcv(newBCV) {
        this._bcv = newBCV;
    }

    osis_to_readable(output_type, osis) {
        var end, ref, start;
        ref = osis.split("-"), start = ref[0], end = ref[1];
        if (end != null) {
            return this.handle_range(start, end, output_type);
        } else {
            return this.handle_single(start, output_type);
        }
    }

    handle_range(start, end, output_type) {
        var $this = this,
            eb,
            ec,
            ev,
            is_single_chapter,
            ref,
            ref1,
            sb,
            sc,
            sv;
        ref = start.split("."), sb = ref[0], sc = ref[1], sv = ref[2];
        ref1 = end.split("."), eb = ref1[0], ec = ref1[1], ev = ref1[2];
        if (sb === eb) {
            if (sc === ec) {
                return "" + this.handle_single(start, output_type, true, true) + this.separators.range_v + ev;
            } else {
                if (ev != null) {
                    if (sv == null) {
                        start += ".1";
                    }
                    return "" + this.handle_single(start, output_type, false, true) + this.separators.range_c + ec + this.separators.cv + ev;
                } else if (sv != null) {
                    return "" + this.handle_single(start, output_type, false, true) + this.separators.range_c + ec + this.separators.cv + get_end_verse(eb, ec);
                } else {
                    return "" + this.handle_single(start, output_type, false, true) + this.separators.range_c + ec;
                }
            }
        } else if (ec != null) {
            if (sc == null) {
                start += ".1";
            }
            if (ev != null && sv == null) {
                start += ".1";
            }
            if (sv != null && ev == null) {
                end += "." + get_end_verse(eb, ec);
            }
            return "" + this.handle_single(start, output_type, true, true) + this.separators.range_b + this.handle_single(end, output_type, true);
        } else {
            is_single_chapter = true;
            if (sc != null) {
                ec = get_end_chapter(eb);
                end += "." + ec;
                if (sv != null) {
                    end += "." + get_end_verse(eb, ec);
                }
            } else {
                is_single_chapter = false;
            }
            return "" + this.handle_single(start, output_type, is_single_chapter, true) + this.separators.range_b + this.handle_single(end, output_type, is_single_chapter);
        }
    }

    handle_single(osis, output_type, is_single_chapter, is_range_start) {
        var b, c, ref, v;
        if (is_single_chapter == null) {
            is_single_chapter = true;
        }
        if (is_range_start == null) {
            is_range_start = false;
        }
        ref = osis.split("."), b = ref[0], c = ref[1], v = ref[2];
        if (c != null) {
            if (v != null) {
                if (c === "1" && (v !== "1" || is_range_start) && this.is_single_chapter_book(b)) {
                    return "" + this.get_best_book(b, output_type, is_single_chapter) + this.separators.bv + v;
                } else {
                    return "" + this.get_best_book(b, output_type, is_single_chapter) + this.separators.bc + c + this.separators.cv + v;
                }
            } else {
                return "" + this.get_best_book(b, output_type, is_single_chapter) + this.separators.bc + c;
            }
        } else {
            return this.get_best_book(b, output_type, is_single_chapter);
        }
    }

    get_best_book(b, output_type, is_single_chapter) {
        var output_id;
        output_id = this.output_types[output_type] || 0;
        while (output_id > 0) {
            if (this.abbrevs[b][output_id] != null) {
                break;
            }
            output_id--;
        }
        if (is_single_chapter && output_id === 0 && this.abbrevs[b][this.output_types["single"]] != null) {
            output_id = this.output_types["single"];
        }
        return this.abbrevs[b][output_id];
    }

    is_single_chapter_book(book) {
        var end, osis, out, ref, start;
        if (this.single_chapter_books[book] != null) {
            return this.single_chapter_books[book];
        }
        osis = this.bcv.parse(book + " 2").osis();
        // split('-') to split('.')
        ref = osis.split("."), start = ref[0], end = ref[1];
        out = end != null ? false : true;
        this.single_chapter_books[book] = out;
        return out;
    }

    get_end_chapter(b) {
        var c, end, ref, ref1, start, v;
        ref = this.bcv.parse(b + " 1-999").osis().split("-"), start = ref[0], end = ref[1];
        ref1 = end.split("."), b = ref1[0], c = ref1[1], v = ref1[2];
        return c;
    }

    get_end_verse(b, c) {
        var end, ref, ref1, start, v;
        ref = this.bcv.parse(b + " " + c).osis().split("-"), start = ref[0], end = ref[1];
        ref1 = end.split("."), b = ref1[0], c = ref1[1], v = ref1[2];
        return v;
    }
}
class Modal {

    constructor(properties) {
        this._properties = properties;
        this._dom = this._properties.dom;
        this._garnishModal = new Garnish.Modal(this.dom.outerHTML, this._properties.settings);
        this._container = this.garnishModal.$container[0];
        this._bcv = new bcv_parser();
        this._outputVerses;

        this.viewChanged = new CustomEvent("viewChanged", {
            'bubbles': true,
            'cancelable': true
        });

        this.versesReady = new CustomEvent('versesReady', {
            'bubbles': true,
            'cancelable': true
        });

        this.initModalEvents();
    }

    get properties() {
        return this._options;
    }

    set properties(newOpts) {
        this._moptions = newOpts;
    }

    get dom() {
        return this._dom;
    }

    set dom(newDOM) {
        this._dom = newDOM;
    }

    get garnishModal() {
        return this._garnishModal;
    }

    set garnishModal(newGM) {
        this._garnishModal = newGM;
    }

    get container() {
        return this._container;
    }

    set container(newCon) {
        this._container = newCon;
    }

    get bcv() {
        return this._bcv;
    }

    set bcv(newBCV) {
        this._bcv = newBCV;
    }

    get outputVerses() {
        return this._outputVerses;
    }

    set outputVerses(newVER) {
        this._outputVerses = newVER;
    }

    openModal() {
        this.garnishModal.show();
    }

    hideModal() {
        this.garnishModal.quickHide();
    }

    /*
     * Set modal element events
     */
    initModalEvents() {

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
        }, false);

        // Modal cancel button click event
        cancel.addEventListener('click', function (e) {
            e.preventDefault();
            $this.hideModal();
        }, false);

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
        }, false);

        // Select a verse
        verses.addEventListener('click', function (e) {

            if (e.target && e.target.nodeName == "SPAN") {
                $this.toggleClass(e.target, 'selected');
            } else {
                var result = closest(e.target, '.result');
                var ref = result.dataset.verseId;
                if (ref !== null) {
                    var pv = $this.bcv.parse(ref).parsed_entities(),
                        idx = pv[0].osis.lastIndexOf('.'),
                        bc = pv[0].osis.substring(0, idx),
                        parts = ref.split(':');

                    $this.searchChapters(parts[0] + ":" + bc, function () {
                        $this.container.addEventListener('viewChanged', $this.setVerse([ref]));
                    });
                }
            }

            //GET CLOSETS ELEMENT WITH SELECTOR
            function closest(el, sel) {
                if (el != null) {
                    return el.matches(sel) ? el : el.querySelector(sel) || closest(el.parentNode, sel);
                }
            }
        }, false);

        // Toolbar list button
        select.addEventListener('click', function (e) {
            $this.modalState(2);
        }, false);

        // Toolbar view button
        list.addEventListener('click', function (e) {
            $this.modalState(1);
        }, false);

        // Toolbar search input
        search.addEventListener('change', function (e) {
            e.preventDefault();
            var value = e.currentTarget.value;
            $this.searchBible(value);
        }, false);
    }

    /**
     * Search bible by chapter
     */
    searchChapters(ref, callback) {
        var $this = this;

        // turn spinner on
        $this.toggleSpinner();

        Craft.postActionRequest('verses/ajax/getPassages', {
            'apiType': 'chapters',
            'osis': ref,
            'endpoint': 'chapters',
            'marginalia': false
        }, function (data) {
            $this.listView(data.response.chapters);
            // Make sure the callback is a function​
            if (typeof callback === "function") {
                // Execute the callback function and pass the parameters to it​
                callback(true);
            }

            // output fums scripts
            $this.fums(data.response.meta.fums_js_include);
        });
    }

    /**
     * Search bible by keyword phrase
     */
    searchBible(value) {
        this.modalState(1);
        this.toggleSpinner();

        var $this = this,
            ref = value;

        Craft.postActionRequest('verses/ajax/getPassages', {
            'apiType': 'search',
            'query': ref,
            'version': $this.container.dataset.version
        }, function (data) {
            var results = data.response.search.result;
            if (results.type === "verses") {
                $this.searchView(results.verses);
            } else if (results.type === "passages") {

                // Get verses from chapters api 
                var result = results.passages[0],
                    parsedEURL = $this.parseUrl(result.path),
                    start_verse_id = result.start_verse_id,
                    osis = parsedEURL.segments[1];
                // Get all verses in Chapter
                $this.searchVerses({
                    'apiType': 'chapters',
                    'osis': osis
                }, function (data) {

                    // set the list with the chapter verses
                    $this.listView(data.response.chapters);

                    var start = parsedEURL.params.start,
                        end = parsedEURL.params.end,
                        selARY = [];

                    if (start == end) {
                        // If verse has same start as end only one osis verse needed.
                        selARY[0] = start_verse_id;
                    } else {

                        // If more than one verses selected create an array of them.
                        // Using start & end params to generate array of osis verses.
                        var last_dot_idx = start_verse_id.lastIndexOf('.'),
                            base = start_verse_id.substring(0, last_dot_idx);

                        for (var i = start; i <= end; i++) {
                            var newref = base + "." + i;
                            selARY.push(newref);
                        };

                        // Select all verses initially searched for
                        $this.setVerse(selARY);
                    }
                });
            }

            // output fums scripts
            $this.fums(data.response.meta.fums_js_include);
        });
    }

    /**
     * Search for all verses in a Chapter
     * @param  {object}   options  [apiType = chapters, osis = eng-ESV:Rom.5]
     * @param  {Function} callback return verses array
     * @return {array}            verses
     */
    searchVerses(options, callback) {

        Craft.postActionRequest('verses/ajax/getPassages', options, function (data) {
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
    listView(data) {
        this.modalState(1);
        this.toggleSpinner();
        var view = this.container.querySelectorAll('.chapter--verses')[0],
            verses = data,
            output = "",
            readable = new Readable(),
            verse = verses[0].id.split(":"),
            heading = readable.osis_to_readable('long', verse[1]),
            copyElm = document.createElement('div'),
            headingElm = document.createElement('h3'),
            verse;

        for (verse of verses) {
            output += verse.text;
        }

        headingElm.innerHTML = heading;
        headingElm.classList.add('bc-heading');
        copyElm.innerHTML = verses[0].copyright;
        copyElm.classList.add('copyright');

        view.innerHTML = output;
        view.appendChild(copyElm);
        view.insertBefore(headingElm, view.firstChild);

        this.container.dispatchEvent(this.viewChanged);
    }

    /**
     * Ouputs the search results to the chapter--verses dom
     * @param  {obj} data {array of verses}
     */
    searchView(data) {
        this.modalState(1);
        this.toggleSpinner();
        var view = this.container.querySelectorAll('.chapter--verses')[0],
            template = document.querySelector('.bv_result--template').innerHTML,
            results = data,
            copy = document.createElement('div'),
            output = "",
            result;

        if (results !== undefined) {

            Mustache.tags = ["<%", "%>"];
            Mustache.parse(template);

            for (result of results) {
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
    setVerse(refs) {

        var view = this.container.querySelector('.chapter--verses'),
            readable = new Readable(),
            abbrevs = readable.abbrevs;

        if (refs.length > 0) {
            for (var i = 0; i < refs.length; i++) {
                var parts = refs[i].split(':'),
                    bc = parts[1].trim(),
                    partials = bc.split('.'),
                    index = abbrevs.indexOfKey(partials[0]),
                    selector = "span.v" + index + "_" + partials[1] + "_" + partials[2],
                    v = view.querySelectorAll(selector)[0];
                v.classList.add('selected');
            }
        }
    }

    /*
     * Set the state of the modal
     * Toggle specific views
     */
    modalState(pos) {
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

        this.toggleClass(select, 'active');
        this.toggleClass(list, 'active');
    }

    /**
     * Collect all verses with class selected from modal list
     * Sets modal variable outputVerses
     */
    collectVerses() {
        var list = this.container.querySelector('.bv_modal--list'),
            collection = [],
            output = [],
            sel = list.querySelectorAll('.selected > sup');

        for (var i = 0; i < sel.length; i++) {
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
                output.push(readable.osis_to_readable('long', mVs[i]));
            }
        } else {
            // single verse
            output.push(readable.osis_to_readable('long', parsed.osis()));
        }

        // set modal variable outputVerses
        this.outputVerses = output;

        // dispatch versesReady event
        this.dom.dispatchEvent(this.versesReady);
    }

    /**
     * TOGGLE NODE CLASS ie9+
     */
    toggleClass(el, className) {
        if (el.classList) {
            el.classList.toggle(className);
        } else {
            var classes = el.className.split(' ');
            var existingIndex = classes.indexOf(className);

            if (existingIndex >= 0) classes.splice(existingIndex, 1);else classes.push(className);

            el.className = classes.join(' ');
        }
    }

    /**
     * Check if passage is multiple verses if so split return array of verses.
     * @param  {string} passage string of bible verse(s)
     * @return {array}  array of verses split comma
     */
    separateVerses(passage) {
        if (passage.indexOf(',') !== -1) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * parse a url into its parts
     * @param  {string} url 
     * @return {object} parts of a url
     */
    parseUrl(url) {
        var a = document.createElement('a');
        a.href = url;
        return {
            source: url,
            protocol: a.protocol.replace(':', ''),
            host: a.hostname,
            port: a.port,
            query: a.search,
            params: function () {
                var ret = {},
                    seg = a.search.replace(/^\?/, '').split('&'),
                    len = seg.length,
                    i = 0,
                    s;
                for (; i < len; i++) {
                    if (!seg[i]) {
                        continue;
                    }
                    s = seg[i].split('=');
                    ret[s[0]] = s[1];
                }
                return ret;
            }(),
            file: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1],
            hash: a.hash.replace('#', ''),
            path: a.pathname.replace(/^([^\/])/, '/$1'),
            relative: (a.href.match(/tp:\/\/[^\/]+(.+)/) || [, ''])[1],
            segments: a.pathname.replace(/^\//, '').split('/')
        };
    }

    /**
     * Append bibles.org FUMS scripts to body
     * @param  {string} codeURL url to js file
     */
    fums(codeURL) {
        var JS = document.createElement('script');
        JS.setAttribute('src', '//' + codeURL);
        document.body.appendChild(JS);
    }

    /*
    * Toggle spinner
    */
    toggleSpinner() {
        var spinner = this.container.querySelector('.spinner');
        this.toggleClass(spinner, 'hidden');
    }

}
(function () {

    // Extension of Array to help find elements in array
    if (![].includes) {
        Array.prototype.includes = function (searchElement /*, fromIndex*/) {
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
                if (k < 0) {
                    k = 0;
                }
            }
            var currentElement;
            while (k < len) {
                currentElement = O[k];
                if (searchElement === currentElement || searchElement !== searchElement && currentElement !== currentElement) {
                    return true;
                }
                k++;
            }
            return false;
        };
    }

    function CustomEvent(event, params) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }

    CustomEvent.prototype = window.Event.prototype;
    window.CustomEvent = CustomEvent;

    Object.defineProperty(Object.prototype, "indexOfKey", {
        value: function (value) {
            var i = 1;
            for (var key in this) {
                if (key == value) {
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
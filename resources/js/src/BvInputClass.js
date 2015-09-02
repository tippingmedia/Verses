/*
 * BV ES6 CLASS
 */
class BvInput{

    constructor (options) {
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


    get inputDom(){
        return this._inputDom;
    }

    set inputDom(obj){
        this._inputDom = obj;
    }

    get bcv(){
        return this._bcv;
    }

    set bcv(newBCV){
        this._bcv = newBCV;
    }

    get modal (){
        return this._modal;
    }




    /**
     * Initiate event listeners
     */
    initEvents () {

        var $this = this,
            btn = this.inputDom.querySelector('.bv_action--btn'),
            field = this.inputDom.querySelector('.bv_action--field'),
            elements = this.inputDom.querySelector('.bv_elements'),
            modal = this.modal;


        /** When book button click open modal */
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            modal.openModal();
        },false);


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
        field.onkeydown = function(e) {
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
        }


        /** listens for element delete button click */
        elements.addEventListener('click', function (e) {
            if (e.target && e.target.nodeName == "A") {
                var tg = e.target;
                tg.parentNode.classList.add('remove');
                var transitionEvent = $this.whichTransitionEvent();
                tg.parentNode.addEventListener(transitionEvent, removeElement);
                function removeElement(event){
                    tg.parentNode.removeEventListener(transitionEvent, removeElement);
                    $this.deleteElement(event.target);
                }
            }
        },false);


        /** 
         * Listens for custom event versesReady.
         * When event fired grabs selected verses from modal creates elements.
         */
        this.inputDom.addEventListener('versesReady', function(e){
            var items = $this.modal.outputVerses;
            for (var i = 0, ii = items.length; i < ii; i++) {
                $this.validatePassage(items[i], function (response) {
                    if (response.error === "none") {
                        $this.createTagElement(response.data);
                    };
                });
            }
        },false);
    }



    /**
     * Validate passage with BVC parser
     * @param  {string} passage bible verse
     * @return {boolean}         if passage is valid
     */
    validatePassage (passage, callback) {
        var parsed = this.bcv.parse(passage),
            options = { };

        if (parsed.entities.length > 0) {
            options.error = "none";
            options.data = parsed;
        }else{
            options.error = "error";
        }

        // Make sure the callback is a function​
        if (typeof callback === "function") {
            // Execute the callback function and pass the parameters to it​
            callback(options);
        }
    }



    /** Creates element tag input */
    createTagElement (passage){
        var elements = this.inputDom.querySelector('.bv_elements'),
            template = this.inputDom.querySelector('.bv_element--template').innerHTML,
            output = {},
            idx = elements.querySelectorAll('.element'),
            readable = new Readable(),
            verse;

        Mustache.tags = ["<%", "%>"];
        Mustache.parse(template);

        output.osis = passage.osis();
        output.passage = readable.osis_to_readable("long",output.osis);
        output.idx = idx.length + 1;

        var element = Mustache.render(template, output);
        $(this.inputDom).find('.bv_elements').append(element);

        var anims = elements.querySelectorAll('.el-anim');
        setTimeout(function(){
            for(var i = 0; i< anims.length; i++){
                anims[i].classList.remove('el-anim');
            }
        },20);

        this.clearField();
    }



    /** Delete and element from list */
    deleteElement (elm){
        var el = elm;
        el.parentNode.removeChild(el);
        this.reindexElements();
    }



    /**
     * When element is removed reindex input name arrays
     */
    reindexElements () {
        var elmWrapper = this.inputDom.querySelector('.bv_elements'),
            elements = elmWrapper.querySelectorAll('.element--input');
        var regex = new RegExp(/([^a-zA-Z]\d*\])/);
        var t = 1,
            i = 1,
            m = 1;
        while( i - 1 < elements.length  ) {
            var name =  elements[i-1].getAttribute('name');
            var newname = name.replace(regex, "[" + t + "]");
            elements[i-1].setAttribute('name',newname);
            i++;
            // only increment t every two times. 
            if(m == 2){
                m=1;
                t++;
            }else{
                m++;
            }
        }
    }



    clearField () {
        var field = this.inputDom.querySelector('.bv_action--field');
        field.value = "";
    }



    whichTransitionEvent(){
        var t,
            el = document.createElement("fakeelement");

        var transitions = {
            "transition"      : "transitionend",
            "OTransition"     : "oTransitionEnd",
            "MozTransition"   : "transitionend",
            "WebkitTransition": "webkitTransitionEnd"
        }

        for (t in transitions){
            if (el.style[t] !== undefined){
                return transitions[t];
            }
        }
    }
}

class Readable{

    constructor (options) {
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

        this.single_chapter_books = {};

        this._bcv = new bcv_parser;
    }


    get abbrevs () {
        return this._abbrevs;
    }

    set abbrevs (newABB) {
        this._abbrevs = newABB;
    }

    get bcv(){
        return this._bcv;
    }

    set bcv(newBCV){
        this._bcv = newBCV;
    }



    osis_to_readable (output_type, osis) {
        var end, ref, start;
        ref = osis.split("-"), start = ref[0], end = ref[1];
        if (end != null) {
            return this.handle_range(start, end, output_type);
        } else {
            return this.handle_single(start, output_type);
        }
    }

    handle_range (start, end, output_type) {
        var $this = this, eb, ec, ev, is_single_chapter, ref, ref1, sb, sc, sv;
        ref = start.split("."), sb = ref[0], sc = ref[1], sv = ref[2];
        ref1 = end.split("."), eb = ref1[0], ec = ref1[1], ev = ref1[2];
        if (sb === eb) {
            if (sc === ec) {
                return "" + ( this.handle_single(start, output_type, true, true)) + this.separators.range_v + ev;
            } else {
                if (ev != null) {
                    if (sv == null) {
                        start += ".1";
                    }
                    return "" + (this.handle_single(start, output_type, false, true)) + this.separators.range_c + ec + this.separators.cv + ev;
                } else if (sv != null) {
                    return "" + (this.handle_single(start, output_type, false, true)) + this.separators.range_c + ec + this.separators.cv + (get_end_verse(eb, ec));
                } else {
                    return "" + (this.handle_single(start, output_type, false, true)) + this.separators.range_c + ec;
                }
            }
        } else if (ec != null) {
            if (sc == null) {
                start += ".1";
            }
            if ((ev != null) && (sv == null)) {
                start += ".1";
            }
            if ((sv != null) && (ev == null)) {
                end += "." + (get_end_verse(eb, ec));
            }
            return "" + (this.handle_single(start, output_type, true, true)) + this.separators.range_b + (this.handle_single(end, output_type, true));
        } else {
            is_single_chapter = true;
            if (sc != null) {
                ec = get_end_chapter(eb);
                end += "." + ec;
                if (sv != null) {
                    end += "." + (get_end_verse(eb, ec));
                }
            } else {
                is_single_chapter = false;
            }
            return "" + (this.handle_single(start, output_type, is_single_chapter, true)) + this.separators.range_b + (this.handle_single(end, output_type, is_single_chapter));
        }
    }

    handle_single (osis, output_type, is_single_chapter, is_range_start) {
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
                    return "" + (this.get_best_book(b, output_type, is_single_chapter)) + this.separators.bv + v;
                } else {
                    return "" + (this.get_best_book(b, output_type, is_single_chapter)) + this.separators.bc + c + this.separators.cv + v;
                }
            } else {
                return "" + (this.get_best_book(b, output_type, is_single_chapter)) + this.separators.bc + c;
            }
        } else {
            return this.get_best_book(b, output_type, is_single_chapter);
        }
    }

    get_best_book (b, output_type, is_single_chapter) {
        var output_id;
        output_id = this.output_types[output_type] || 0;
        while (output_id > 0) {
            if (this.abbrevs[b][output_id] != null) {
                break;
            }
            output_id--;
        }
        if (is_single_chapter && output_id === 0 && (this.abbrevs[b][this.output_types["single"]] != null)) {
            output_id = this.output_types["single"];
        }
        return this.abbrevs[b][output_id];
    }

    is_single_chapter_book (book) {
        var end, osis, out, ref, start;
        if (this.single_chapter_books[book] != null) {
            return this.single_chapter_books[book];
        }
        osis = this.bcv.parse(book + " 2").osis();
        ref = osis.split("-"), start = ref[0], end = ref[1];
        out = end != null ? false : true;
        this.single_chapter_books[book] = out;
        return out;
    }

    get_end_chapter (b) {
        var c, end, ref, ref1, start, v;
        ref = this.bcv.parse(b + " 1-999").osis().split("-"), start = ref[0], end = ref[1];
        ref1 = end.split("."), b = ref1[0], c = ref1[1], v = ref1[2];
        return c;
    }

    get_end_verse (b, c) {
        var end, ref, ref1, start, v;
        ref = this.bcv.parse(b + " " + c).osis().split("-"), start = ref[0], end = ref[1];
        ref1 = end.split("."), b = ref1[0], c = ref1[1], v = ref1[2];
        return v;
    }
}
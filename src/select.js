    var r_pseudo=/^:([-\w]+)(?:\(([^\)]+)\))?/,
    r_just_id=/^#[-\w]+$/,
    r_attr = /^\[(\w+)(?:([~|\^\$\*])?=(?:"([^"]+)"|'([^']+)'|([^\s]+))(?:\s+(i))?)?\]/,
    r_nth = /\s*([-+]?\d+)n([+-]\d+)?/,
    attrs = {
      "=": function(v, i){
        return RegExp("^" + v + "$", i);
      },
      "~": function(v, i){
        return RegExp("(?:^|\\s)" + v + "(?:\\s|$)", i);
      },
      "|": function(v, i){
        return RegExp("^" + v + "(?:$|-)", i);
      },
      "^": function(v, i){
        return RegExp("^" + v, i);
      },
      "$": function(v, i){
        return RegExp(v + "$", i);
      },
      "*": function(v, i){
        return RegExp(v, i);
      }
    },
    cached = {},
    global = this,
    pseudos = {
        /*empty: function(elem){
            return !elem.firstChild;
        },*/
        not: function(sel){
            sel = parse(sel);
            return function(elem){
                return !sel(elem);
            }
        },
        
        /*"nth-child":nth_child,
        "nth-last-child":function(args){return nth_child(args, 1)},
        
        "nth-of-type":function(arg){return nth_child(args, 0, ofType)},
        "nth-last-of-type":function(arg){return nth_child(args, 1, ofType)},
        
        "nth-match":function(arg){
          var nth = (arg = arg.split(" of "))[0], test = parse(arg[1]);
          return nth_child(nth, 0, test);
        },
        "nth-last-match":function(arg){
          var nth = (arg = arg.split(" of "))[0], test = parse(arg[1]);
          return nth_child(nth, 1, test);
        },
        
        "first-child":nth_child(1),
        "last-child":nth_child(1, 1),
        "only-child":function(elem){return nth_(elem) === nth_(elem, 1)},
        
        "first-of-type":nth_child(1, 0, ofType),
        "last-of-type":nth_child(1, 1, ofType),
        "only-of-type":function(elem){return nth_(elem, o, ofType) === nth_(elem, 1, ofType)},
        
        
        checked:function(elem){return !!elem.getAttribute("checked")}*/
    },
    pos = {
        ">": function(test){
            return function(elem, attr, parent){
                return test(parent.tag, parent.attr, parent.parent, parent.prev);
            }
        },
        "+": function(test){
            return function(elem, attr, parent, prev, next){
                return prev && test(prev.tag, prev.attr, prev.parent, prev.prev, {tag:elem, attr:attr, parent:parent, prev:prev, next:next});
            }
        },
        "~": function(test){
            return function(elem, attr, parent, prev){
                do{
                     if(test(prev.tag, prev.attr, prev.parent, prev.prev)) return 1
                }
                while(prev = prev.prev)
            }
        },
        " ": function(test){
            return function(elem, attr, parent){
                do{
                     if(test(parent.tag, parent.attr, parent.parent, parent.prev)) return 1
                }
                while(parent = parent.parent)
            }
        }
    }
    
    /*function nth_(elem, l, f){
        var siblings = elem.parentNode.childNodes
          , i = 0
          , ind = 0
          , s;
        while(s = siblings[i++]){
            if(s.nodeType === 1 && (!f || f(s, elem))){
                ind++;
                if(s === elem){
                    return l ? siblings.length - ind + 1 : ind;
                }
            }
        }
    }*/
    
    function attr(name, op, val, i, fn){
        var f = attrs[op](val, i);
        return fn ? function(elem, attr, a, b, c){return fn(elem, attr, a, b, c) && attr[name] && f.test(attr[name])} : function(elem, attr){return attr[name] && f.test(attr[name])}
    }
    
    function nth_child(nth, last){
        nth === "even" && (nth = "2n");
        nth === "odd" && (nth = "2n+1");
        if(r_nth.test(nth)){
            nth = r_nth.exec(nth);
            var n = parseInt(nth[1]), o = nth[2] ? parseInt(nth[2]) : 0;
            return function(elem, f){return f = nth_(elem, last), f >= o && !((nth_(elem, last) + o) % n)}
        }
        else if(nth = parseInt(nth)){
            return function(elem){return nth_(elem, last) === nth};
        }
    }
    
    function parse(str, fn, e, c){
        var ostr = str;
        if(e = cached[str]) return e;
        while(str){
            
            c = str.charAt(0);
            fn = c == '#' ? function(id, fn){
                    str = str.substring(e.length + 1);
                    id = id.replace(/([^\\])\\([^\\])/g, "$1$2");
                    return fn ? function(elem, attr, a, b, c){return fn(elem, attr, a, b, c) && attr.id === id} : function(elem, attr){return attr.id === id};
                }(e = /^#((?:[-\w]|\\.)+)/.exec(str)[1], fn)
            : c == '.' ? function(cls, fn){
                    str = str.substring(e.length + 1);
                    cls = attrs["~"](cls.replace(/([^\\])\\([^\\])/g, "$1$2"));
                    return fn ? function(elem, attr, a, b, c){return fn(elem, attr, a, b, c) && cls.test(attr.class)} : function(elem, attr){return cls.test(attr.class)};
                }(e = /\.((?:[-\w]|\\.)+)/.exec(str)[1], fn)
            : c == ':' ? function(ps, args, fn){
                    str = str.substring(1 + ps.length + (args ? 2 + args.length : 0));
                    var test = args ? pseudos[ps](args) : pseudos[ps];
                    return fn ? function(elem, attr, a, b, c){return fn(elem, attr, a, b, c) && test(elem, attr)}: test;
                }((e = r_pseudo.exec(str))[1], e[2], fn)
            : c == '[' ? function(e, fn){
                    str = str.substring(e[0].length);
                    return attr(e[1], e[2] || "=", e[3] || e[4] || e[5], e[6], fn);
                }(r_attr.exec(str), fn)
            : c == '+' || c == '~' || c == '>' || c == ' ' ? function(fn){
                    str = str.substring(1);
                    return pos[c](fn);
                }(fn)
            : function(tag, fn){
                    str = str.substring(e.length);
                    tag = tag.toLowerCase();
                    return fn ? function(elem, attr, a, b, c){return elem.toLowerCase() === tag && fn(elem, attr, a, b, c)} : function(elem, a, b, c){return elem.toLowerCase() === tag};
                }(e = /^\w+/.exec(str)[0], fn)
        }
        
        return cached[ostr] = fn;
    }
    
    module.exports = parse;
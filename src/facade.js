"use strict";

var parse = require("../src/parser")
  , select = require("../src/select")
  , helpers = require("../src/helpers")
  , x

function FALSE(){return false}

function Parser(txt){
    this.txt = txt;
    this.events = {
        b: [],
        f: [],
        l: [],
        a: []
    };
}

Parser.prototype = {
    trigger: function(type, context, add, tag, attr, parent, prev, next){
        var a = this.events[type], l = a.length, ret = true;
        while(l--){
            if(a[l](tag, attr, parent, prev, next)){
                if(a[--l].call(context, {tag:tag, attr:attr, parent:parent, prev:prev, next:next}, add) === false) ret = false;
            }
            else
            {
                l--;
            }
        }
        return ret;
    },
    bind: function(type, sel, fn){
      this.events[type].push(fn, select(sel));  
    },
    render: function(context){
        var prev, cur, ret = "", that = this, _d = 0;
        
        function add(txt){if(!_d) ret += txt};
        
        parse(this.txt, {
            start: function(tag, attr, unary){
                var p = prev && prev.parent === cur ? prev : null, x, v;
                cur = {tag:tag, attr:attr, unary:unary, parent:cur, prev:p};
                
                if(that.trigger('b', context, add, tag, attr, cur, p, null) !== false && !_d){
                    ret += "<" + tag;
                    for(x in attr){
                        v = attr[x];
                        ret += ' ' + x + (v === true ? '' : '=' + (/["'`=<>\s]/.test(v) ? '"' + v + '"' : v));
                    }
                    ret += unary ? " />" : ">";
                    if(!unary){
                        that.trigger('f', context, add, tag, attr, cur, p, null);
                    }
                }
                else
                {
                    _d++;
                }
                
                
                prev = cur;
            },
            text: add,
            end: function(tag){
                _d && _d--;
                var attr = cur.attr, parent = cur.parent, prev = cur.prev;
                that.trigger('l', context, add, tag, attr, parent, prev, null);
                ret += "</" + tag + ">";
                that.trigger('a', context, add, tag, attr, parent, prev, null);
                cur = cur.parent;
            }
        });
        return ret;
    },
    
    before: function(selector, fn){
        this.bind('b', selector, typeof fn === 'function' ? function(elem, push){push(fn(elem))} : function(elem, push){push(fn)})
    },
    first: function(selector, fn){
        this.bind('f', selector, typeof fn === 'function' ? function(elem, push){push(fn(elem))} : function(elem, push){push(fn)})
    },
    last: function(selector, fn){
        this.bind('l', selector, typeof fn === 'function' ? function(elem, push){push(fn(elem))} : function(elem, push){push(fn)})
    },
    after: function(selector, fn){
        this.bind('a', selector, typeof fn === 'function' ? function(elem, push){push(fn(elem))} : function(elem, push){push(fn)})
    },
    
    remove: function(selector, fn){
        this.bind('b', selector, fn || FALSE);
    }
}

exports.parse = function(txt){
    return new Parser(txt);
}


for(x in helpers) exports[x] = helpers[x];
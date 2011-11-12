var parse = require("./src/parse"),
    build = require("./src/build"),
    find = require("./src/find"),
    minify = require("./src/minify");

function Facade(a){
    this.doc = a.length ? a : [a];
}

Facade.prototype = {
    render: function(min){
        return build(min? minify(this.doc) : this.doc);
    },
    find: function(sel){
        return new Facade(find(this.doc, sel));
    },
    each: function(sel, fn){
        var rep = find( this.doc, sel ), x = 0, v;
        
        for(; v = rep[x++];){
            fn(v);
        }
        
        return this;
    },
    replace: function(sel, w){
        
        var rep = find( this.doc, sel ), x = 0, v, fn = typeof w == "function";
        
        for(; v = rep[x++];){
            [].splice.apply(v.parent,
                [v.parent.indexOf(v),
                1].concat( parse( fn? w(v) : w ) )
            );
        }
        
        return this;
    },
    remove: function(sel){
        
        var rep = find( this.doc, sel ), x = 0, v;
        
        for(; v = rep[x++];){
            v.parent.splice(
                v.parent.indexOf(v),
                1
            );
        }
        
        return this;
    },
    attr: function( sel, name, val ){
        var rep = find( this.doc, sel ), x = 0, v;
        
        for(; v = rep[x++];){
            if(val === false){
                delete v.attr[name];
            }
            else if(val === true){
                v.attr[name] = undefined;
            }
            else
            {
                v.attr[name] = val;
            }
        }
        
        return this;
    },
    before: function(sel, w){
        
        var rep = find( this.doc, sel, true ), x = 0, v, fn = typeof w == "function";
        
        for(; v = rep[x++];){
            [].splice.apply(v.parent,
                [v.parent.indexOf(v),
                0].concat( parse( fn? w(v) : w ) )
            );
        }
        
        return this;
    },
    after: function(sel, w){
        
        var rep = find( this.doc, sel, true ), x = 0, v, fn = typeof w == "function";
        
        for(; v = rep[x++];){
            [].splice.apply(v.parent,
                [v.parent.indexOf(v)+1,
                0].concat( parse( fn? w(v) : w ) )
            );
        }
        
        return this;
    },
    append: function(sel, w){
        
        var rep = find( this.doc, sel, true ), x = 0, v, fn = typeof w == "function";
        
        for(; v = rep[x++];){
            [].push.apply(v.children, parse(w));
        }
        
        return this;
    },
    prepend: function(sel, w){
        
        var rep = find( this.doc, sel, true ), x = 0, v, fn = typeof w == "function";
        
        for(; v = rep[x++];){
            [].unshift.apply(v.children, parse(w));
        }
        
        return this;
    }
}

function facade(html){
    return new Facade(
            ""+html === html? parse(html) : html
        )
    }

module.exports = facade;
var parse = require("./src/parse"),
    build = require("./src/build"),
    find = require("./src/find"),
    minify = require("./src/minify"),
    traversal = require("./src/traversal"),
    manip = require("./src/manip");

function Facade(a){
    this.doc = a.length ? a : [a];
}

function facade(html){
    return new Facade(
        ""+html === html? parse(html) : html
    )
}

var proto = Facade.prototype = {
    render: function(min){
        return build(min? minify(this.doc) : this.doc);
    },
    doctype: function(){
        return this.doc.doctype;
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
        var rep = find( this.doc, sel ), x = 0, v;
        
        for(;v = rep[x++];) manip.replace(v, w);
        
        return this;
    },
    remove: function(sel){
        var rep = find( this.doc, sel ), x = 0, v;
        
        for(; v = rep[x++];) manip.remove(v);
        
        return this;
    },
    attr: function( sel, name, val ){
        var rep = find( this.doc, sel, true ), x = 0, v;
        
        for(; v = rep[x++];) manip.attr(v, name, val);
        
        return this;
    },
    before: function(sel, w){
        var rep = find( this.doc, sel, true ), x = 0, v;
        
        for(; v = rep[x++];) manip.before(v, w);
        
        return this;
    },
    after: function(sel, w){
        var rep = find( this.doc, sel, true ), x = 0, v;
        
        for(; v = rep[x++];) manip.after(v, w);
        
        return this;
    },
    append: function(sel, w){
        var rep = find( this.doc, sel, true ), x = 0, v;
        
        for(; v = rep[x++];) manip.append(w, v);
        
        return this;
    },
    prepend: function(sel, w){
        var rep = find( this.doc, sel, true ), x = 0, v;
        
        for(; v = rep[x++];) manip.prepend(w, v);
        
        return this;
    }
}

for(x in manip){
    facade[x] = manip[x];
}

for(x in traversal){
    facade[x] = traversal[x];
}


facade.find = find;

module.exports = facade;
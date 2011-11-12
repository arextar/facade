var parse = require("./src/parse"),
    build = require("./src/build"),
    find = require("./src/find"),
    minify = require("./src/minify");

function Facade(a){
    this.doc = a.length ? a : [a];
}

function render( wi, what, parent ){
    wi = parse( wi&&wi.call?
        wi(what)
    :
        wi
    );
    
    if(parent){
        var x = 0, e;
        for(;e=wi[x++];e.parent=parent);
    }
    return wi;
}

function facade(html){
    return new Facade(
        ""+html === html? parse(html) : html
    )
}

var replace = facade.replace = function( what, wi ){
    var parent = what.parent;
    [].splice.apply(parent, [parent.indexOf(what), 1].concat( render(wi, what, parent) ));
}

var remove = facade.remove = function(what){
    what.parent.splice(what.parent.indexOf(what), 1);
}

var before = facade.before = function(what, wi){
    var parent = what.parent;
    [].splice.apply( parent, [parent.indexOf(what), 0].concat( render( wi, what, parent ) ) );
}

var after = facade.after = function(what, wi){
    var parent = what.parent;
    [].splice.apply( parent, [parent.indexOf(what) + 1, 0].concat( render( wi, what, parent ) ) );
}

var append = facade.append = function(what, to){
    [].push.apply(to.children, render( what, to, to) );
}

var prepend = facade.append = function(what, to){
    [].unshift.apply(to.children, render( what, to, to) );
}

var attr = facade.attr = function(what, name, value){
    
    if(typeof name == "object"){
        for(var x in name) attr(what, x, name[x]);
    }
    
    var a=what.attr;
    
    if(value===false){
        delete a[name];
    }
    else if(value===true){
        a[name]=undefined;
    }
    else
    {
        a[name] = value;
    }
    
}

Facade.prototype = {
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
        
        for(;v = rep[x++];) replace(v, w);
        
        return this;
    },
    remove: function(sel){
        var rep = find( this.doc, sel ), x = 0, v;
        
        for(; v = rep[x++];) remove(v);
        
        return this;
    },
    attr: function( sel, name, val ){
        var rep = find( this.doc, sel, true ), x = 0, v;
        
        for(; v = rep[x++];) attr(v, name, val);
        
        return this;
    },
    before: function(sel, w){
        var rep = find( this.doc, sel, true ), x = 0, v;
        
        for(; v = rep[x++];) before(v, w);
        
        return this;
    },
    after: function(sel, w){
        var rep = find( this.doc, sel, true ), x = 0, v;
        
        for(; v = rep[x++];) after(v, w);
        
        return this;
    },
    append: function(sel, w){
        var rep = find( this.doc, sel, true ), x = 0, v;
        
        for(; v = rep[x++];) append(w, v);
        
        return this;
    },
    prepend: function(sel, w){
        var rep = find( this.doc, sel, true ), x = 0, v;
        
        for(; v = rep[x++];) prepend(w, v);
        
        return this;
    }
}


facade.find = find;

module.exports = facade;
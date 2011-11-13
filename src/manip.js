var facade = exports;

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
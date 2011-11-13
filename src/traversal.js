exports.first = function(children){
    var i = 0, elem;
    while(!(elem = children[i++]).tag);
    return elem;
}

exports.last = function(children){
    var i = children.length - 1, elem;
    while(!(elem = children[i--]).tag);
    return elem;
}

exports.prev = function(elem){
    var i = indexOf(elem.parent, elem);
    while((elem = elem.parent[i-=1])&&!elem.tag);
    return elem;
}

exports.next = function(elem){
    var i = indexOf(elem.parent, elem);
    while((elem = elem.parent[i+=1])&&!elem.tag);
    return elem;
}


var indexOf = exports.index = function( children, elem, tag ){
      var i = 0, x = 0, e;
      for(;e = children[x++];){
            if(e.tag && (!tag || e.tag === tag)){
                  if(e === elem){
                        return i;
                  }
                  i++
            }
      }
}

exports.lastIndex = function( children, elem, tag ){
      var i = 0, x = children.length - 1, e;
      for(;e = children[x--];){
            if(e.tag && (!tag || e.tag === tag)){
                  if(e === elem){
                        return i;
                  }
                  i++
            }
      }
}
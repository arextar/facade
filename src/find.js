function matches( tag, sel ){
    return sel.toLowerCase() == tag.tag;
}

function find( doc, sel, deep ){
    
    for(var x = 0 ,v, res = []; v=doc[x++];){
        if( matches(v, sel) ){
            res.push(v);
            if(deep && v.children){
                [].push.apply(res, find(v.children, sel, true));
            }
        }
        else if(v.children)
        {
            [].push.apply(res, find(v.children, sel, true));
        }
    }
    return res;
}

module.exports = find;
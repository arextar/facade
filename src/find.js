var matches = require("./parse_sel");


function find( doc, sel, deep ){
    
    if(""+sel === sel) sel = matches.lex( sel );
    
    for(var x = 0 ,v, res = []; v=doc[x++];){
        if( v.tag && matches(v, sel) ){
            res.push(v);
            
            
            if(deep && v.children){
                [].push.apply(res, find(v.children, sel, true));
            }
        }
        else if(v.children)
        {
            [].push.apply(res, find(v.children, sel, deep));
        }
    }
    
    return res;
}
module.exports = find;
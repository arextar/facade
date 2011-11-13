var dont_minify = {script:1, style:1, pre:1, textarea:1, title:1};

function minify( elem ){
    
    return {
        tag:elem.tag,
        children: dont_minify[elem.tag] ? elem.children : minify_group(elem.children),
        attr:elem.attr
    }
    
}

function minify_group( str ){
    var ret = [], c = 0,x = 0, v;
    for(;v=str[x++];){
        if(typeof v == "string"){
            
            while(typeof str[x] == "string" || str[x].comment){
                if(typeof str[x] == "string") v+=str[x++];
            }
            
            v=v.replace(/^\s+$/,"").replace(/^\n|\n$/g,"").replace(/ +/g," ");
            if(v){
                ret[c++] = v;
            }
        }
        else if(!v.comment)
        {
            ret[c++] = minify(v);
        }
    }
    
    return ret;
}

module.exports = function(doc){
    
    return minify_group(doc);
    
}
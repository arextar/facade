function map(a){
    var ret = {}, x = 0, k;
    for(;v = a[x++];ret[v] = 1);
    return ret;
}
var empty = map(['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr']),
    rawText = map(['script', 'style','textarea', 'title']),
    closes = {
      dt: ['dt', 'dd'],
      dd: ['dt', 'dd'],
      td: ['td', 'th'],
      th: ['td', 'th'],
      rt: ['rt', 'rp'],
      rp: ['rt', 'rp'],
      li: ['li'],
      tr: ['tr'],
      optgroup: ['optgroup', 'option'],
      option: ['option'],
      colgroup: ['colgroup'],
      tbody: ['thead'],
      tfoot: ['thead']
    },
    closesP=map([ 'address', 'article', 'aside', 'blockquote', 'dir', 'div', 'dl', 'fieldset', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'menu', 'nav', 'ol', 'p', 'pre', 'section', 'table', 'ul']),
    r_start = /^([^<]*)<([a-z0-9]+)\s*((?:[^"'>\/=](?:\s*=\s*(?:[^ "'=<>`]+|'[^']*'|"[^"]*"))?\s*)*)\s*(\/?)>/i,
    r_end = /^([^<]*)<\/([a-z0-9]+)\s*>/i,
    r_attr = /^\s*([^"'>\/=]+)(?:\s*=\s*(?:([^ "'=<>`]+)|'([^']*)'|"([^"]*)"))?\s*/;

function parse_attr( str ){
    if(!str) return {};
    var temp, ret = {};
    while(temp = r_attr.exec(str)){
        ret[temp[1]] = temp[2] || temp[3] || temp[4];
        
        str = str.slice(temp[0].length);
    }
    return ret;
}

function parse( str ){
    var children, base = children = [], tree = [], temp, a, tag;
    
    while(temp = r_start.exec(str)){
        str = str.slice(temp[0].length);
        
        if(temp[1]){
            children[children.length] = temp[1];
        }
        if(temp[2]){
            tag = temp[2].toLowerCase()
            
            if(closes[tag]){
                var x = 0, v, ar=closes[tag];
                for(; v=ar[x++];){
                    if(~tree.indexOf(v)){
                        while(t = tree.shift()){
                            children = children._t.parent;
                            if(t === v) break;
                        }
                        break;
                    }
                }
            }
            
            if(closesP[tag] && children._t && children._t.tag === "p"){
                children = children._t.parent;
            }
            
            
            a = children[children.length] = {
                tag: tag,
                attr: parse_attr( temp[3] ),
                parent: children,
                children:[]
            }
            
            if(!temp[4] && !empty[temp[2]]){
                tree.unshift( tag );
                (children = a.children)._t = a;
            }
            
            if(rawText[tag]){
                
                a=str.match("<\/"+tag+"\\s*>");
                
                children[children.length] = str.slice(0, a.index);
                
                str=str.slice(a.index+a[0].length)
            }
        }
        
        while(temp = r_end.exec(str)){
            str = str.slice(temp[0].length);
            
            if(temp[1]){
                children[children.length] = temp[1];
            }
            
            if(temp = temp[2]){
                
                var t;
                
                while(t = tree.shift()){
                    children = children._t.parent;
                    if(t === temp) break;
                }
            }
        }
    }
    
    if(str) children[children.length] = str;
    
    return base;
    
}

module.exports = parse;
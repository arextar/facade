"use strict";

var is_ws = hash(" \t\n"),

is_void = hash("area,base,br,col,command,embed,hr,img,input,keygen,link,meta,param,source,track,wbr", ','),

//Optimize: is() not very efficient
closes = {
        li: is('li'),
        dt: hash(['dt','dd']),
        dd: hash(['dt','dd']),
        rt: hash(['rt','rp']),
        rp: hash(['rt','rp']),
        optgroup: is("optgroup"),
        option: hash(['option', 'optgroup']),
        colgroup: is("colgroup"),
        thead: hash(['tbody', 'tfoot']),
        tr: is('tr'),
        td: hash(['td', 'th']),
        th: hash(['td', 'th']),
        p: hash("address,article,aside,blockquote,dir,div,dl,fieldset,footer,form,h1,h2,h3,h4,h5,h6,header,hgroup,hr,menu,nav,ol,p,pre,section,table,ul", ',')
},
closes_any = hash("li,dt,dd,rt,rp,optgroup,option,colgroup,rbody,tfoot,tr,td,th,address,article,aside,blockquote,dir,div,dl,fieldset,footer,form,h1,h2,h3,h4,h5,h6,header,hgroup,hr,menu,nav,ol,p,pre,section,table,ul",',')

function parser(_input, callbacks){
        var input = _input.split("")
          , pos = 0
          , c = input[0]
          , struct = []
          , _end = callbacks.end || function(){}
          , _start = callbacks.start || function(){}
          , _text = callbacks.text || function(){}
          , current
        

        function ws(){
                while(is_ws(c)) c = input[++pos];;
        }
        
        function close(tag){
                var s;
                while(s = struct.pop()){
                        _end(s.t);
                        current = s;
                        if(s.t === tag){
                                break;
                        }
                }
        }
        
        function has_parent(tag){
                var i = struct.length;
                while(i--) if(struct[i].t === tag) return 1;
        }
        
        function attrs(attr){
                var name = c;
                while((c = input[++pos]) !== "=" && c !== ">" && c !== " ") name += c;
                if(c === "="){
                        c = input[++pos]
                        if(c === '"' || c === "'"){
                                var q = c;
                                var val = c = input[++pos];
                                while((c = input[++pos]) !== q){
                                        val += c;
                                }
                                c = input[++pos]
                                attr[name] = val;
                        }
                        else
                        {
                                if(c === ">" || c === " ") attr[name] = true
                                else{
                                    var val = c;
                                    while((c = input[++pos]) !== ">" && c !== " ") val += c;
                                    attr[name] = val;
                                }
                        }
                }
                else
                {
                    attr[name] = true;
                }
                ws();
                if(c !== ">" && c !== "/") attrs(attr);
        }
        
        while(c){
                ws();
                //Loads any text before an opening angle into a buffer and runs the callback if any was found
                if(c !== "<"){
                        
                        var txt = '';
                        while(c && c !== "<"){
                                txt += c;
                                c = input[++pos];
                        }
                        
                        _text( txt );
                }
                
                if(input[pos+1] === "!"){
                        pos += 1;
                        var ends = _input.indexOf("-->", pos);
                        //console.log(_input.slice(pos + 3, ends));
                        pos += ends - pos + 6;
                        c = input[++pos];
                        //console.log(c);
                }
                
                if(!c) break;
                
                if(input[pos + 1] === "/"){
                        c = input[++pos]
                        var tag = "";
                        while(/\w/.test(c = input[++pos])) tag += c;
                        close(tag);
                        ws();
                        c = input[++pos]
                }
                else
                {
                        var tag = "", unary, attr = {}, x;
                        
                        while(/\w/.test(c = input[++pos])) tag += c;
                        
                        unary = is_void(tag);
                        
                        if(struct.length && closes_any(tag)){
                                var cont = 1;
                                if(tag === "li"){
                                        var i = struct.length;
                                        while(i--){if(/^ul$|^ol$/.test(struct[i].t)) cont = cont === 2 ? false : cont + 1; if(!cont) break}
                                }
                                if(cont) for(x in closes){
                                        if(closes[x](tag) && has_parent(x)) close(x);
                                }
                        }
                        
                        
                        
                        if(is_ws(c)){
                                ws();
                                if(c !== ">" && c !== "/") attrs(attr);
                        }
                        
                        if(c === "/"){
                                unary = true;
                                c = input[++pos];
                        }
                        
                        
                        _start(tag, attr, unary, current);
                        c = input[++pos];
                        if(tag === "script" || tag === "style"){
                                var ends = _input.indexOf("</" + tag + ">", pos);
                                _text(_input.slice(pos, ends));
                                pos += ends - pos + tag.length + 2;
                                c = input[++pos];
                                _end(tag);
                        }
                        else if(!unary){
                                var elem = {
                                t: tag, a: attr, p: current, c: []
                              }
                              
                              current && current.c.push(elem);
                              struct.push(current = elem)
                        }
                }
        }
        var i = struct.length;
        while(i--){
                _end(struct[i].t);
        }
}

module.exports = parser;

//Utilities
function hash(a, d){
        a = typeof a === 'string' ? a.split(d || '') : a
        var i = a.length, r = {};
        while(i--) r[a[i]] = 1;
        return function(prop){
                return r.hasOwnProperty(prop);
        }
}

function is(a){
        return function(t){
                return t === a;
        }
}
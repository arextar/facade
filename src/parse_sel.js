var traversal = require("./traversal");

var pos = {
      ">": function(elem, sel, context, p){
         
         if(sel[">"]===1){
            return elem.parentNode === context;
         }
         
         return (p = elem.parent._t) && matches(p, sel);
      },
      "+": function(elem, sel){
        return matches( traversal.prev(elem), sel);
      },
      "~": function(elem, sel){
         while( elem = traversal.prev(elem) ){
            if(matches( elem, sel)){
               return 1;
            }
         }
      },
      " ": function(elem, sel){
         while( elem = elem.parent._t ){
            if(matches( elem, sel)){
               return 1;
            }
         }
      }
   },
   _a = [],
   slice = _a.slice,
   push = _a.push,
   attr = {
      "=":function(a, b){
        return a == b; 
      },
      
      //TODO: Escape regular expressions
      "*=":function(a, b){
         b = cache_re[ b ] || (cache_re[ b ] = RegExp( b ));
         return b.test( a );
      },
      "~=":function(a, b){
         b="(?:^| )"+b+"(?: |$)";
         b = cache_re[ b ] || (cache_re[ b ] = RegExp( b ));
         return b.test( a );
      },
      "^=":function(a, b){
         b="^"+b;
         b = cache_re[ b ] || (cache_re[ b ] = RegExp( b ));
         return b.test( a );
      },
      "$=":function(a, b){
         b=b+"$";
         b = cache_re[ b ] || (cache_re[ b ] = RegExp( b ));
         return b.test( a );
      }
   },
   pseudos = {
      "first-child":function(elem){
         return traversal.first(elem.parent) === elem;
      },
      "last-child":function(elem){
         return traversal.last(elem.parent) === elem;
      },
      "nth-child":function(elem, n){
         if(elem.parent){
            var children = elem.parent, group, offset,
            ind= traversal.index(children, elem);
            
            if(n == "odd"){
               return  !ind || !(ind % 2);
            }
            else if(n == "even"){
               return ind % 2;
            }
            else if(!r_not_digit.test(n)){
               return ind === n - 1;
            }
            else if(n.slice( -1 ) == "n" && !r_not_digit.test(n.slice(0, -1))){
               return !((ind + 1) % +n.slice(0, -1));
            }
            else
            {
               n=r_nth.exec(n);
               
               group = +(n[1]+(n[2]||1))
               offset = n[3]=="-"? group - n[4] : +n[4];
               
               var i = ind + 1 - offset;
               
               return !i || !( i % group );
            }
         }
      },
      "nth-last-child":function(elem, n){
         if(elem.parent){
            var children = elem.parent, group, offset,
            ind= traversal.lastIndex(children, elem);
            
            if(n == "odd"){
               return  !ind || !(ind % 2);
            }
            else if(n == "even"){
               return ind % 2;
            }
            else if(!r_not_digit.test(n)){
               return ind === n - 1;
            }
            else if(n.slice( -1 ) == "n" && !r_not_digit.test(n.slice(0, -1))){
               return !((ind + 1) % +n.slice(0, -1));
            }
            else
            {
               n=r_nth.exec(n);
               
               group = +(n[1]+(n[2]||1))
               offset = n[3]=="-"? group - n[4] : +n[4];
               
               var i = ind + 1 - offset;
               
               return !i || !( i % group );
            }
         }
      },
      "nth-of-type":function(elem, n){
         if(elem.parent){
            var children = elem.parent, group, offset,
            ind= traversal.index(children, elem, elem.tag);
            
            if(n == "odd"){
               return  !ind || !(ind % 2);
            }
            else if(n == "even"){
               return ind % 2;
            }
            else if(!r_not_digit.test(n)){
               return ind === n - 1;
            }
            else if(n.slice( -1 ) == "n" && !r_not_digit.test(n.slice(0, -1))){
               return !((ind + 1) % +n.slice(0, -1));
            }
            else
            {
               n=r_nth.exec(n);
               
               group = +(n[1]+(n[2]||1))
               offset = n[3]=="-"? group - n[4] : +n[4];
               
               var i = ind + 1 - offset;
               
               return !i || !( i % group );
            }
         }
      },
      "nth-last-of-type":function(elem, n){
         if(elem.parent){
            var children = elem.parent, group, offset,
            ind= traversal.lastIndex(children, elem, elem.tag);
            
            if(n == "odd"){
               return  !ind || !(ind % 2);
            }
            else if(n == "even"){
               return ind % 2;
            }
            else if(!r_not_digit.test(n)){
               return ind === n - 1;
            }
            else if(n.slice( -1 ) == "n" && !r_not_digit.test(n.slice(0, -1))){
               return !((ind + 1) % +n.slice(0, -1));
            }
            else
            {
               n=r_nth.exec(n);
               
               group = +(n[1]+(n[2]||1))
               offset = n[3]=="-"? group - n[4] : +n[4];
               
               var i = ind + 1 - offset;
               
               return !i || !( i % group );
            }
         }
      },
      not: function(elem, sel){
            return !matches(elem, lex(sel));
      },
      "only-child": function(elem){
            return !traversal.index(elem.parent, elem) && !traversal.lastIndex(elem.parent, elem);
      },
      "only-of-type": function(elem){
            return !traversal.index(elem.parent, elem, elem.tag) && !traversal.lastIndex(elem.parent, elem, elem.tag);
      }
   },
   
   arr = {
     first:function( arr ){
      return [arr[0]];
     },
     last:function(arr){
      return [arr[arr.length-1]]
     }
   },
   
   cache_re={},
   cache_lex={},
    r_just_id=/^#[-\w]+$/,
    r_not_az=/[^a-z]/,
    r_not_digit=/\D/,
    r_strip = /\s*([\+>\~,])\s*/g,
    r_nth = /([-+]?)(\d*)n\s*([-+])\s*(\d+)/;
   
   function lex( sel ){
   
      if(cache_lex[sel]) return cache_lex[sel];
      sel=sel.replace(r_strip, "$1");
    if(!sel) return 1;
    if(r_just_id.test( sel )) return [{ i: sel.slice( 1 ), ji:1 }]
    if(!r_not_az.test( sel )) return [{ t: sel.toUpperCase() }]
      
    var str = sel.split( "" );
    var l = str.length,
    arrs = [],
    arrsl = 0,
    depth = 0,
    p = [],
    pl = 0,
    cl = [],
    cll = 0,
    a = [],
    al = 0,
    ret = {},
    val = [ ret ],
    temp,i,j,
    stack = "",
    pargs,
    c;
    
    while( l-- ){
        c = str[l];
        
        if(c == ")"){
         
         depth&&(stack = ')' + stack);
         depth++;
        }
        else if(c == "("){
         if(!--depth){
            pargs = stack;
            stack = "";
         }
         depth&&(stack = '(' + stack)
        }
        else if(c == "," && !depth){
         if(stack) ret.t = stack.toUpperCase();
         
         push.apply( val, lex( sel.slice( 0, l ) ) );
         l = 0;
        }
        else if(c == ":" && !depth){
         stack = pargs ? [stack, pargs] : [stack];
         
         arr[stack[0]]? arrs[ arrsl++ ] = stack : p[ pl++ ] = stack;
         
         stack=pargs="";
        }
        else if(c == "#" && !depth){
         ret.i = stack;
         stack = "";
        }
        else if(c == "." && !depth){
         cl[ cll++ ] = stack;
         stack = "";
        }
        else if(c == "]" && !depth){
         if(str[l-1]=='"'){
            
         }
         else
         {
            temp=str.join( "" ).slice( 0, l );
            if(!/[^-\w]/.test(temp.slice(1))){
                  if(temp){
                        str=str.slice(temp.length)
                        a[al++] = [temp.slice(1)]
                  }
            }
            else
            {
                  temp = temp.slice( (l = temp.lastIndexOf( '=' )) + 1 );
                  
                  if(!(attr[i = str[l-1]+"="]&&(l--))){
                     i = '=';
                  }
                  
                  j=str.join( "" ).slice(0, l);
                  
                  j = j.slice( (l = j.lastIndexOf( "[" )) + 1 );
                  
                  a[ al++ ] = [j, i, temp];
            }
            
         }
        }
        else if(pos[c] && !depth){
         temp = sel.slice(0, l);
         i = temp.lastIndexOf(" ");
         
         if(~i && c != " "){
            temp = temp.slice( l = i+1 );
         }
         else
         {
            l = 0;
         }
         ret[c]=lex( temp );
        }
        else if(c)
        {
         stack = c + stack;
        }
        
    }
    
    if(pl) ret.p = p
    if(cll) ret.c = cl;
    if(al) ret.a = a;
    if(arrsl) ret.z = arrs;
    if(stack) ret.t=stack.toUpperCase();
    
    
    return cache_lex[sel] = val;
   }
   
   var matches = module.exports = function(elem, sel){
      
      if(!sel.length) sel = [sel];
      
    return elem&&sel.some(function(sel){
        if(
           (sel.t && sel.t !== "*" && elem.tag.toUpperCase() !== sel.t)
        || (sel.i && elem.attr.id !== sel.i)) return false;
        
        var c, l, v;
        
        if(c = sel.c){
            l = c.length;
            var cls = elem.attr["class"];
            while(l--){
                if(!attr["~="](cls, c[l])) return false;
            }
        }
        
        if(c = sel.a){
            l = c.length;
            while(l--){
                v = c[l];
                if(
                   v[1]?
                        !attr[v[1]](elem.attr[v[0]], v[2])
                  : !(v[0] in elem.attr)
                  ) return false;
            }
        }
        
        if(c = sel.p){
            l = c.length;
            while(l--){
                v = c[l];
                if(!pseudos[v[0]]( elem, v[1] )) return false;
            }
        }
        
        
        if((sel[" "] && !pos[" "](elem, sel[" "]))
        || (sel[">"] && !pos[">"](elem, sel[">"]))
        || (sel["+"] && !pos["+"](elem, sel["+"]))
        || (sel["~"] && !pos["~"](elem, sel["~"]))) return false;
        
        
        return true;
    })
   }
   
   matches.lex = lex;
   
   matches.pos = pos;
   matches.attr = attr;
   matches.pseudo = pseudos;
   matches.arr= arr;
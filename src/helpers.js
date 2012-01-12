module.exports = {
    elem: function(tag, attr, c){
        var l = arguments.length
          , children = l === 2 ? [] : l === 3 ? [c] : [].slice.call(arguments, 2)
          , ret = "<" + tag
          , x, v
          for(x in attr){
            v = attr[x];
            ret += ' ' + x + (v === true ? '' : '=' + (/["'`=<>\s]/.test(v) ? '"' + v + '"' : v));
          }
        
        l -= 2;
        
        if(l){
            ret += ">";
            x = 0;
            while(x < l) ret += children[x++];
        }
        else
        {
            ret += " />";
        }
        
        return ret + "</" + tag + ">";
        
    }
}
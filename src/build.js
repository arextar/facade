function esc(a){
    return /[ "'=<>`]/.test(a)?
        a.indexOf('"')?
            "'"+a+"'"
        :
            '"'+a+'"'
        :a
}

function build(tag){
    var str = "<" + tag.tag,
    attr = tag.attr;
    
    for(var x in attr){
        str+=" "+x+(attr[x]!==undefined? "=" + esc(attr[x]) : "");
    }
    
    str += tag.children && tag.children.length ? ">" + buildList(tag.children) + "</" + tag.tag + ">" : " />";
    
    return str;
}

var buildList = module.exports = function( list ){
    var x = 0, v, str = "";
    for(; v = list[x++];){
        str += v.tag? build(v) : v;
    }
    return str;
}
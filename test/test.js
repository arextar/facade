require("colors");
var util = require("util");

var unit;

function assert(pass, message){
    console.log(
        ((pass? "✓" : "×").bold+" "+unit+":\t"+message)[pass? "green" : "red"]
    )
}

function eq( result, expected, msg ){
    var pass = result === expected;
    assert(
        pass,
        pass? msg : msg+"\n\t\texpected:"+expected+"\n\t\trecieved:"+result
    )
}

var facade = require("../src");

unit = "Parsing";

var fragments = {
    //Normal element
    "<b>asdf</b>": "<b>asdf</b>",
    
    
    //Unary element
    "<a />":"<a />",
    
    
    //Element left open
    "<b>asdf": "<b>asdf</b>",
    
    
    //Empty element
    "<br>a": "<br />a",
    
    
    //Text before
    "a <strong>a</strong>": "a <strong>a</strong>",
    
    
    //Text after
    "<strong>a</strong> a": "<strong>a</strong> a",
    
    
    //Both
    "a <strong>a</strong> a": "a <strong>a</strong> a",
    
    
    //Attributes
    '<div foo="bar" />':'<div foo=bar />',
    "<div foo='bar' />":'<div foo=bar />',
    '<div foo=bar />':'<div foo=bar />',
    '<div foo=a@b.c />':'<div foo=a@b.c />',
    '<textarea disabled />':'<textarea disabled  />',
    
    
    //Self-closing
    '<ul><li><b>Hello!</b><li>Hi there<li><a href="#">H</a>':"<ul><li><b>Hello!</b></li><li>Hi there</li><li><a href=#>H</a></li></ul>",
    
    
    //Closed by other
    '<dl><dt><dfn>happiness</dfn><dd>State of being happy<dt><dfn>sadness</dfn><dd>State of being sad</dl>':'<dl><dt><dfn>happiness</dfn></dt><dd>State of being happy</dd><dt><dfn>sadness</dfn></dt><dd>State of being sad</dd></dl>',
    
    
    
    //doctypes are parsed out
    '<!DOCTYPE html><img />':"<img />",
    '<!DOCTYPE HTML><img />':"<img />",
    '<!DOCTYPE html SYSTEM "about:legacy-compat"><img />':"<img />",
    '<!DOCTYPE html SYSTEM \'about:legacy-compat\'><img />':"<img />",
    '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0//EN"><img />':"<img />",
    '<!DOCTYPE html PUBLIC \'-//W3C//DTD HTML 4.0//EN\'><img />':"<img />",
    
    '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0//EN" "http://www.w3.org/TR/REC-html40/strict.dtd"><img />':"<img />",
    '<!DOCTYPE html PUBLIC \'-//W3C//DTD HTML 4.0//EN\' "http://www.w3.org/TR/REC-html40/strict.dtd"><img />':"<img />",
    '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0//EN" \'http://www.w3.org/TR/REC-html40/strict.dtd\'><img />':"<img />",
    '<!DOCTYPE html PUBLIC \'-//W3C//DTD HTML 4.0//EN\' \'http://www.w3.org/TR/REC-html40/strict.dtd\'><img />':"<img />",
    
    '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN"><img />':"<img />",
    '<!DOCTYPE html PUBLIC \'-//W3C//DTD HTML 4.01//EN\'><img />':"<img />",
    '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd"><img />':"<img />",
    '<!DOCTYPE html PUBLIC \'-//W3C//DTD HTML 4.01//EN\' "http://www.w3.org/TR/html4/strict.dtd"><img />':"<img />",
    '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" \'http://www.w3.org/TR/html4/strict.dtd\'><img />':"<img />",
    
    '<!DOCTYPE html PUBLIC \'-//W3C//DTD XHTML 1.0 Strict//EN\' \'http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\'><img />':"<img />",
    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><img />':"<img />",
    '<!DOCTYPE html PUBLIC \'-//W3C//DTD XHTML 1.0 Strict//EN\' "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><img />':"<img />",
    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" \'http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\'><img />':"<img />",
    '<!DOCTYPE html PUBLIC \'-//W3C//DTD XHTML 1.0 Strict//EN\' \'http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\'><img />':"<img />"
    
},x, elem, block_elements = [ 'address', 'article', 'aside', 'blockquote', 'dir', 'div', 'dl', 'fieldset', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'menu', 'nav', 'ol', 'p', 'pre', 'section', 'table', 'ul'],
closes = [
    'li', 'li',
    'dt', 'dt',
    'dt', 'dd',
    'dd', 'dt',
    'dd', 'dd',
    'rp', 'rp',
    'rp', 'rt',
    'rt', 'rp',
    'rt', 'rt',
    'optgroup', 'optgroup',
    'thead','tbody',
    'thead','tfoot',
    'tbody', 'tbody',
    'tbody', 'tfoot',
    'tfoot', 'tbody',
    'tr', 'tr',
    'td', 'td',
    'td', 'th',
    'th', 'td',
    'th', 'th'
]


//<p> closed by block
for(x=0; elem = block_elements[x++];){
    fragments["<p>Text<"+elem+">Other text"] = "<p>Text</p>"+(elem=='hr'? "<hr />Other text" : "<"+elem+">Other text"+"</"+elem+">");
    fragments["<p><b>elem<"+elem+"><i>other</i>"] = "<p><b>elem</b></p>"+(elem=='hr'? "<hr /><i>other</i>" : "<"+elem+"><i>other</i>"+"</"+elem+">");
}

for(x=0; elem = closes[x+=2];){
    fragments["<"+closes[x]+">Text<"+closes[x+1]+">Other text"] = "<"+closes[x]+">Text</"+closes[x]+"><"+closes[x+1]+">Other text</"+closes[x+1]+">";
    fragments["<"+closes[x]+"><b>elem<"+closes[x+1]+"><i>other</i>"] = "<"+closes[x]+"><b>elem</b></"+closes[x]+"><"+closes[x+1]+"><i>other</i></"+closes[x+1]+">";
}


for(x in fragments){
    eq(
        facade(x).render(), fragments[x], x
    )
}

unit = "Selection";
var document = facade("<div>\
<span class='foo bar'>Hi</span>\
<b class='foo'>Hello World!</b>\
<b id='test'>Hola</b>\
<strong>Hola</strong>\
<em foo=bar>Hi</em>\
<strong foo=baz>Hi</strong>\
<var foo=fez>Fezzes are cool</var>\
<div>\
<span>\
<var>Hi</var>\
</span>\
</div>\
</div>\
<i foo>Foo</i>\
<var>a</var>")



var selectors = {
    "b": "<b class=foo>Hello World!</b><b id=test>Hola</b>",
    "#test": "<b id=test>Hola</b>",
    "b#test": "<b id=test>Hola</b>",
    "em#test": "",
    ".foo": "<span class='foo bar'>Hi</span><b class=foo>Hello World!</b>",
    ".foo.bar": "<span class='foo bar'>Hi</span>",
    ".baz": "",
    "[foo=bar]":"<em foo=bar>Hi</em>",
    "[foo^=ba]":"<em foo=bar>Hi</em><strong foo=baz>Hi</strong>",
    "[foo$=z]": "<strong foo=baz>Hi</strong><var foo=fez>Fezzes are cool</var>",
    "[foo*=a]": "<em foo=bar>Hi</em><strong foo=baz>Hi</strong>",
    "[foo]": "<em foo=bar>Hi</em><strong foo=baz>Hi</strong><var foo=fez>Fezzes are cool</var><i foo>Foo</i>",
    "strong, var":"<strong>Hola</strong><strong foo=baz>Hi</strong><var foo=fez>Fezzes are cool</var><var>Hi</var><var>a</var>",
    "div var":"<var foo=fez>Fezzes are cool</var><var>Hi</var>",
    "div>var":"<var foo=fez>Fezzes are cool</var>",
    "em+strong":"<strong foo=baz>Hi</strong>",
    "strong~strong":"<strong foo=baz>Hi</strong>",
    "var:first-child":"<var>Hi</var>",
    "span:nth-child(odd)":"<span class='foo bar'>Hi</span><span><var>Hi</var></span>",
    "b:nth-child(even)":"<b class=foo>Hello World!</b>",
    "var:last-child":"<var>Hi</var><var>a</var>",
    "div>*":"<span class='foo bar'>Hi</span><b class=foo>Hello World!</b><b id=test>Hola</b><strong>Hola</strong><em foo=bar>Hi</em><strong foo=baz>Hi</strong><var foo=fez>Fezzes are cool</var><div><span><var>Hi</var></span></div>"
}

for(x in selectors){
    eq(
        document.find(x).render(),
        selectors[x],
        x
    )
}


unit = "Manipulation";

eq(
    facade("<div><b>Hi</b></div>").replace("b", "<strong>Hola</strong>").render(),
    "<div><strong>Hola</strong></div>",
    "replace"
);

eq(
    facade("<div><b>Hi</b></div>").before("b", "<strong>Hola</strong>").render(),
    "<div><strong>Hola</strong><b>Hi</b></div>",
    "before"
);

eq(
    facade("<div><b>Hi</b></div>").after("b", "<strong>Hola</strong>").render(),
    "<div><b>Hi</b><strong>Hola</strong></div>",
    "after"
);

eq(
    facade("<div><b>Hi</b></div>").append("b", "<strong>Hola</strong>").render(),
    "<div><b>Hi<strong>Hola</strong></b></div>",
    "append"
);

eq(
    facade("<div><b>Hi</b></div>").prepend("b", "<strong>Hola</strong>").render(),
    "<div><b><strong>Hola</strong>Hi</b></div>",
    "prepend"
);

eq(
    facade("<div><b>Hi</b></div>").attr("b", "disabled", true).render(),
    "<div><b disabled>Hi</b></div>",
    "add attribute"
);

eq(
    facade("<div><b foo=bar>Hi</b></div>").attr("b", "foo", false).render(),
    "<div><b>Hi</b></div>",
    "remove attribute"
);

eq(
    facade("<div><b>Hi</b></div>").attr("b", "foo", "bar").render(),
    "<div><b foo=bar>Hi</b></div>",
    "set attribute"
);
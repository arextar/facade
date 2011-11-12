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
        pass? msg : msg+"diff:"+diffString(result, expected)
    )
}

var facade = require("../src");

unit = "Parsing";

var fragments = {
    //Normal element
    "<b>asdf</b>": "<b>asdf</b>",
    
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
    
    //Double quoted attribute
    '<div foo="bar" />':'<div foo=bar />',
    
    //Single quoted attribute
    "<div foo='bar' />":'<div foo=bar />',
    
    //Non-quoted attribute
    '<div foo=bar />':'<div foo=bar />'
    
},x;


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
)

/*
 * Javascript Diff Algorithm
 *  By John Resig (http://ejohn.org/)
 *  Modified by Chu Alan "sprite"
 *
 * Released under the MIT license.
 *
 * More Info:
 *  http://ejohn.org/projects/javascript-diff-algorithm/
 */

function escape(s) {
    var n = s;
    n = n.replace(/&/g, "&amp;");
    n = n.replace(/</g, "&lt;");
    n = n.replace(/>/g, "&gt;");
    n = n.replace(/"/g, "&quot;");

    return n;
}

function diffString( o, n ) {
  o = o.replace(/\s+$/, '');
  n = n.replace(/\s+$/, '');

  var out = diff(o == "" ? [] : o.split(/\s+/), n == "" ? [] : n.split(/\s+/) );
  var str = "";

  var oSpace = o.match(/\s+/g);
  if (oSpace == null) {
    oSpace = ["\n"];
  } else {
    oSpace.push("\n");
  }
  var nSpace = n.match(/\s+/g);
  if (nSpace == null) {
    nSpace = ["\n"];
  } else {
    nSpace.push("\n");
  }

  if (out.n.length == 0) {
      for (var i = 0; i < out.o.length; i++) {
        str += '<del>' + escape(out.o[i]) + oSpace[i] + "</del>";
      }
  } else {
    if (out.n[0].text == null) {
      for (n = 0; n < out.o.length && out.o[n].text == null; n++) {
        str += '<del>' + escape(out.o[n]) + oSpace[n] + "</del>";
      }
    }

    for ( var i = 0; i < out.n.length; i++ ) {
      if (out.n[i].text == null) {
        str += '<ins>' + escape(out.n[i]) + nSpace[i] + "</ins>";
      } else {
        var pre = "";

        for (n = out.n[i].row + 1; n < out.o.length && out.o[n].text == null; n++ ) {
          pre += '<del>' + escape(out.o[n]) + oSpace[n] + "</del>";
        }
        str += " " + out.n[i].text + nSpace[i] + pre;
      }
    }
  }
  
  return str;
}

function randomColor() {
    return "rgb(" + (Math.random() * 100) + "%, " + 
                    (Math.random() * 100) + "%, " + 
                    (Math.random() * 100) + "%)";
}
function diffString2( o, n ) {
  o = o.replace(/\s+$/, '');
  n = n.replace(/\s+$/, '');

  var out = diff(o == "" ? [] : o.split(/\s+/), n == "" ? [] : n.split(/\s+/) );

  var oSpace = o.match(/\s+/g);
  if (oSpace == null) {
    oSpace = ["\n"];
  } else {
    oSpace.push("\n");
  }
  var nSpace = n.match(/\s+/g);
  if (nSpace == null) {
    nSpace = ["\n"];
  } else {
    nSpace.push("\n");
  }

  var os = "";
  var colors = new Array();
  for (var i = 0; i < out.o.length; i++) {
      colors[i] = randomColor();

      if (out.o[i].text != null) {
          os += '<span style="background-color: ' +colors[i]+ '">' + 
                escape(out.o[i].text) + oSpace[i] + "</span>";
      } else {
          os += "<del>" + escape(out.o[i]) + oSpace[i] + "</del>";
      }
  }

  var ns = "";
  for (var i = 0; i < out.n.length; i++) {
      if (out.n[i].text != null) {
          ns += '<span style="background-color: ' +colors[out.n[i].row]+ '">' + 
                escape(out.n[i].text) + nSpace[i] + "</span>";
      } else {
          ns += "<ins>" + escape(out.n[i]) + nSpace[i] + "</ins>";
      }
  }

  return { o : os , n : ns };
}

function diff( o, n ) {
  var ns = new Object();
  var os = new Object();
  
  for ( var i = 0; i < n.length; i++ ) {
    if ( ns[ n[i] ] == null )
      ns[ n[i] ] = { rows: new Array(), o: null };
    ns[ n[i] ].rows.push( i );
  }
  
  for ( var i = 0; i < o.length; i++ ) {
    if ( os[ o[i] ] == null )
      os[ o[i] ] = { rows: new Array(), n: null };
    os[ o[i] ].rows.push( i );
  }
  
  for ( var i in ns ) {
    if ( ns[i].rows.length == 1 && typeof(os[i]) != "undefined" && os[i].rows.length == 1 ) {
      n[ ns[i].rows[0] ] = { text: n[ ns[i].rows[0] ], row: os[i].rows[0] };
      o[ os[i].rows[0] ] = { text: o[ os[i].rows[0] ], row: ns[i].rows[0] };
    }
  }
  
  for ( var i = 0; i < n.length - 1; i++ ) {
    if ( n[i].text != null && n[i+1].text == null && n[i].row + 1 < o.length && o[ n[i].row + 1 ].text == null && 
         n[i+1] == o[ n[i].row + 1 ] ) {
      n[i+1] = { text: n[i+1], row: n[i].row + 1 };
      o[n[i].row+1] = { text: o[n[i].row+1], row: i + 1 };
    }
  }
  
  for ( var i = n.length - 1; i > 0; i-- ) {
    if ( n[i].text != null && n[i-1].text == null && n[i].row > 0 && o[ n[i].row - 1 ].text == null && 
         n[i-1] == o[ n[i].row - 1 ] ) {
      n[i-1] = { text: n[i-1], row: n[i].row - 1 };
      o[n[i].row-1] = { text: o[n[i].row-1], row: i - 1 };
    }
  }
  
  return { o: o, n: n };
}



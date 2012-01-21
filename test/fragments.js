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
    '<textarea disabled />':'<textarea disabled />',
    
    
    //Self-closing
    '<ul><li><b>Hello!</b><li>Hi there<li><a href="#">H</a>':"<ul><li><b>Hello!</b></li><li>Hi there</li><li><a href=#>H</a></li></ul>",
    
    
    //Closed by other
    '<dl><dt><dfn>happiness</dfn><dd>State of being happy<dt><dfn>sadness</dfn><dd>State of being sad</dl>':'<dl><dt><dfn>happiness</dfn></dt><dd>State of being happy</dd><dt><dfn>sadness</dfn></dt><dd>State of being sad</dd></dl>',
    
    
    //Not ready for doctypes yet
    /*
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
    '<!DOCTYPE html PUBLIC \'-//W3C//DTD XHTML 1.0 Strict//EN\' \'http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\'><img />':"<img />",*/
    
    //Parse comments
    "A <!--<comment>-->...":"A <!--<comment>-->..."
    
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
 
module.exports = fragments;
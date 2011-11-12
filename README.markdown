Example:
=======

### HTML:

```html
<body>
<p class="post" title="First Post">
Foo bar
</p>
<p class="post" title="Second Post">
Foo baz
</p>
</body>
```


###Javascript:

```javascript
    facade(html)
    .before("p.post", function(p){
        //Create a header with the <p>'s title
        var header = "<h2>"+p.attr.title+"</h2>";
        
        //Remove the title attribute from the <p>
        delete p.attr.title;
    })
    .render(true);
```


###Output:

```html
<body><h2>First Post</h2><p class=post>Foo bar</p><h2>Second Post</h2><p class=post>Foo baz</p></body>
```
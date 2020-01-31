todo

- document.\* deppify fe
- selfHandle vs wxproxy res.end rewrite
- cannot rewrite window.location location.replace & location.valueOf => dont use proxy
- window functions bind & cache memo

```js
document.cookie partition
localStorage partition
sessionStorage partition
document.*
document.write / writeln
this === window // √ be window, but can not be _window
this instanceof Window // √ be window, but can not be _window
```

```js
window.location.replace('') // √
window.location.href = '' // √
window.location = '' // √
location.replace('') // √
location.href = '' // √
location = '' // √
this === window // √ be window, but can not be _window
```

```js
// window.location.href = ''
// window.location = ''
// location.href = ''
_location.__defineSetter__('href', url => {
  console.log([url, ppify(url)])
})
_window.__defineSetter__('location', url => {
  console.log([url, ppify(url)])
})
_window.__defineGetter__('location', () => _location)
{
  let location = _location
  let window = _window
  // original code
}
```

```js
// this === window
;(function() {
  // original code
}.call(_window))
```

```js
// window.location = ''
_window.__defineSetter__('location', url => {
  console.log([url, ppify(url)])
})
{
  let window = _window
  // original code
}
```

```js
// location = ''
_window.__defineSetter__('location', url => {
  console.log([url, ppify(url)])
})
with (_window) {
  // original code
}
```

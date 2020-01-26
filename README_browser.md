```js
window.location.href = ''
window.location = ''
location.href = ''
location = ''
this === window
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

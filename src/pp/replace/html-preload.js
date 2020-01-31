{
  let { tagAttrsArr, ppPrefix } = '%%{{data}}'

  let ppOrigin = location.origin
  let ppEntry = `${ppOrigin}${ppPrefix}`
  let ppPathname = location.pathname // to store against history pushState api
  let targetOrigin = ppPathname
    .replace(ppPrefix, '')
    .match(/^(?:(?:https?:)?\/\/)?[^/]+/)[0]
  if (!/^https?:\/\//i.test(targetOrigin)) {
    if (targetOrigin.startsWith('//')) {
      targetOrigin = 'https:' + targetOrigin
    } else {
      targetOrigin = 'https://' + targetOrigin
    }
  }
  let targetDoamin = targetOrigin.replace(/^(https?:)?\/\//, '')
  let targetPathname = ppPathname
    .replace(ppPrefix, '')
    .replace(targetOrigin, '')
  let targetPath = `${targetPathname}${location.search}${location.hash}`
  let targetHref = `${targetOrigin}${targetPath}`

  // @fixme sync with node
  let deppify = url => {
    // todo
  }

  let ppify = url => {
    if (/^(https?:)?\/\//i.test(url)) {
      if (!url.startsWith(ppEntry)) {
        // @note baidu history pushState
        // 'http://localhost:3000/s?ie=utf-8&f=8&r'
        // => 'http://localhost:3000/proxy/http://localhost:3000/s?ie=utf-8&f=8&r
        if (url.startsWith(ppOrigin)) {
          let linted = url.replace(ppOrigin, '')
          return ppify(linted)
        } else {
          return `${ppEntry}${url}`
        }
      }
    } else if (url.startsWith('/')) {
      if (!url.startsWith(ppPathname)) {
        return url.replace(/^\//, ppPathname)
      }
    }
    return url
  }
  window.__ppify = ppify

  let simpleReplace = markup => {
    let sandbox = document.createElement('div')
    sandbox.innerHTML = markup
    tagAttrsArr.forEach(([tag, ...attrs]) => {
      attrs.forEach(attr => {
        sandbox.querySelectorAll(tag).forEach(el => {
          el[attr] = ppify(el[attr])
        })
      })
    })
    return sandbox.innerHTML
  }

  let fakeToStringAndValueOf = (fn, name) => {
    // todo further deep
    fn.toString = () => `function ${name}() { [native code] }`
    fn.toString.toString = () => 'function toString() { [native code] }'
    fn.valueOf.toString = () => 'function valueOf() { [native code] }'
  }

  // todo wrap & bind
  // ;['setTimeout', 'setInterval'].forEach(k => {
  //   let origFn = window[`__original_${k}`] = window[k]
  //   window[k] = function (str, ms) {
  //     if (typeof str === 'string') {
  //       str = `with (__fakedWindow) { ${str} }`
  //     }
  //     return origFn.call(this, str, ms)
  //   }
  // })

  // window.__fakedLocation = new Proxy(location, {
  window.__fakedLocation = new Proxy(
    {},
    {
      get: (t, k) => {
        // todo more location.*
        if (k === 'href') return targetHref
        if (k === 'replace') {
          // Error the proxy did not return its actual value
          let fn = url => {
            let nurl = ppify(url)
            return location.replace.call(location, nurl)
          }
          fakeToStringAndValueOf(fn, 'replace')
          return fn
        }
        if (k === 'toString') {
          // Error the proxy did not return its actual value
          let fn = () => targetHref
          fakeToStringAndValueOf(fn, 'toString')
          return fn
        }
        if (k === 'valueOf') {
          // Error the proxy did not return its actual value
          let fn = () => this
          fakeToStringAndValueOf(fn, 'valueOf')
          return fn
        }
        return location[k]
      },
      set: (t, k, v) => {
        if (k === 'href') {
          location.href = ppify(v)
          return
        }
        location[k] = v
      },
    }
  )
  window.__fakedDocument = new Proxy(document, {
    get: (t, k) => {
      if (k === 'location') return __fakedLocation
      let v = t[k]
      // todo more document.*
      if (['URL', 'baseURI', 'documentURI', 'domain', 'referrer'].includes(k))
        return deppify(v)
      // if (k === 'domain') return targetDoamin
      // if (k === 'baseURI') return targetHref

      if (['write', 'writeln'].includes(k)) {
        v = function(markup) {
          let newMarkup = simpleReplace(markup)
          return document[k].call(document, newMarkup)
        }
      } else if (typeof v === 'function') {
        if (v.toString().includes('{ [native code] }')) {
          if (!v.prototype) {
            // avoid Window, Object
            v = v.bind(document)
          }
        }
      }
      return v
    },
    set: (t, k, v) => {
      t[k] = v
    },
  })
  let _window = new Proxy(window, {
    get: (t, k) => {
      // if (k === 'top') return _window // Error the proxy did not return its actual value
      // if (k === 'self') return _window // Error the proxy did not return its actual value
      // if (k === 'parent') return _window // Error the proxy did not return its actual value
      // if (k === 'window') return _window // Error the proxy did not return its actual value
      if (k === 'location') return __fakedLocation
      if (k === 'document') return __fakedDocument
      let v = t[k]
      if (k === 'open') {
        v = (url, target, features) => {
          url = ppify(url)
          return window.open(url, target, features)
        }
        fakeToStringAndValueOf(v, 'open')
      } else if (k === 'valueOf') {
        v = () => _window
        fakeToStringAndValueOf(v, 'valueOf')
      } else if (typeof v === 'function') {
        if (v.toString().includes('{ [native code] }')) {
          if (!v.prototype) {
            // avoid Window, Object
            v = v.bind(window)
          }
        }
      }
      return v
    },
    set: (t, k, v) => {
      if (k === 'location') {
        location.href = ppify(v)
        return
      }
      t[k] = v
    },
  })
  window.__fakedWindow = _window
  window.__originalWindow = window

  {
    {
      ;['appendChild', 'insertBefore'].forEach(k => {
        let _fn = Node.prototype[k]
        Node.prototype[k] = function(newNode, ...rest) {
          tagAttrsArr.some(([tag, ...attrs]) => {
            if (newNode.tagName === tag.toUpperCase()) {
              attrs.forEach(attr => {
                if (newNode[attr]) {
                  // or setAttribute?
                  newNode[attr] = ppify(newNode[attr])
                }
              })
              return true
            }
          })
          return _fn.call(this, newNode, ...rest)
        }
      })
    }
  }
  {
    {
      let _open = XMLHttpRequest.prototype.open
      XMLHttpRequest.prototype.open = function(method, url) {
        url = ppify(url)
        return _open.call(this, method, url)
      }
    }
  }
  {
    {
      ;['pushState', 'replaceState'].forEach(k => {
        let _fn = history[k]
        history[k] = function(state, title, url) {
          let nurl = ppify(url)
          console.log(['history', k, url, nurl])
          return _fn.call(this, state, title, nurl)
        }
      })
    }
  }
  {
    {
      let _submit = HTMLFormElement.prototype.submit
      HTMLFormElement.prototype.submit = function(...args) {
        this.action = ppify(this.action)
        return _submit.call(this, ...args)
      }
    }
  }
  {
    {
      // placed at the end
      let s = document.querySelector('#ppPreloadScript')
      s.parentNode.removeChild(s)
    }
  }
}

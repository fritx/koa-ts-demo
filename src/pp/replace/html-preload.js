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
  let [targetProtocol, targetHost] = targetOrigin.split('//')
  let [targetHostname, targetPort] = targetHost.split(':')
  targetPort = targetPort || (targetProtocol === 'https:' ? '443' : '80')
  // let targetDoamin = targetOrigin.replace(/^(https?:)?\/\//, '')
  let targetPathname = ppPathname
    .replace(ppPrefix, '')
    .replace(targetOrigin, '')
  let targetPath = `${targetPathname}${location.search}${location.hash}`
  let targetHref = `${targetOrigin}${targetPath}`

  // @fixme sync with node
  let targetifyFit = url => {
    // todo
    return url
  }
  let targetifyFull = url => {
    // todo
    return url
  }

  let ppify = url => {
    if (typeof url !== 'string') return url
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
      // if (!url.startsWith(ppPathname)) {
      // return url.replace(/^\//, ppPathname)
      if (!url.startsWith(ppPrefix)) {
        return `${ppPrefix}${targetOrigin}${url}`
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

  let __REAL__ = '__REAL__'
  let ensureReal = o => o && o[__REAL__] ? o[__REAL__] : o

  // 覆盖 EventTarget.add/removeEventListener 以及 *Observer.observe
  // EventTarget > WindowProperties > Window
  // EventTarget > Node > Element > HTMLElement
  // EventTarget > Node > Document > HTMLDocument
  ;[EventTarget, Node, MutationObserver, ResizeObserver].forEach(cls => {
    Object.keys(cls.prototype).forEach(k => {
      try {
        // nodeType -- Uncaught TypeError: Illegal invocation
        if (typeof cls.prototype[k] === 'function') {
          let originalFn = cls.prototype[k]
          let faked = {
            [k]: function (...args) {
              args = args.map(ensureReal)
              args = args.map(ppify) // eg. window.fetch(url)
              return originalFn.apply(ensureReal(this), args)
            }
          }
          fakeToStringAndValueOf(faked[k], k)
          cls.prototype[k] = faked[k]
        }
      } catch (err) {
        // ignore
      }
    })
  })
  ;[window].forEach(obj => {
    Object.keys(obj).forEach(k => {
      try {
        // nodeType -- Uncaught TypeError: Illegal invocation
        if (typeof obj[k] === 'function') {
          let originalFn = obj[k]
          let faked = {
            [k]: function (...args) {
              args = args.map(ensureReal)
              args = args.map(ppify) // eg. window.fetch(url)
              return originalFn.apply(ensureReal(this), args)
            }
          }
          fakeToStringAndValueOf(faked[k], k)
          obj[k] = faked[k]
        }
      } catch (err) {
        // ignore
      }
    })
  })

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

  // window.__fakedLocation = new Proxy(location,
  window.__fakedLocation = new Proxy({},
    {
      get: (t, k) => {
        if (k === __REAL__) return location
        // todo more location.*
        // todo hostname port pathname search hash
        // todo targetifyFit
        // if (['href', 'host', 'origin'].includes(k)) {
        //   return targetifyFit(v)
        // }
        if (k === 'protocol') return targetProtocol
        if (k === 'host') return targetHost
        if (k === 'hostname') return targetHostname
        if (k === 'port') return targetPort
        if (k === 'origin') return targetOrigin
        if (k === 'pathname') return targetPathname
        if (k === 'href') return targetHref
        if (k === 'reload') {
          let fn = () => {
            return location.reload()
          }
          fakeToStringAndValueOf(fn, 'reload')
          return fn
        }
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
          let fn = () => __fakedLocation
          fakeToStringAndValueOf(fn, 'valueOf')
          return fn
        }
        return location[k]
      },
      set: (t, k, v) => {
        // todo more location.*
        // todo protocol hostname port pathname search hash
        if (k === 'href') {
          location.href = ppify(v)
          return true
        }
        location[k] = v
        // Uncaught TypeError: 'set' on proxy: trap returned falsish for property 'g_history'
        return true
      },
    }
  )
  window.__fakedDocument = new Proxy(document, {
    get: (t, k) => {
      if (k === __REAL__) return document
      if (k === 'location') return __fakedLocation
      let v = t[k]
      // todo more document.*
      if (['URL', 'baseURI', 'documentURI', 'domain', 'referrer'].includes(k)) {
        return targetifyFit(v)
      }

      if (['write', 'writeln'].includes(k)) {
        v = function(markup) {
          let newMarkup = simpleReplace(markup)
          return document[k].call(document, newMarkup)
        }
      } else if (typeof v === 'function') {
        if (v.toString().includes('{ [native code] }')) {
          if (!/^[A-Z]/.test(k)) {
            // avoid Class
            v = v.bind(document)
          }
        }
      }
      return v
    },
    set: (t, k, v) => {
      t[k] = v
      // Uncaught TypeError: 'set' on proxy: trap returned falsish for property 'g_history'
      return true
    },
  })
  let _window = new Proxy(window, {
    get: (t, k) => {
      if (k === __REAL__) return window
      // if (k === 'top') return _window // Error the proxy did not return its actual value
      // if (k === 'self') return _window // Error the proxy did not return its actual value
      // if (k === 'parent') return _window // Error the proxy did not return its actual value
      // if (k === 'window') return _window // Error the proxy did not return its actual value
      if (k === 'location') return __fakedLocation
      if (k === 'document') return __fakedDocument
      // if (k === 'MutationObserver') return __fakedMutationObserver
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
          // 判断prototype.constructor是因为 小红书遇到了document/window.addEventListener
          // 居然有prototype 可能是他们某些polyfill导致
          // https://www.xiaohongshu.com/discovery/item/602fa7980000000001025208
          // Uncaught TypeError: __fakedWindow.Proxy.revocable is not a function
          // if (!v.prototype && ![Proxy].includes(v)) {
          if (!/^[A-Z]/.test(k)) {
            // avoid Class like Window, Object, Proxy
            let ov = v
            v = ov.bind(window)
            for (let k in ov) v[k] = ov[k]
          }
          // FIXME: 没有保证每次调用的一致性
          // TODO: 统一解决
        }
      }
      return v
    },
    set: (t, k, v) => {
      if (k === 'location') {
        location.href = ppify(v)
        return true
      }
      t[k] = v
      // Uncaught TypeError: 'set' on proxy: trap returned falsish for property 'g_history'
      return true
    },
  })
  window.__fakedWindow = _window
  // window.__originalWindow = window

  // https://www.jianshu.com/p/8c6c47f0eac6 imgs
  {
    let _setAttribute = Element.prototype.setAttribute
    Element.prototype.setAttribute = function(k, v) {
      let pv = ppify(v)
      console.log('setAttr', k, v, pv)
      return _setAttribute.call(ensureReal(this), k, pv)
    }
    let _getAttribute = Element.prototype.getAttribute
    Element.prototype.getAttribute = function(k) {
      let v = _getAttribute.call(ensureReal(this), k)
      return targetifyFit(v)
    }

    let _createElement = document.createElement
    document.createElement = (...args) => {
      console.log('createElement', args)
      let el = _createElement.call(document, ...args)
      // todo try Proxy instead
      // Object.defineProperty(el, 'src', {
      //   get() {
      //     let src = this.getAttribute('src')
      //     return targetifyFull(src)
      //   },
      //   set(v) {
      //     this.setAttribute('src', v)
      //     return true
      //   },
      // })
      // return el
      let proxy = new Proxy(el, {
        get(t, k) {
          if (k === __REAL__) return el
          if (k === 'src') {
            let src = t.getAttribute('src')
            return targetifyFull(src)
          }
          if (typeof t[k] === 'function') {
            let newk = `__${k}_proxy__`
            if (!t[newk]) t[newk] = t[k].bind(ensureReal(t))
            return t[newk]
          }
          return t[k]
        },
        set(t, k, v) {
          if (k === 'src') {
            t.setAttribute('src', v)
          } else {
            t[k] = v
          }
          return true
        }
      })
      return proxy
    }
  }
  // https://www.jianshu.com/p/8c6c47f0eac6 JSON.parse
  {
    let _parse = JSON.parse
    JSON.parse = str => {
      // same as targetifyScript
      if (str) {
        let mat = str.match(/__fakedWindow\s*;([\s\S]*)\s*\}\s*/)
        if (mat) str = mat[1]
      }
      return _parse(str)
    }
  }
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
        // return _fn.call(this, ensureReal(newNode), ...rest)
        return _fn.call(this, newNode, ...rest)
      }
    })
  }
  {
    let _open = XMLHttpRequest.prototype.open
    XMLHttpRequest.prototype.open = function(method, url) {
      url = ppify(url)
      return _open.call(this, method, url)
    }
  }
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
  {
    let _submit = HTMLFormElement.prototype.submit
    HTMLFormElement.prototype.submit = function(...args) {
      this.action = ppify(this.action)
      return _submit.call(this, ...args)
    }
  }
  {
    // placed at the end
    let s = document.querySelector('#ppPreloadScript')
    if (s) s.parentNode.removeChild(s)
  }
}

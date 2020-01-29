```js
ppPrefix = '/proxy/'
ppPathname = location.pathname
targetOrigin = ppPathname.replace(ppPrefix, '').match(/^(?:(?:https?:)?\/\/)?[^/]+/)[0]
targetDoamin = targetOrigin.replace(/^(https?:)?\/\//, '')

targetPathname = ppPathname.replace(ppPrefix, '').replace(targetOrigin, '')
targetPath = `${targetPathname}${location.search}${location.hash}`
targetHref = `${targetOrigin}${targetPath}`

parseTargetUrl = url => {
  return {

  }
}

deppify = url => {
  let target = parseTargetUrl(url)
  let s0 = url.match(/^((https?:)?\/\/)?/)[0]
  let isPath = !s0 && url.startsWith('/')
  if (isPath) return target.path
  return `${s0}${target.origin}${target.path}`
}

deppify('http://localhost:3000/proxy/https://baidu.com/s/bc?a=123')
deppify('//localhost:3000/proxy/https://baidu.com/s/bc?a=123')
deppify('localhost:3000/proxy/https://baidu.com/s/bc?a=123')
deppify('/proxy/https://baidu.com/s/bc?a=123')
```

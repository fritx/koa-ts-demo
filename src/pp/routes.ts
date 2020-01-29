import * as libUrl from 'url'
import { Middleware } from 'koa'
import { ppProxy } from './proxy'
import { ppPrefix, ppEncodingMode } from './config'
import { deppify } from './utils'

let handleProxy: Middleware = async ctx => {
  let targetUrl = ''
  {
    let { url, protocol } = ctx
    // let targetUrlEnc = url.substr(ppPrefix.length)
    // targetUrl = decodeURIComponent(targetUrlEnc)
    targetUrl = url.substr(ppPrefix.length)

    if (!/^https?:\/\//i.test(targetUrl)) {
      let prefix = ''
      if (targetUrl.startsWith('//')) {
        prefix = `${protocol}:`
      } else {
        prefix = 'https://'
      }
      targetUrl = `${prefix}${targetUrl}`
    }
  }

  {
    let { req, res, request } = ctx
    let { protocol, host } = libUrl.parse(targetUrl)
    let validOrigin = protocol && host
    if (!validOrigin) return

    let targetOrigin = `${protocol}//${host}`
    let targetUrlPath = targetUrl.substr(targetOrigin.length)

    // could lead to like `https://vendor/blog.css`
    // due to probably chrome's bug
    if (!targetUrlPath) {
      let newUrl = ctx.href.replace(/(\?)|$/, '/$1')
      ctx.redirect(newUrl)
      return
    }
    ctx.respond = false

    if (ppEncodingMode === 'disable-accept') {
      request.headers['accept-encoding'] = ''
    }

    request.url = targetUrlPath

    let ppres = res as PpServerResponse
    ppres._ppCtx = ctx
    ;['origin', 'referer'].forEach(k => {
      let _value = request.headers[k]
      if (_value) {
        let urlProtocol = `${ctx.protocol}:` as UrlProtocol // completes with `:`
        let targetValue = deppify(_value, urlProtocol)
        request.headers[k] = targetValue
      }
    })

    ppProxy.web(req, res, {
      target: targetOrigin,
    })
  }
}

export let ppRoutes: Middleware = async (ctx, next) => {
  if (ctx.url.startsWith(ppPrefix)) {
    await handleProxy(ctx, next)
    return
  }
  ctx.status = 200
  ctx.body = 'hello proxy'
}

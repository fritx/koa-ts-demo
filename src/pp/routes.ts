import { Middleware } from 'koa'
import * as libUrl from 'url'
import { safeUrlParse } from '../lib/url'
import { ppEncodingMode, ppParentPrefix, ppPrefix } from './config'
import { ppProxy } from './proxy'
import { targetifyFit } from './url/targetify'
import cloneDeep = require('lodash/cloneDeep')

let handleProxy: Middleware = async ctx => {
  {
    let { request } = ctx
    let str = ctx.headers['x-forwarded-for-href'] || ctx.href
    if (Array.isArray(str)) str = str.join(' ')
    let arr = str && str.split(/\s+/)
    let ppUrl = arr[arr.length - 1]
    console.log('ppUrl', ppUrl)

    let ppUrlObj = safeUrlParse(ppUrl)
    if (!process.env.ALLOW_PROXY_LOCAL) {
      if (!ppUrlObj.host || /^localhost|::1|[\d\.]+$/i.test(ppUrlObj.host)) {
        throw new Error('not allowed to proxy local')
      }
    }
    ctx.state.ppHeaders = cloneDeep(ctx.headers)
    ctx.state.ppUrl = ppUrl
    ctx.state.ppUrlObj = ppUrlObj

    delete request.headers['x-forwarded-for']
    delete request.headers['x-forwarded-for-href']
  }

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
      // let newUrl = ctx.href.replace(/([?&#])|$/, '/$1')
      let newUrl = ctx.path.replace(/([?&#])|$/, '/$1')
      // newUrl = parentPrefix + newUrl // too hard
      ctx.redirect(newUrl)
      return
    }
    ctx.respond = false

    if (ppEncodingMode === 'disable-accept') {
      request.headers['accept-encoding'] = ''
    }

    request.url = targetUrlPath

    let ppres = res as PpServerResponse
    ppres._ppCtx = ctx as PpCtx
    ;['host', 'origin', 'referer'].forEach(k => {
      let _value = request.headers[k]
      if (_value) {
        // let urlProtocol = `${ctx.protocol}:` as UrlProtocol // completes with `:`
        // let targetValue = targetifyFull(_value, urlProtocol)
        let targetValue = targetifyFit(_value, targetUrl)
        request.headers[k] = targetValue
      }
    })

    // todo baidu login
    // http://passport.bdimg.com/passApi/js/loginv4_1b4b6b2.js
    if (targetUrl.includes('/loginv4')) {
      debugger
    }

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

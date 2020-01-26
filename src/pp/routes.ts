import * as libUrl from 'url'
import { Middleware } from 'koa'
import { ppProxy } from './proxy'
import { ppPrefix, ppEncodingMode } from './config'

export let ppRoutes: Middleware = async ctx => {
  let { req, res, url, request } = ctx

  if (url.startsWith(ppPrefix)) {
    let targetUrlEnc = url.substr(ppPrefix.length)
    let targetUrl = decodeURIComponent(targetUrlEnc)

    if (!/^https?:/.test(targetUrl)) {
      let prefix = 'https:'
      if (!targetUrl.startsWith('//')) prefix += '//'
      targetUrl = `${prefix}${targetUrl}`
    }

    let { protocol, host } = libUrl.parse(targetUrl)

    if (protocol && host) {
      let targetOrigin = `${protocol}//${host}`
      let targetUrlPath = targetUrl.substr(targetOrigin.length)

      // could lead to like `https://vendor/blog.css`
      // due to probably chrome's bug
      if (!targetUrlPath) {
        console.log(['redirect to', targetUrl + '/'])
        ctx.redirect(targetUrl + '/')
        return
      }
      ctx.respond = false

      if (ppEncodingMode === 'disable-accept') {
        request.headers['accept-encoding'] = ''
      }

      request.url = targetUrlPath
      console.log(['proxy to', targetOrigin, targetUrlPath])

      let ppres = res as PpServerResponse
      ppres._ppCtx = ctx

      ppProxy.web(req, res, {
        target: targetOrigin,
      })
      return
    }
  }

  ctx.status = 200
  ctx.body = 'hello proxy'
}

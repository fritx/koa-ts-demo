import { IncomingMessage, ServerResponse } from 'http'
import { ParameterizedContext } from 'koa'
import { UrlWithParsedQuery } from 'url'

declare global {
  type PpEncodingMode = 'disable-accept' | 'try-unzip'

  type PpCtx = ParameterizedContext<
    {
      ppHeaders: Headers
      ppUrl: string
      ppUrlObj: UrlWithParsedQuery
      targetOrigin: string
      targetUrl: string
      targetUrlObj: UrlWithParsedQuery
    },
    {}
  >

  interface PpServerResponse extends ServerResponse {
    _ppCtx: PpCtx
    _ppRules: PpRule[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _ppBody: any
  }

  interface PpRule {
    match: (ctx: PpCtx) => PromiseOrNot<boolean>
    transform: (
      req: IncomingMessage,
      res: PpServerResponse
    ) => PromiseOrNot<void>
  }
}

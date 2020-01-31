import { IncomingMessage, ServerResponse } from 'http'
import { Context } from 'koa'

declare global {
  type PpEncodingMode = 'disable-accept' | 'try-unzip'

  interface PpServerResponse extends ServerResponse {
    _ppCtx: Context
    _ppRules: PpRule[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _ppBody: any
  }

  interface PpRule {
    match: (ctx: Context) => PromiseOrNot<boolean>
    transform: (
      req: IncomingMessage,
      res: PpServerResponse
    ) => PromiseOrNot<void>
  }
}

type PromiseOrNot<T> = T | Promise<T>

type UrlProtocol = 'http:' | 'https:'
type CtxProtocol = 'http' | 'https'

type StrReplace = (str: string) => string

interface Headers {
  [key: string]: string | string[]
}

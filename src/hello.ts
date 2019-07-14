import './sourcemap-polyfill'
import { promises as fs } from 'fs'
import { redis } from './redis'

type Hello = string

async function hello(str: Hello) {
  console.log(['hello', str])

  console.log(process.env.MY_VAR)

  let files = await fs.readdir('.')
  console.log(['files', files.length])

  console.trace('here')

  let prefixRedis = process.env.PREFIX_NODE_APP_REDIS
  let keyVisit = `${prefixRedis}visit`

  setInterval(async () => {
    let count = +(await redis.get(keyVisit)) || 0
    console.log(['visit', count])
    await redis.set(keyVisit, count + 1)
  }, 3000)

  throw new Error('boom')
}

hello('world')

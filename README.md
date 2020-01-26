- [node-ts-demo](https://github.com/fritx/node-ts-demo)
- [koa-ts-demo](https://github.com/fritx/koa-ts-demo)
- [react-ts-demo](https://github.com/fritx/react-ts-demo)

### Changelog

- content-length & proxy approch & pp vs wxproxy - https://github.com/fritx/wxproxy/blob/master/index.js#L81
- zlib unzip - [Decompressing HTTP requests and responses](https://nodejs.org/dist/latest-v12.x/docs/api/zlib.html#zlib_class_zlib_unzip)
- changeOrigin=true - [Error: Hostname/IP doesn't match certificate's altnames - 简书](https://www.jianshu.com/p/6b0a4429f30e)
- add http-proxy logic
- move `*.ts` to src/ and build to dist/
- tslint autofix => eslint prettier autofix
- ava test and npm scripts

**[node-app]**

- ts sourcemap support
- npm start & nodemon dev
- dotenv-cli & .env
- redis options, ioredis

### Todo

- definition for dist files

**[koa]**

- koa, koa-helmet, koa-ratelimit, ioredis, koa error
- nodemon, koa-router, koa-body, api error

```sh
# Node version
# node >= 10

# Install dependencies
npm i

# Live build watch
npx tsc --watch

# Run demo
node dist/hello
```

```plain
- Dependencies
  - typescript 3.5.2
  - typescriot-eslint 1.11.0
  - eslint 6.0.1
  - prettier 1.18.2

- npmrc
  - packafge-lock=false

- tsconfig
  - `compilerOptions.outDir='./dist'`
  - `include='src/**/*.ts'`

- VS-Code Extensions
  - Prettier 1.9.0
  - ESLint 1.9.0
  - DotENV 1.0.1
```

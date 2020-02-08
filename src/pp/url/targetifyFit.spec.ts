import test from 'ava'
import { targetifyFit } from './targetify'

let testArr = [
  ['localhost', 'baidu.com'],
  ['localhost:3000', 'baidu.com'],
  ['//localhost:3000', '//baidu.com'],
  ['http://localhost:3000', 'https://baidu.com'],
  ['http://localhost:3000/', 'https://baidu.com/'],
  ['http://localhost:3000/abc', 'https://baidu.com/a1/a2?q1=1&q2=2'],
  ['/abc', '/a1/a2?q1=1&q2=2'],
]
let targetUrlFull = 'https://baidu.com/a1/a2?q1=1&q2=2'

testArr.forEach(([input, expected]) => {
  test(`targetifyFit ${input} => ${expected}`, t => {
    let actual = targetifyFit(input, targetUrlFull)
    t.is(actual, expected)
  })
})

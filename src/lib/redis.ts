import { redisOptions } from './redis-options'
import * as Redis from 'ioredis'

export const redis = new Redis(redisOptions)

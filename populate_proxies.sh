#!/bin/bash

#Redis Connection Details
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_KEY="proxies"

redis-cli -h $REDIS_HOST -p $REDIS_PORT del $REDIS_KEY
for port in {10001..10100}; do
  redis-cli -h $REDIS_HOST -p $REDIS_PORT lpush $REDIS_KEY $port
done


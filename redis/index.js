const redisStore = require("redis");

const client = redisStore.createClient({
  port: 6380,
});

module.exports = client;

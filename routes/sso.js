const router = require("koa-router")();
const jwt = require("jsonwebtoken");
const fs = require("fs");

const redis = require("../redis");
const request = require("request");

const jwt_key = "atexgjk";
router.use(async (ctx, next) => {
  ctx.res.setHeader("Access-Control-Allow-Origin", "*");
  // ctx.res.setHeader('Access-Control-Allow-Credentials', 'true');

  await next();
});

router.get("/checkToken", async (ctx, next) => {
  return new Promise((resolve) => {
    redis.get(`token-${ctx.session.account || "admin"}`, async (e, res) => {
      console.log(res);
      console.log(ctx.session.token);

      if (res !== ctx.session.token) {
        ctx.response.status = 401;
        ctx.response.body = {
          message: "token过期",
        };
      } else {
        try {
          jwt.verify(ctx.session.token, jwt_key);
          ctx.response.body = {
            message: "success",
          };
        } catch (e) {
          console.log("/checkToken:" + e);
          ctx.response.status = 401;
          ctx.response.body = {
            message: e,
          };
        }
      }
      resolve();
    });
  });
});

router.get("/login", async (ctx, next) => {
  console.log(ctx);
  const token = jwt.sign(
    {
      account: ctx.request.body.account || "admin",
      timestamp: new Date().getTime(),
    },
    jwt_key,
    {
      expiresIn: 60 * 60 * 24,
    }
  );
  ctx.session.account = ctx.request.body.account || "admin";
  ctx.session.token = token;
  redis.set(`token-${ctx.request.body.account || "admin"}`, token);

  ctx.body = ctx.session.account;
});

module.exports = router;

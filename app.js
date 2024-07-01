const Koa = require("koa");
const app = new Koa();
const views = require("koa-views");
const json = require("koa-json");
const onerror = require("koa-onerror");
const bodyparser = require("koa-bodyparser");
const logger = require("koa-logger");
const koaBody = require("koa-body");
const session = require("koa-session");

const index = require("./routes/index");
const users = require("./routes/users");
const sso = require("./routes/sso");
const db = require("./db");
// 连接数据库
db.connect();

// error handler
onerror(app);
app.use(
  koaBody.koaBody({
    multipart: true, // 支持文件上传
    formidable: {
      maxFieldsSize: 2 * 1024 * 1024, // 最大文件为2兆
      maxFileSize: 2 * 1024 * 1024 * 1024,
      multipart: true, // 是否支持 multipart-formdate 的表单
    },
  })
);

//session配置
const session_signed_key = ["some secret hurr"]; // 这个是配合signed属性的签名key
const sessionConfig = {
  key: "koa:sess", //cookie key (default is koa:sess)
  maxAge: 1000 * 60 * 60 * 24, // 过期时间(毫秒) maxAge in ms (default is 1 days)
  overwrite: true, //是否可以overwrite    (默认default true)
  httpOnly: true, //cookie是否只有服务器端可以访问 httpOnly or not (default true)
  signed: true, //签名默认true
  rolling: false, //在每次请求时强行设置cookie，这将重置cookie过期时间（默认：false）
  renew: false, //(boolean) renew session when session is nearly expired,
};
app.keys = session_signed_key;
app.use(session(sessionConfig, app));

// middlewares
app.use(
  bodyparser({
    enableTypes: ["json", "form", "text"],
  })
);
app.use(json());
app.use(logger());
app.use(require("koa-static")(__dirname + "/public"));

app.use(
  views(__dirname + "/views", {
    extension: "pug",
  })
);

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// routes
app.use(index.routes(), index.allowedMethods());
app.use(users.routes(), users.allowedMethods());
app.use(sso.routes(), sso.allowedMethods());

// error-handling
app.on("error", (err, ctx) => {
  console.error("server error", err, ctx);
});

process.on("uncaughtException", function (err, ctx) {
  console.log("-----------uncaughtException-------------:", err);
});
module.exports = app;

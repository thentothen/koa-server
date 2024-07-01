const router = require("koa-router")();
const jwt = require("jsonwebtoken");
const fs = require("fs");
const redis = require("../redis");
const request = require("request");

const jwt_key = "atexgjk";

router.use(async (ctx, next) => {
  ctx.res.setHeader("Access-Control-Allow-Origin", "*");
  // ctx.res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (ctx.originalUrl.includes("/login")) {
    await next();
    return;
  }
  if (ctx.originalUrl.includes("/checkToken")) {
    await next();
    return;
  }

  return new Promise((resolve) => {
    request(
      {
        url: "http://localhost:3000/checkToken", // 请求的URL
        method: "GET", // 请求方法
        headers: {
          cookie: ctx.request.header.cookie,
        },
      },
      async (error, response) => {
        if (error) {
          console.log("error: " + error);
        } else {
          if (response.statusCode === 200) {
            await next();
          } else {
            ctx.response.status = response.statusCode;
            ctx.response.body = response.body;
          }
        }
        resolve();
      }
    );
  });
});

let id = 0;
let arr = [];
let time = setInterval(() => {
  if (arr.length) {
    if (arr[0].status) {
      arr.shift();
    } else {
      arr.splice(0, 1);
    }
    console.log(arr);
  }
}, 1000 * 5);

router.get("/addone", async (ctx, next) => {
  arr.push({
    id: ++id,
    value: ctx.query.data,
    status: 1,
  });
  ctx.body = {
    message: "ok",
  };
});

router.get("/backone", async (ctx, next) => {
  console.log(arr.find((i) => i.id == ctx.query.id));
  (arr.find((i) => i.id == ctx.query.id) || {}).status = 0;
  ctx.body = {
    message: "ok",
  };
});

router.get("/data", async (ctx, next) => {
  ctx.body = {
    data: [],
  };
});

router.get("/", async (ctx, next) => {
  await ctx.render("index", {
    title: "Hello Koa 2!",
  });
});

router.get("/data", async (ctx, next) => {
  ctx.body = {
    data: [],
  };
});

router.post("/upload", async (ctx, next) => {
  let _chunk = "";
  let file = ctx.request.files.file;
  return new Promise((resolve) => {
    const fileReader = fs.createReadStream(file.filepath);
    const ws = fs.createWriteStream(
      `temp/upload_save/${file.originalFilename}`
    );

    fileReader.pipe(ws);
    ctx.response.body = {
      data: "上传成功",
    };
    resolve();
  });
});

router.get("/upload1", async (ctx, next) => {
  const readStream = fs.createReadStream("temp/upload_file/test.txt");
  let _chunk = "";
  readStream.on("data", (chunk) => {
    // 每次读取到数据块时触发
    console.log(chunk);
    _chunk = chunk;
  });

  readStream.on("end", () => {
    // 数据读取完成时触发
    console.log("文件读取完成");

    const ws = fs.createWriteStream("temp/upload_save/test.txt");
    ws.write(_chunk);
    ws.end();

    ws.on("finish", () => {
      console.log("数据已成功写入文件");
    });
  });

  readStream.on("error", (err) => {
    // 发生错误时触发
    console.error(err);
  });
  ctx.body = {
    title: "upload1",
  };
});

module.exports = router;

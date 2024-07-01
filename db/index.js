const mysql = require("mysql");

// 创建MySQL连接
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "db1",
  useConnectionPooling: true,
});

connection.on("error", (err) => {
  if (err) {
    console.error("数据库连接错误：", err);
    throw err;
  }
});
module.exports = connection;

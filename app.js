const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

const index = require('./routes/index')
const users = require('./routes/users')
const txcdn = require('./routes/txcdn')

const  pooldb = require('./config/db');
// error handler
onerror(app)

// Configuration
const config = {
  acmePath: process.env.ACME_PATH || "/root/.acme.sh/acme.sh",
  certDir: process.env.CERT_DIR || "/root/.acme.sh",
  port: process.env.PORT || 3000,
}
// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'ejs'
}))

// logger
app.use(async (ctx, next) => {
  ctx.db = pooldb;  // 所有路由可通过 ctx.db 访问数据库
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())

app.use(txcdn.routes(), txcdn.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app

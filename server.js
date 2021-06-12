require('dotenv').config()
const fs = require('fs')
const Koa = require('koa')
const Router = require('@koa/router')
const body = require('koa-body')
const static = require('koa-static')
const uuid = require('uuid').v4
const Nedb = require('nedb')

const db = new Nedb({ filename: 'data', autoload: true })
const app = new Koa()
const router = new Router()
app.listen(Number(process.env.PORT || 8080))
app.use(router.routes()).use(router.allowedMethods())
app.proxy = true

router.post('/upload', body({ multipart: true }), async ctx => {
  console.log('[DEBUG] begin handling upload')
  const file = ctx.request.files.audio
  const params = ctx.request.body

  // sanity check
  if (Array.isArray(file)) return ctx.throw(400)
  if (!params) return ctx.throw(400)
  if (Object.values(params).some(x => typeof x !== 'string')) return ctx.throw(400)
  const { name, say, type } = params
  if (!name || !say || !type) return ctx.throw(400)

  const filename = uuid()
  const stream = fs.createWriteStream(`${process.cwd()}/${process.env.SAVE_DIR || 'audio'}/${filename}`)
  try {
    await new Promise((resolve, reject) => {
      fs.createReadStream(file.path).pipe(stream).on('close', resolve).on('error', reject)
    })
    await new Promise((resolve, reject) => {
      db.insert({ is: 'audio', params: { name, say, type }, filename, time: Date.now(), ip: ctx.ip }, (err, doc) => err ? reject(err) : resolve(doc))
    })
  } catch (e) {
    console.log(`[ERROR] Uploading file ${e && e.stack || e}`)
    return ctx.throw(500)
  }
  ctx.status = 204
  console.log('[DEBUG] upload done.')
})
router.get('/(.*)', static(`${__dirname}/static`))

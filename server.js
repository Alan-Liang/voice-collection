require('dotenv').config()
const fs = require('fs')
const Koa = require('koa')
const Router = require('@koa/router')
const body = require('koa-body')
const static = require('koa-static')
const uuid = require('uuid').v4
const Nedb = require('nedb')
const { resolve } = require('path')

const db = new Nedb({ filename: 'data', autoload: true })
const app = new Koa()
const router = new Router()
app.listen(Number(process.env.PORT || 8080))
app.use(router.routes()).use(router.allowedMethods())
app.proxy = true
const audioDir = `${process.cwd()}/${process.env.SAVE_DIR || 'audio'}`

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
  const stream = fs.createWriteStream(`${audioDir}/${filename}`)
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
router.post('/data.html', body(), async ctx => {
  if (!ctx.request.body || !ctx.request.body.password) return ctx.throw(400)
  if (ctx.request.body.password !== process.env.PASSWORD) {
    ctx.body = '<!-->密码错误，请<a href="/data.html">重试</a>'
    ctx.status = 401
    return
  }
  const entries = await new Promise((resolve, reject) => {
    db.find({ is: 'audio' }, (err, res) => err ? reject(err) : resolve(res))
  })
  const esc = str => str.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  ctx.body = `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <ul>
    ${entries.map(entry => `
      <li>
        [${new Date(entry.time).toLocaleString()}]
        ${entry.params.type === 'meme' ? '口头禅' : entry.params.type === 'memoir' ? '留言' : '未知'}，
        对象：${esc(entry.params.name)}
        <a href="/audio/${entry.filename}" download>下载音频</a>
        <br>
        ${esc(entry.params.say).replace(/\n/g, '<br>')}
      </li>
    `).join('')}
  </ul>
  `
})
router.get('/audio/(.+)', (ctx, next) => {
  ctx.path = ctx.path.replace('/audio', '')
  ctx.set('Content-Disposition', 'attachment')
  return next()
}, static(audioDir))
router.get('/(.*)', static(`${__dirname}/static`))

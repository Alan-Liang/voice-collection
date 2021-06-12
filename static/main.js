// helper functions
const $ = sel => document.querySelector(sel)
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const showFunction = el => (show = true) => el.classList[show ? 'remove' : 'add']('hidden')

// steps
const steps = [ 'introduction', 'record', 'success' ]
const stepEls = steps.map(name => $(`#step-${name}`))
const focusStep = n => stepEls.forEach((el, i) => el.classList[i === n ? 'add' : 'remove']('current'))
focusStep(0)

// step 0
const goButton = $('#go')
goButton.addEventListener('click', uiStartRecording)
const types = [ 'memoir', 'meme' ]
const typeRadios = types.map(type => $(`#${type}`))
for (const radio of typeRadios) radio.addEventListener('change', updateType)
function updateType () {
  const current = getType()
  $('#name').setAttribute('placeholder', { memoir: '我的一位语文老师', meme: '唐艳杰' }[current])
  $('label[for=name]').innerText = { memoir: '留言对象', meme: '模仿对象' }[current]
  $('label[for=say]').innerText = { memoir: '心里话', meme: '要模仿的话' }[current]
  $('#name-helper').innerText = { memoir: '可以是某一位老师、某一个备课组的老师或年级全体老师，但最好不要出现具体老师的姓名，可以用「我的一位 xx（科目）老师」等代替。', meme: '老师的真实姓名' }[current]
}
const getType = () => types[typeRadios.findIndex(x => x.checked)]
const getRecordTip = () => `${{ memoir: '致：', meme: '模仿：' }[getType()]}${$('#name').value}\n${$('#say').value}`
try { updateType() } catch (e) {}

// step 1
const countdownEl = $('#countdown')
const timeEl = $('#time')
$('#stop').addEventListener('click', uiStopRecording)
$('#play').addEventListener('click', playback)
$('#redo').addEventListener('click', uiStartRecording)
const uploadEl = $('#upload')
uploadEl.addEventListener('click', uiUpload)
$('#back-1').addEventListener('click', () => focusStep(0))
const showCountdown = showFunction(countdownEl)
const showTime = showFunction($('#recording'))
const showStop = showFunction($('#stop'))
const showStart = showFunction($('#stopped'))
const setCountdown = number => countdownEl.innerText = number
const setTime = number => timeEl.innerText = number
let timerId
const doCountdown = async () => {
  showStop(false)
  showStart(false)
  showTime(false)
  showCountdown(true)
  for (const i of [ 3, 2, 1 ]) {
    setCountdown(i)
    await delay(1000)
  }
  showCountdown(false)
  showTime(true)
  showStop(true)
}
const isInvalidName = name => (name.length > 5 && !/^[a-zA-Z0-9 ]+$/.test(name)) || name.length < 2 || /^[0-9]+$/.test(name)
async function uiStartRecording () {
  const name = $('#name').value.trim()
  if (getType() === 'meme' && isInvalidName(name)) return alert(`「${name}」似乎不是一位老师的姓名。`)
  if (name === '') return $('#name').focus()
  if ($('#say').value.trim() === '') return $('#say').focus()
  focusStep(1)
  $('#record-tip').innerText = getRecordTip()
  let stream
  try {
    stream = await requestPermissions()
  } catch (e) {
    return focusStep(0)
  }
  await doCountdown()
  const startTime = Date.now()
  const updateTime = () => {
    const dt = Math.floor((Date.now() - startTime) / 1000)
    const min = String(Math.floor(dt / 60)).padStart(2, '0')
    const sec = String(dt % 60).padStart(2, '0')
    setTime(`${min}:${sec}`)
  }
  updateTime()
  $('#recording').classList.remove('stop')
  timerId = setInterval(updateTime, 1000)
  startRecording(stream)
}
function uiStopRecording () {
  stopRecording()
  showStop(false)
  showStart(true)
  $('#recording').classList.add('stop')
  clearInterval(timerId)
}
async function uiUpload () {
  uploadEl.disabled = true
  try {
    await startUpload()
    focusStep(2)
  } catch (e) {
    console.error(e)
    alert('上传时出现网络错误，请重试。调试信息：' + e)
  } finally {
    uploadEl.disabled = false
  }
}

// step 2
$('#back').addEventListener('click', () => focusStep(0))

// audio
const mediaState = {}
async function requestPermissions () {
  try {
    return await navigator.mediaDevices.getUserMedia({ audio: true })
  } catch (e) {
    console.error(e)
    if (e.name === 'NotAllowedError') {
      alert('请授权使用麦克风')
      throw e
    }
  }
}
function startRecording (stream) {
  const recorder = mediaState.recorder = new MediaRecorder(stream)
  recorder.start()
  const chunks = mediaState.chunks = []
  recorder.addEventListener('dataavailable', e => { chunks.push(e.data) })
  recorder.addEventListener('stop', () => {
    const blob = mediaState.blob = new Blob(chunks)
    mediaState.audio = new Audio(URL.createObjectURL(blob))
  })
}
function stopRecording () { mediaState.recorder.stop() }
function playback () { mediaState.audio.play() }
async function startUpload () {
  const form = new FormData()
  form.append('audio', mediaState.blob)
  form.append('name', $('#name').value)
  form.append('say', $('#say').value)
  form.append('type', getType())

  const xhr = new XMLHttpRequest()
  xhr.timeout = 30 * 1000
  const promise = new Promise((resolve, reject) => {
    xhr.addEventListener('load', () => {
      if (xhr.status === 200 || xhr.status === 204) return resolve()
      reject(xhr.status)
    })
    xhr.addEventListener('error', reject)
  })
  xhr.open('POST', new URL('/upload', location.href))
  xhr.send(form)
  return await promise
}

// misc
const ripples = [ ...document.querySelectorAll('[data-ripple]'), ...document.querySelectorAll('.mdc-button'), ...document.querySelectorAll('.mdc-fab') ]
for (const el of ripples) mdc.ripple.MDCRipple.attachTo(el)
for (const el of document.querySelectorAll('.mdc-text-field')) mdc.textfield.MDCTextField.attachTo(el)

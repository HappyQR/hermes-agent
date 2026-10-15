// A scripted OpenAI-compatible model for Studio screenshots.
//
// Each scenario matches the latest user message by substring and answers one
// step per completion: the step index is the number of assistant messages
// after that user message, so tool results flowing back advance the script.
// Delegated children and the title generator get short canned answers.

import http from 'node:http'

const MODEL_ID = 'mock-model'

const textOf = content =>
  typeof content === 'string'
    ? content
    : Array.isArray(content)
      ? content.map(part => (typeof part === 'string' ? part : part?.text ?? '')).join('')
      : ''

function chunk(delta, finish = null) {
  return `data: ${JSON.stringify({
    id: 'studio-mock',
    object: 'chat.completion.chunk',
    created: 0,
    model: MODEL_ID,
    choices: [{ index: 0, delta, finish_reason: finish }]
  })}\n\n`
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

async function stream(res, step, delayMs) {
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' })
  if (step.delayBefore) await sleep(step.delayBefore)
  for (const piece of tokens(step.reasoning)) {
    res.write(chunk({ reasoning_content: piece }))
    await sleep(delayMs)
  }
  for (const piece of tokens(step.text)) {
    res.write(chunk({ content: piece }))
    await sleep(delayMs)
  }
  const calls = step.toolCalls ?? []
  if (calls.length) {
    res.write(
      chunk(
        {
          tool_calls: calls.map((call, index) => ({
            index,
            id: `call_studio_${Date.now().toString(36)}_${index}`,
            type: 'function',
            function: { name: call.name, arguments: JSON.stringify(call.args) }
          }))
        },
        'tool_calls'
      )
    )
  } else {
    res.write(chunk({}, 'stop'))
  }
  res.write('data: [DONE]\n\n')
  res.end()
}

// Stream CJK text a few characters at a time and Latin text by word.
function* tokens(text) {
  if (!text) return
  const parts = text.match(/[　-鿿＀-￯]{1,3}|[^　-鿿＀-￯]+?(?=\s|$|[　-鿿])|\s+/g) ?? [text]
  yield* parts
}

export function startMockLlm({ scenarios, delayMs = 14, port = 0, log = () => {}, onStep = () => {} }) {
  const server = http.createServer(async (req, res) => {
    try {
      if (req.method === 'GET' && req.url?.startsWith('/v1/models')) {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ object: 'list', data: [{ id: MODEL_ID, object: 'model', owned_by: 'studio' }] }))
        return
      }
      if (req.method !== 'POST' || !req.url?.startsWith('/v1/chat/completions')) {
        res.writeHead(404).end()
        return
      }
      let raw = ''
      for await (const part of req) raw += part
      const body = JSON.parse(raw || '{}')
      const messages = Array.isArray(body.messages) ? body.messages : []
      const system = messages.filter(m => m.role === 'system').map(m => textOf(m.content)).join('\n')
      const lastUser = messages.map(m => m.role).lastIndexOf('user')
      const userText = lastUser >= 0 ? textOf(messages[lastUser].content) : ''
      const stepIndex = messages.slice(lastUser + 1).filter(m => m.role === 'assistant').length

      let step
      if (system.includes('{"title"') || system.includes('"title":')) {
        const scenario = scenarios.find(s => userText.includes(s.match))
        step = { text: JSON.stringify({ title: scenario?.title ?? userText.slice(0, 16) }) }
      } else {
        const scenario = scenarios.find(s => userText.includes(s.match))
        const child = scenarios.flatMap(s => s.children ?? []).find(c => userText.includes(c.match))
        if (scenario?.fail && stepIndex === 0) {
          res.writeHead(401, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: { message: scenario.fail, type: 'invalid_request_error', code: 'invalid_api_key' } }))
          return
        }
        step = child
          ? child.steps[Math.min(stepIndex, child.steps.length - 1)]
          : scenario
            ? scenario.steps[Math.min(stepIndex, scenario.steps.length - 1)]
            : { text: '好的。' }
        log(`[mock] ${scenario?.title ?? child?.match ?? 'default'} step ${stepIndex}`)
        if (scenario && !child) onStep({ title: scenario.title, step: stepIndex, final: !(step.toolCalls ?? []).length })
      }

      if (body.stream) {
        await stream(res, step, delayMs)
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(
          JSON.stringify({
            id: 'studio-mock',
            object: 'chat.completion',
            created: 0,
            model: MODEL_ID,
            choices: [{ index: 0, message: { role: 'assistant', content: step.text ?? '' }, finish_reason: 'stop' }],
            usage: { prompt_tokens: 1200, completion_tokens: 240, total_tokens: 1440 }
          })
        )
      }
    } catch (error) {
      log(`[mock] error ${error?.message}`)
      if (!res.headersSent) res.writeHead(500)
      res.end()
    }
  })

  return new Promise(resolve => {
    server.listen(port, '127.0.0.1', () => {
      const { port: actual } = server.address()
      resolve({ url: `http://127.0.0.1:${actual}`, close: () => new Promise(done => server.close(done)) })
    })
  })
}

export { MODEL_ID }

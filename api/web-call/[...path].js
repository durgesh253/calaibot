export default async function handler(req, res) {
  const targetBase = 'http://51.16.27.23:3001/web-call'
  const url = new URL(req.url, 'http://localhost')
  const suffix = url.pathname.replace(/^\/api\/web-call/, '')
  const targetUrl = targetBase + suffix + (url.search || '')
  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: req.headers.authorization || ''
      },
      body:
        req.method !== 'GET' && req.method !== 'HEAD'
          ? JSON.stringify(req.body || {})
          : undefined
    })
    const ct = upstream.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
      const data = await upstream.json().catch(() => ({}))
      res.status(upstream.status).json(data)
    } else {
      const text = await upstream.text()
      res.status(upstream.status).send(text)
    }
  } catch (err) {
    res.status(502).json({ message: 'Upstream error' })
  }
}

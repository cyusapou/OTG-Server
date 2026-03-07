import http from 'node:http'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { createApp } from 'json-server/lib/app.js'
import { NormalizedAdapter } from 'json-server/lib/adapters/normalized-adapter.js'
import { Observer } from 'json-server/lib/adapters/observer.js'

const PORT = process.env.PORT || 3001
const DB_FILE = 'db.json'

if (!existsSync(DB_FILE)) {
  if (existsSync('db.seed.json')) {
    writeFileSync(DB_FILE, readFileSync('db.seed.json', 'utf-8'))
    console.log('Created db.json from seed file')
  } else {
    console.error('No db.json found. Create one or provide db.seed.json')
    process.exit(1)
  }
}

if (readFileSync(DB_FILE, 'utf-8').trim() === '') {
  writeFileSync(DB_FILE, '{}')
}

const adapter = new JSONFile(DB_FILE)
const observer = new Observer(new NormalizedAdapter(adapter))
const db = new Low(observer, {})
await db.read()

const jsonServerApp = createApp(db, { logger: false, static: [] })

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function handleNearestStop(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  const userLat = parseFloat(url.searchParams.get('userLat'))
  const userLng = parseFloat(url.searchParams.get('userLng'))
  const destinationId = url.searchParams.get('destinationId')

  if (isNaN(userLat) || isNaN(userLng)) {
    res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
    res.end(JSON.stringify({ error: 'userLat and userLng are required' }))
    return
  }

  const stops = db.data.stops || []
  const ranked = stops
    .filter(s => s.id !== destinationId)
    .map(s => ({
      ...s,
      distanceKm: haversineKm(userLat, userLng, s.latitude, s.longitude),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)

  const body = JSON.stringify({
    data: {
      nearestStop: ranked[0] || null,
      alternativeStops: ranked.slice(1, 6),
    },
  })

  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
  res.end(body)
}

const server = http.createServer((req, res) => {
  const pathname = req.url.split('?')[0]

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    })
    res.end()
    return
  }

  if (pathname === '/api/v1/public/nearest-stop' && req.method === 'GET') {
    handleNearestStop(req, res)
    return
  }

  jsonServerApp.handler(req, res)
})

server.listen(PORT, () => {
  console.log(`\n  On The Go API Server`)
  console.log(`  Running on port ${PORT}`)
  console.log(`  http://localhost:${PORT}\n`)
  console.log(`  Custom endpoints:`)
  console.log(`    GET /api/v1/public/nearest-stop?userLat=&userLng=&destinationId=`)
  console.log(`\n  JSON Server collections:`)
  Object.keys(db.data).forEach(key => {
    console.log(`    http://localhost:${PORT}/${key}`)
  })
  console.log()
})

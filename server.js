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

const app = createApp(db, { logger: false, static: [] })

app.listen(PORT, () => {
  console.log(`\n  On The Go API Server`)
  console.log(`  Running on port ${PORT}`)
  console.log(`  http://localhost:${PORT}\n`)
  console.log(`  Endpoints:`)
  Object.keys(db.data).forEach(key => {
    console.log(`    http://localhost:${PORT}/${key}`)
  })
  console.log()
})

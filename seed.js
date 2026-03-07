/**
 * Seed script — imports existing db.seed.json data into MongoDB.
 * Run: node seed.js
 *
 * Handles ID remapping: old string IDs (e.g. "u001") get converted
 * to MongoDB ObjectIds, and all cross-references are updated.
 *
 * Use --force to drop all collections first.
 */
import 'dotenv/config'
import mongoose from 'mongoose'
import { readFileSync, existsSync } from 'node:fs'
import * as Models from './models/index.js'

const SEED_FILE = 'db.seed.json'
const FORCE = process.argv.includes('--force')

const collectionMap = {
  users:             Models.User,
  sessions:          Models.Session,
  companies:         Models.Company,
  depots:            Models.Depot,
  routes:            Models.Route,
  routeApprovals:    Models.RouteApproval,
  stops:             Models.Stop,
  schedules:         Models.Schedule,
  buses:             Models.Bus,
  drivers:           Models.Driver,
  workers:           Models.Worker,
  bookings:          Models.Booking,
  payments:          Models.Payment,
  routineTrips:      Models.RoutineTrip,
  plannedTrips:      Models.PlannedTrip,
  notifications:     Models.Notification,
  scanLogs:          Models.ScanLog,
  tripStatuses:      Models.TripStatus,
  workerSessions:    Models.WorkerSession,
  driverSessions:    Models.DriverSession,
  fareCollections:   Models.FareCollection,
  expenses:          Models.Expense,
  salaries:          Models.Salary,
  incidents:         Models.Incident,
  driverPerformance: Models.DriverPerformance,
  auditLogs:         Models.AuditLog,
}

// Fields that hold references to other collection IDs
const refFields = [
  'userId', 'companyId', 'depotId', 'routeId', 'busId', 'driverId',
  'workerId', 'scheduleId', 'bookingId', 'managerId', 'createdBy',
  'reviewedBy', 'reportedBy', 'resolvedBy', 'loggedBy', 'paidBy',
  'submittedBy', 'scannedByWorkerId', 'tripStatusId',
]

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not set. Create a .env file.')
    process.exit(1)
  }

  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to MongoDB')

  if (!existsSync(SEED_FILE)) {
    console.error(`${SEED_FILE} not found`)
    process.exit(1)
  }

  const data = JSON.parse(readFileSync(SEED_FILE, 'utf-8'))

  if (FORCE) {
    console.log('--force: dropping all collections...')
    for (const Model of Object.values(collectionMap)) {
      await Model.deleteMany({})
    }
  }

  // Phase 1: Assign new ObjectIds and build an old→new ID map
  const idMap = {}
  const preparedData = {}

  for (const [key, records] of Object.entries(data)) {
    if (!Array.isArray(records) || records.length === 0) continue
    if (!collectionMap[key]) continue

    preparedData[key] = records.map(r => {
      const doc = { ...r }
      const oldId = doc.id
      const newId = new mongoose.Types.ObjectId()

      if (oldId) {
        idMap[oldId] = newId.toString()
        delete doc.id
      }
      delete doc._id

      doc._id = newId
      return doc
    })
  }

  // Phase 2: Remap all cross-reference fields using the idMap
  for (const [key, records] of Object.entries(preparedData)) {
    for (const doc of records) {
      for (const field of refFields) {
        if (doc[field] && typeof doc[field] === 'string' && idMap[doc[field]]) {
          doc[field] = idMap[doc[field]]
        }
      }
      // Handle array fields that might contain IDs
      if (Array.isArray(doc.assignedScheduleIds)) {
        doc.assignedScheduleIds = doc.assignedScheduleIds.map(id => idMap[id] || id)
      }
    }
  }

  // Phase 3: Insert into MongoDB
  let totalInserted = 0

  for (const [key, records] of Object.entries(preparedData)) {
    const Model = collectionMap[key]
    if (!Model) continue

    const existing = await Model.countDocuments()
    if (existing > 0 && !FORCE) {
      console.log(`  SKIP ${key} (${existing} docs already exist)`)
      continue
    }

    try {
      const result = await Model.insertMany(records, { ordered: false })
      const count = result.length
      console.log(`  ✓ ${key}: inserted ${count} docs`)
      totalInserted += count
    } catch (err) {
      if (err.code === 11000) {
        const inserted = err.insertedDocs?.length || 0
        console.log(`  ~ ${key}: inserted ${inserted} (some duplicates skipped)`)
        totalInserted += inserted
      } else {
        console.error(`  ✗ ${key}: ${err.message}`)
      }
    }
  }

  console.log(`\nDone. ${totalInserted} total documents inserted.`)
  console.log(`ID map has ${Object.keys(idMap).length} entries.`)
  await mongoose.disconnect()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})

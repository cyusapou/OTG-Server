import { Router } from 'express'
import { crudRouter } from './crud.js'
import * as M from '../models/index.js'
import aiRoutes from './ai.js'

const router = Router()

router.use('/ai', aiRoutes)



// Every collection gets a full CRUD endpoint that mirrors json-server paths.
// Relations map allows _expand=company to work.

router.use('/users',             crudRouter(M.User, {
  searchFields: ['firstName', 'lastName', 'username', 'email', 'phone'],
}))

router.use('/sessions',          crudRouter(M.Session))

router.use('/companies',         crudRouter(M.Company, {
  searchFields: ['name', 'description', 'slug'],
}))

router.use('/depots',            crudRouter(M.Depot, {
  searchFields: ['name', 'city', 'address'],
  relations: { company: M.Company },
}))

router.use('/routes',            crudRouter(M.Route, {
  searchFields: ['origin', 'destination'],
  relations: { company: M.Company },
}))

router.use('/routeApprovals',    crudRouter(M.RouteApproval, {
  relations: { company: M.Company, route: M.Route },
}))

router.use('/stops',             crudRouter(M.Stop, {
  searchFields: ['name', 'code', 'city'],
}))

router.use('/schedules',         crudRouter(M.Schedule, {
  relations: { route: M.Route, company: M.Company, bus: M.Bus },
}))

router.use('/buses',             crudRouter(M.Bus, {
  searchFields: ['plateNumber', 'plate', 'make', 'model'],
  relations: { company: M.Company, depot: M.Depot },
}))

router.use('/drivers',           crudRouter(M.Driver, {
  searchFields: ['name', 'phone', 'licenseNumber'],
  relations: { company: M.Company, depot: M.Depot },
}))

router.use('/workers',           crudRouter(M.Worker, {
  searchFields: ['name', 'phone'],
  relations: { company: M.Company, depot: M.Depot },
}))

router.use('/bookings',          crudRouter(M.Booking, {
  searchFields: ['passengerName', 'passengerEmail', 'passengerPhone'],
  relations: { schedule: M.Schedule, route: M.Route, company: M.Company, bus: M.Bus },
}))

router.use('/payments',          crudRouter(M.Payment, {
  relations: { booking: M.Booking },
}))

router.use('/routineTrips',      crudRouter(M.RoutineTrip))
router.use('/plannedTrips',      crudRouter(M.PlannedTrip))

router.use('/notifications',     crudRouter(M.Notification, {
  searchFields: ['title', 'body', 'message'],
}))

router.use('/scanLogs',          crudRouter(M.ScanLog, {
  relations: { booking: M.Booking, schedule: M.Schedule },
}))

router.use('/tripStatuses',      crudRouter(M.TripStatus, {
  relations: { schedule: M.Schedule },
}))

router.use('/workerSessions',    crudRouter(M.WorkerSession))
router.use('/driverSessions',    crudRouter(M.DriverSession))

router.use('/fareCollections',   crudRouter(M.FareCollection, {
  relations: { company: M.Company, depot: M.Depot },
}))

router.use('/expenses',          crudRouter(M.Expense, {
  relations: { company: M.Company, depot: M.Depot, bus: M.Bus },
}))

router.use('/salaries',          crudRouter(M.Salary, {
  relations: { company: M.Company, depot: M.Depot },
}))

router.use('/incidents',         crudRouter(M.Incident, {
  searchFields: ['description', 'type'],
  relations: { company: M.Company, depot: M.Depot },
}))

router.use('/driverPerformance', crudRouter(M.DriverPerformance, {
  relations: { company: M.Company },
}))

router.use('/auditLogs',         crudRouter(M.AuditLog, {
  searchFields: ['action', 'description', 'targetType'],
  relations: { company: M.Company },
}))

export default router

import { Router } from 'express'
import Stop from '../models/Stop.js'

const router = Router()

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

router.get('/', async (req, res) => {
  try {
    const userLat = parseFloat(req.query.userLat)
    const userLng = parseFloat(req.query.userLng)
    const destinationId = req.query.destinationId

    if (isNaN(userLat) || isNaN(userLng)) {
      return res.status(400).json({ error: 'userLat and userLng are required' })
    }

    const stops = await Stop.find().lean()

    const ranked = stops
      .filter(s => s._id.toString() !== destinationId)
      .map(s => ({
        ...s,
        id: s._id.toString(),
        _id: undefined,
        __v: undefined,
        distanceKm: haversineKm(userLat, userLng, s.latitude, s.longitude),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)

    res.json({
      data: {
        nearestStop: ranked[0] || null,
        alternativeStops: ranked.slice(1, 6),
      },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router

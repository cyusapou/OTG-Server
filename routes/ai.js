import { Router } from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import * as M from '../models/index.js'

const router = Router()
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Known entities map (singular)
const entityModels = {
  company: M.Company,
  user: M.User,
  bus: M.Bus,
  driver: M.Driver,
  depot: M.Depot,
  route: M.Route,
  schedule: M.Schedule,
  stop: M.Stop
}

const schemaSummary = `Schemas:
Company: name*, slug, description, phone*, email, companyType
User: username*, role* (rura/express_admin/manager/driver/worker/passenger), firstName, phone*, companyId, depotId
Bus: plateNumber*, make, model, companyId*, depotId
Driver: name*, phone*, licenseNumber*, companyId, depotId
Depot: name*, city, address, companyId*
*required`

// Simple auth - accept any non-empty token
router.use((req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token || token.trim() === '') return res.status(401).json({error: 'Token required'})
  req.token = token
  next()
})

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body
    const prompt = `${schemaSummary}

Admin assistant for OnTheGo transport. Extract NL to structured create_entity.

JSON only:
{"action": "create_entity", "entity_type": "company", "data": {...}, "confirmation": "yes/no", "message": "response"}

User: ${message}`

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const result = await model.generateContent(prompt)
    const text = await result.response.text()

    let aiOutput
    try {
      aiOutput = JSON.parse(text.trim())
    } catch {
      return res.json({message: text})
    }

    if (aiOutput.action === 'create_entity' && entityModels[aiOutput.entity_type]) {
      if (aiOutput.confirmation === 'no') return res.json(aiOutput)
      
      const Model = entityModels[aiOutput.entity_type]
      const doc = await Model.create(aiOutput.data)
      console.log(`AI created ${aiOutput.entity_type} id ${doc.id}`)
      aiOutput.result = doc.toObject()
    }

    res.json(aiOutput)
  } catch (err) {
    res.status(500).json({error: err.message})
  }
})

export default router


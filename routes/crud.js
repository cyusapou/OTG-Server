import { Router } from 'express'
import { parseQuery } from '../middleware/queryParser.js'

/**
 * Creates a full CRUD router for a Mongoose model.
 * Mimics json-server behavior so existing frontends work unchanged.
 *
 * @param {import('mongoose').Model} Model - Mongoose model
 * @param {object} opts
 * @param {string[]} [opts.searchFields] - fields to include in full-text `q` search
 * @param {Record<string,import('mongoose').Model>} [opts.relations] - for _expand support
 */
export function crudRouter(Model, opts = {}) {
  const router = Router()
  const searchFields = opts.searchFields || ['name', 'title', 'description', 'firstName', 'lastName', 'username', 'email', 'phone']
  const relations = opts.relations || {}

  // GET / — list with filtering, sorting, pagination, search
  router.get('/', async (req, res) => {
    try {
      const { filter, sort, limit, skip, search } = parseQuery(req.query, Model)

      if (search) {
        const modelPaths = Object.keys(Model.schema.paths)
        const orClauses = searchFields
          .filter(f => modelPaths.includes(f))
          .map(f => ({ [f]: { $regex: search, $options: 'i' } }))
        if (orClauses.length) {
          filter.$or = orClauses
        }
      }

      let query = Model.find(filter)
      if (sort) query = query.sort(sort)
      if (skip) query = query.skip(skip)
      if (limit) query = query.limit(limit)

      let docs = await query.lean()
      docs = docs.map(normalizeId)

      if (req.query._expand) {
        docs = await expandRelations(docs, req.query._expand, relations)
      }

      const total = await Model.countDocuments(filter)
      res.set('X-Total-Count', String(total))
      res.set('Access-Control-Expose-Headers', 'X-Total-Count')
      res.json(docs)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  // GET /:id — single document
  router.get('/:id', async (req, res) => {
    try {
      let doc = await Model.findById(req.params.id).lean()
      if (!doc) return res.status(404).json({ error: 'Not found' })
      doc = normalizeId(doc)

      if (req.query._expand) {
        const expanded = await expandRelations([doc], req.query._expand, relations)
        doc = expanded[0]
      }

      res.json(doc)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  // POST / — create
  router.post('/', async (req, res) => {
    try {
      const doc = await Model.create(req.body)
      res.status(201).json(normalizeId(doc.toJSON()))
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  })

  // PUT /:id — full replace
  router.put('/:id', async (req, res) => {
    try {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, overwrite: true, runValidators: true })
      if (!doc) return res.status(404).json({ error: 'Not found' })
      res.json(normalizeId(doc.toJSON()))
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  })

  // PATCH /:id — partial update
  router.patch('/:id', async (req, res) => {
    try {
      const doc = await Model.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true })
      if (!doc) return res.status(404).json({ error: 'Not found' })
      res.json(normalizeId(doc.toJSON()))
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  })

  // DELETE /:id
  router.delete('/:id', async (req, res) => {
    try {
      const doc = await Model.findByIdAndDelete(req.params.id)
      if (!doc) return res.status(404).json({ error: 'Not found' })
      res.json(normalizeId(doc.toJSON()))
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  return router
}

function normalizeId(doc) {
  if (!doc) return doc
  const obj = { ...doc }
  if (obj._id) {
    obj.id = obj._id.toString()
    delete obj._id
  }
  delete obj.__v
  return obj
}

/**
 * Handle _expand=company or _expand=route style relations.
 * Maps a foreignKey like "companyId" → looks up in the Company model.
 */
async function expandRelations(docs, expandParam, relations) {
  const expands = Array.isArray(expandParam) ? expandParam : [expandParam]

  for (const rel of expands) {
    const RelModel = relations[rel]
    if (!RelModel) continue

    const fk = rel + 'Id'
    const ids = [...new Set(docs.map(d => d[fk]).filter(Boolean))]
    if (!ids.length) continue

    // Try to find by _id. Some IDs may be ObjectId strings, some may be legacy.
    const objectIds = []
    const stringIds = []
    for (const id of ids) {
      if (/^[0-9a-fA-F]{24}$/.test(id)) {
        objectIds.push(id)
      } else {
        stringIds.push(id)
      }
    }

    let related = []
    if (objectIds.length) {
      related = await RelModel.find({ _id: { $in: objectIds } }).lean()
    }

    const map = {}
    for (const r of related) {
      map[r._id.toString()] = normalizeId(r)
    }

    for (const doc of docs) {
      if (doc[fk] && map[doc[fk]]) {
        doc[rel] = map[doc[fk]]
      }
    }
  }

  return docs
}

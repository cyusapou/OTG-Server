/**
 * Translates json-server style query params into Mongoose operations.
 * Supports: _sort, _order, _limit, _page, _expand, _embed, q, and
 * arbitrary field filters (companyId, isActive, status, etc.)
 */
export function parseQuery(query, Model) {
  const filter = {}
  let sort = null
  let limit = 0
  let skip = 0
  let search = null

  const reserved = new Set([
    '_sort', '_order', '_limit', '_page', '_start', '_end',
    '_expand', '_embed', 'q', 'callback', '_'
  ])

  for (const [key, value] of Object.entries(query)) {
    if (reserved.has(key)) continue

    if (key.endsWith('_gte')) {
      const field = key.slice(0, -4)
      filter[field] = { ...filter[field], $gte: coerce(value) }
    } else if (key.endsWith('_lte')) {
      const field = key.slice(0, -4)
      filter[field] = { ...filter[field], $lte: coerce(value) }
    } else if (key.endsWith('_ne')) {
      const field = key.slice(0, -3)
      filter[field] = { $ne: coerce(value) }
    } else if (key.endsWith('_like')) {
      const field = key.slice(0, -5)
      filter[field] = { $regex: value, $options: 'i' }
    } else if (Array.isArray(value)) {
      filter[key] = { $in: value.map(coerce) }
    } else {
      filter[key] = coerce(value)
    }
  }

  if (query._sort) {
    const order = query._order?.toLowerCase() === 'desc' ? -1 : 1
    sort = { [query._sort]: order }
  }

  if (query._limit) {
    limit = parseInt(query._limit, 10)
  }

  if (query._page && query._limit) {
    const page = parseInt(query._page, 10) || 1
    skip = (page - 1) * limit
  }

  if (query._start !== undefined) {
    skip = parseInt(query._start, 10)
    if (query._end !== undefined) {
      limit = parseInt(query._end, 10) - skip
    }
  }

  if (query.q) {
    search = query.q
  }

  return { filter, sort, limit, skip, search }
}

function coerce(value) {
  if (value === 'true') return true
  if (value === 'false') return false
  if (value === 'null') return null
  if (!isNaN(value) && value !== '' && !value.startsWith('+')) {
    const n = Number(value)
    if (Number.isFinite(n) && String(n) === value) return n
  }
  return value
}

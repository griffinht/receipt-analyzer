import { Context } from 'hono'
import { insertReceipt, ReceiptData } from '../data'

function validateItem(item: any): boolean {
  return (
    typeof item.name === 'string' && item.name.trim() !== '' &&
    typeof item.genericName === 'string' && item.genericName.trim() !== '' &&
    typeof item.price === 'number' && item.price > 0 &&
    typeof item.department === 'string' && item.department.trim() !== ''
  )
}

export const createReceipt = async (c: Context) => {
    console.log('asd')
  try {
    const body = await c.req.json() as ReceiptData
    
    // Validate the input
    if (!body.store || typeof body.store !== 'string' || body.store.trim() === '') {
      return c.json({ error: 'Invalid store name' }, 400)
    }
    if (!body.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
      return c.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, 400)
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return c.json({ error: 'Items must be a non-empty array' }, 400)
    }
    if (typeof body.total !== 'number' || body.total <= 0) {
      return c.json({ error: 'Invalid total amount' }, 400)
    }

    // Validate each item
    for (let i = 0; i < body.items.length; i++) {
      if (!validateItem(body.items[i])) {
        return c.json({ error: `Invalid item at index ${i}` }, 400)
      }
    }

    // Calculate the total from items to ensure it matches the provided total
    const calculatedTotal = body.items.reduce((sum, item) => sum + item.price, 0)
    if (Math.abs(calculatedTotal - body.total) > 0.01) { // Allow for small floating point discrepancies
      return c.json({ error: 'Total does not match sum of item prices' }, 400)
    }

    // Insert the receipt
    const newReceiptId = insertReceipt(body)
    console.log('af')

    // Return a JSON response with the new receipt ID
    return c.json({ id: newReceiptId }, 201)
  } catch (error) {
    console.error('Error creating receipt:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
}
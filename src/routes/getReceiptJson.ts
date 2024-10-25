import { Context } from 'hono'
import { getReceiptById } from '../data'

export const getReceiptJson = (c: Context) => {
  const id = c.req.param('id')
  const receipt = getReceiptById(id)

  if (!receipt) {
    return c.json({ error: 'Receipt not found' }, 404)
  }

  // Parse the items JSON string back into an object
  const parsedReceipt = {
    ...receipt,
    items: JSON.parse(receipt.items as string)
  }

  return c.json(parsedReceipt)
}
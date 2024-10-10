import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { insertReceipts, getAllReceipts, getReceiptById, Row } from './data'

// Insert receipts into the database
insertReceipts()

const app = new Hono()

// Function to generate the HTML table
function generateTable(receipts: Row[], filterStore: string | null = null) {
  const filteredReceipts = filterStore
    ? receipts.filter(receipt => receipt.store === filterStore)
    : receipts;

  return `
    <table border="1" style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th>Receipt ID</th>
          <th>Store</th>
          <th>Item</th>
          <th>Department</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        ${filteredReceipts.flatMap((receipt: Row) => {
          const items = JSON.parse(receipt.items as string);
          return items.map((item: any) => `
            <tr>
              <td><a href="/receipts/${receipt.id}">${receipt.id}</a></td>
              <td><a href="/?store=${encodeURIComponent(receipt.store as string)}">${receipt.store}</a></td>
              <td>${item.name}</td>
              <td>${item.department}</td>
              <td>$${item.price.toFixed(2)}</td>
            </tr>
          `).join('')
        }).join('')}
      </tbody>
    </table>
  `;
}

// Main page to display all receipts in a table with each item on a separate line
app.get('/', (c) => {
  const receipts = getAllReceipts()
  const filterStore = c.req.query('store')
  const html = `
    <div>
      <h1>All Receipts${filterStore ? ` - ${filterStore}` : ''}</h1>
      ${filterStore ? `<p><a href="/">Show All Stores</a></p>` : ''}
      ${generateTable(receipts, filterStore)}
    </div>
  `
  return c.html(html)
})

// Route to get receipt breakdown as HTML
app.get('/receipts/:id', (c) => {
  const id = c.req.param('id')
  const row = getReceiptById(id)

  if (!row) {
    return c.text('Receipt not found', 404)
  }

  const items = JSON.parse(row.items as string)
  const sortedItems = items.sort((a: any, b: any) => b.price - a.price)

  const html = `
    <div>
      <h2>Receipt #${id} - ${row.store}</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Item</th>
            <th>Department</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          ${sortedItems.map((item: { name: string; price: number; department: string }) => `<tr><td>${item.name}</td><td>${item.department}</td><td>$${item.price.toFixed(2)}</td></tr>`).join('')}
        </tbody>
      </table>
      <p>Total: $${(row.total as number).toFixed(2)}</p>
      <p><a href="/">Back to All Receipts</a></p>
    </div>
  `

  return c.html(html)
})

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
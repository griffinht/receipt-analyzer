import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { insertReceipts, getAllReceipts, getReceiptById, Row } from './data'

// Insert receipts into the database
insertReceipts()

const app = new Hono()

// Function to generate URL parameters
function generateUrlParams(filters: {[key: string]: string | undefined}, newFilter: {[key: string]: string | null}) {
  const updatedFilters = { ...filters, ...newFilter };
  return new URLSearchParams(
    Object.entries(updatedFilters)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => [key, value as string])
  ).toString();
}

// Function to format date to YYYY-MM
function formatDateToMonth(dateString: string) {
  return dateString.substring(0, 7); // This will return YYYY-MM
}

// Function to get year from YYYY-MM-DD
function getYear(dateString: string) {
  return dateString.substring(0, 4); // This will return YYYY
}

// Function to get month name from YYYY-MM
function getMonthName(dateString: string) {
  const date = new Date(dateString + "-01");
  return date.toLocaleString('default', { month: 'long' });
}

// Function to generate the HTML table
function generateTable(receipts: Row[], filters: {store?: string, department?: string, item?: string, month?: string, year?: string}) {
  let totalAmount = 0;
  const filteredReceipts = receipts.filter(receipt => {
    const items = JSON.parse(receipt.items as string);
    const receiptMonth = formatDateToMonth(receipt.date as string);
    const receiptYear = getYear(receipt.date as string);
    return (!filters.store || receipt.store === filters.store) &&
           (!filters.department || items.some((item: any) => item.department === filters.department)) &&
           (!filters.item || items.some((item: any) => 
             item.name.toLowerCase().includes(filters.item?.toLowerCase() ?? '') ||
             item.genericName.toLowerCase().includes(filters.item?.toLowerCase() ?? '')
           )) &&
           (!filters.month || receiptMonth === filters.month) &&
           (!filters.year || receiptYear === filters.year);
  });

  const tableHtml = `
    <table border="1" style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th>Receipt ID</th>
          <th>Year</th>
          <th>Month</th>
          ${!filters.store ? '<th>Store</th>' : ''}
          ${!filters.item ? '<th>Item</th>' : ''}
          ${!filters.item ? '<th>Generic Name</th>' : ''}
          ${!filters.department ? '<th>Department</th>' : ''}
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        ${filteredReceipts.flatMap((receipt: Row) => {
          const items = JSON.parse(receipt.items as string);
          const receiptMonth = formatDateToMonth(receipt.date as string);
          const receiptYear = getYear(receipt.date as string);
          return items
            .filter((item: any) => 
              (!filters.department || item.department === filters.department) &&
              (!filters.item || 
                item.name.toLowerCase().includes(filters.item?.toLowerCase() ?? '') ||
                item.genericName.toLowerCase().includes(filters.item?.toLowerCase() ?? '')
              )
            )
            .map((item: any) => {
              totalAmount += item.price;
              return `
                <tr>
                  <td><a href="/receipts/${receipt.id}">${receipt.id}</a></td>
                  <td><a href="/?${generateUrlParams(filters, {year: receiptYear})}">${receiptYear}</a></td>
                  <td><a href="/?${generateUrlParams(filters, {month: receiptMonth})}">${getMonthName(receiptMonth)}</a></td>
                  ${!filters.store ? `<td><a href="/?${generateUrlParams(filters, {store: receipt.store as string})}">${receipt.store}</a></td>` : ''}
                  ${!filters.item ? `<td><a href="/?${generateUrlParams(filters, {item: filters.item === item.name ? null : item.name})}">${item.name}</a></td>` : ''}
                  ${!filters.item ? `<td><a href="/?${generateUrlParams(filters, {item: filters.item === item.genericName ? null : item.genericName})}">${item.genericName}</a></td>` : ''}
                  ${!filters.department ? `<td><a href="/?${generateUrlParams(filters, {department: filters.department === item.department ? null : item.department})}">${item.department}</a></td>` : ''}
                  <td>$${item.price.toFixed(2)}</td>
                </tr>
              `;
            }).join('');
        }).join('')}
      </tbody>
    </table>
  `;

  return { tableHtml, totalAmount };
}

// Main page to display all receipts in a table with each item on a separate line
app.get('/', (c) => {
  const receipts = getAllReceipts()
  const filters = {
    store: c.req.query('store'),
    department: c.req.query('department'),
    item: c.req.query('item'),
    month: c.req.query('month'),
    year: c.req.query('year')
  }
  
  const activeFilters = Object.entries(filters)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => {
      if (key === 'month' && value) {
        return `<a href="/?${generateUrlParams(filters, {[key]: null})}">${key}: ${getMonthName(value)}</a>`;
      }
      return `<a href="/?${generateUrlParams(filters, {[key]: null})}">${key}: ${value}</a>`;
    })
    .join(', ');

  const { tableHtml, totalAmount } = generateTable(receipts, filters);

  const html = `
    <div>
      <h1>All Receipts${activeFilters ? ` - Filtered by ${activeFilters}` : ''}</h1>
      ${activeFilters ? `<p><a href="/">Show All</a></p>` : ''}
      <button onclick="window.location.href='http://localhost:3001/upload'">Upload New Receipt</button>
      ${tableHtml}
      <div style="position: fixed; bottom: 0; left: 0; width: 100%; background-color: #f1f1f1; padding: 10px; text-align: right; font-weight: bold;">
        Total: $${totalAmount.toFixed(2)}
      </div>
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
      <h2>Receipt #${id} - ${row.store} (${getMonthName(formatDateToMonth(row.date as string))} ${getYear(row.date as string)})</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Item</th>
            <th>Generic Name</th>
            <th>Department</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          ${sortedItems.map((item: { name: string; genericName: string; price: number; department: string }) => `
            <tr>
              <td><a href="/?item=${encodeURIComponent(item.name)}">${item.name}</a></td>
              <td><a href="/?item=${encodeURIComponent(item.genericName)}">${item.genericName}</a></td>
              <td><a href="/?department=${encodeURIComponent(item.department)}">${item.department}</a></td>
              <td>$${item.price.toFixed(2)}</td>
            </tr>
          `).join('')}
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
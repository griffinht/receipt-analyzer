import Database from 'better-sqlite3'

// Initialize SQLite database
const db = new Database('receipts.db')

// Create receipts table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS receipts (
    id TEXT PRIMARY KEY,
    items TEXT,
    total REAL,
    store TEXT
  )
`)

// Function to insert receipts into the database
export function insertReceipts() {
  const insert = db.prepare('INSERT OR REPLACE INTO receipts (id, items, total, store) VALUES (?, ?, ?, ?)')
  const receipts = {
    '1': { 
      items: [
        { name: 'Apple', price: 1.2, department: 'Produce' }, 
        { name: 'Banana', price: 0.5, department: 'Produce' }, 
        { name: 'Strawberries', price: 3.0, department: 'Produce' }
      ], 
      total: 4.7,
      store: 'Food Lion'
    },
    '2': { 
      items: [
        { name: 'Orange', price: 1.0, department: 'Produce' }, 
        { name: 'Grapes', price: 2.5, department: 'Produce' }, 
        { name: 'Blueberries', price: 3.5, department: 'Produce' }
      ], 
      total: 7.0,
      store: 'Whole Foods'
    },
    '3': { 
      items: [
        { name: 'Milk', price: 1.5, department: 'Dairy' }, 
        { name: 'Bread', price: 2.0, department: 'Bakery' }, 
        { name: 'Butter', price: 2.5, department: 'Dairy' }
      ], 
      total: 6.0,
      store: 'Harris Teeter'
    },
    // Add more receipts with stores...
  }

  for (const [id, receipt] of Object.entries(receipts)) {
    insert.run(id, JSON.stringify(receipt.items), receipt.total, receipt.store)
  }
}

// Function to get all receipts
export function getAllReceipts() {
  return db.prepare('SELECT id, items, total, store FROM receipts').all()
}

// Function to get a receipt by ID
export function getReceiptById(id: string) {
  return db.prepare('SELECT items, total, store FROM receipts WHERE id = ?').get(id)
}

export type Row = {
  id: string;
  items?: string;
  total?: number;
  store?: string;
};
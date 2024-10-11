import Database from 'better-sqlite3'
import { generateReceipt } from './dataGenerator'

// Initialize SQLite database
const db = new Database('receipts.db')

// Create receipts table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    items TEXT,
    total REAL,
    store TEXT,
    date TEXT
  )
`)

// Function to insert receipts into the database
export function insertReceipts() {
  const insert = db.prepare('INSERT OR REPLACE INTO receipts (id, items, total, store, date) VALUES (?, ?, ?, ?, ?)')

  // Generate 1000 receipts
  for (let i = 1; i <= 10; i++) {
    const receipt = generateReceipt(i);
    insert.run(receipt.id, JSON.stringify(receipt.items), receipt.total, receipt.store, receipt.date);
  }
}

// Function to get all receipts
export function getAllReceipts() {
  return db.prepare('SELECT id, items, total, store, date FROM receipts').all()
}

// Function to get a receipt by ID
export function getReceiptById(id: string) {
  return db.prepare('SELECT items, total, store, date FROM receipts WHERE id = ?').get(id)
}

export type Row = {
  id: string;
  items?: string;
  total?: number;
  store?: string;
  date?: string;
};

// Update the insertReceipt function to handle potential undefined values
export interface ReceiptData {
  store: string
  date: string
  items: { name: string; genericName: string; price: number; department: string }[]
  total: number
}

export function insertReceipt(receiptData: ReceiptData): number {
  const stmt = db.prepare('INSERT INTO receipts (store, date, items, total) VALUES (?, ?, ?, ?)')
  const result = stmt.run(
    receiptData.store,
    receiptData.date,
    JSON.stringify(receiptData.items),
    receiptData.total
  )
  console.log(result)
  console.log('af')
  return result.lastInsertRowid as number
}
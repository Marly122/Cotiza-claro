CREATE TABLE IF NOT EXISTS purchase_history (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  purchase_date TEXT NOT NULL,
  created_at TEXT NOT NULL,
  suppliers TEXT NOT NULL,
  quote_count INTEGER NOT NULL,
  item_count INTEGER NOT NULL,
  comparable_count INTEGER NOT NULL,
  unique_count INTEGER NOT NULL,
  optimal_total REAL NOT NULL,
  recommendation TEXT NOT NULL,
  snapshot_json TEXT NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_purchase_history_date ON purchase_history(purchase_date DESC);

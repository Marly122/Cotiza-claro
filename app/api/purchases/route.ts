import { env } from "cloudflare:workers";

async function ready(){
  const db=env.DB;
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS purchase_history (id TEXT PRIMARY KEY,name TEXT NOT NULL,purchase_date TEXT NOT NULL,created_at TEXT NOT NULL,suppliers TEXT NOT NULL,quote_count INTEGER NOT NULL,item_count INTEGER NOT NULL,comparable_count INTEGER NOT NULL,unique_count INTEGER NOT NULL,optimal_total REAL NOT NULL,recommendation TEXT NOT NULL,snapshot_json TEXT NOT NULL)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_purchase_history_date ON purchase_history(purchase_date DESC)`),
  ]);
  return db;
}

export async function GET(request:Request){
  const db=await ready(),url=new URL(request.url),from=url.searchParams.get("from"),to=url.searchParams.get("to"),q=url.searchParams.get("q")?.trim();
  const id=url.searchParams.get("id");
  if(id){
    const purchase=await db.prepare(`SELECT * FROM purchase_history WHERE id = ?`).bind(id).first<Record<string,unknown>>();
    if(!purchase)return Response.json({error:"Compra no encontrada"},{status:404});
    let snapshot={};
    try{snapshot=JSON.parse(String(purchase.snapshot_json??"{}"))}catch{}
    delete purchase.snapshot_json;
    return Response.json({purchase:{...purchase,snapshot}});
  }
  const clauses:string[]=[],values:string[]=[];
  if(from){clauses.push("purchase_date >= ?");values.push(from)}
  if(to){clauses.push("purchase_date <= ?");values.push(to)}
  if(q){clauses.push("(name LIKE ? OR suppliers LIKE ?)");values.push(`%${q}%`,`%${q}%`)}
  const sql=`SELECT id,name,purchase_date,created_at,suppliers,quote_count,item_count,comparable_count,unique_count,optimal_total,recommendation FROM purchase_history ${clauses.length?`WHERE ${clauses.join(" AND ")}`:""} ORDER BY purchase_date DESC,created_at DESC`;
  const {results}=await db.prepare(sql).bind(...values).all();
  return Response.json({purchases:results});
}

export async function POST(request:Request){
  const body=await request.json() as Record<string,unknown>,name=String(body.name??"").trim(),purchaseDate=String(body.purchase_date??"");
  if(!name||!/^\d{4}-\d{2}-\d{2}$/.test(purchaseDate))return Response.json({error:"Nombre y fecha de compra son obligatorios"},{status:400});
  const db=await ready(),id=crypto.randomUUID(),now=new Date().toISOString(),suppliers=Array.isArray(body.suppliers)?body.suppliers.map(String):[];
  await db.prepare(`INSERT INTO purchase_history (id,name,purchase_date,created_at,suppliers,quote_count,item_count,comparable_count,unique_count,optimal_total,recommendation,snapshot_json) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).bind(id,name,purchaseDate,now,suppliers.join(", "),Number(body.quote_count??0),Number(body.item_count??0),Number(body.comparable_count??0),Number(body.unique_count??0),Number(body.optimal_total??0),String(body.recommendation??""),JSON.stringify(body.snapshot??{})).run();
  return Response.json({id,created_at:now},{status:201});
}

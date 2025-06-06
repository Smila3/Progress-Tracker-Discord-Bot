const Database =  require('better-sqlite3');
//const db =  new Database('../data/progtrack.db');   Not printing when running from root

const path = require('path');
const db = new Database(path.join(__dirname, '../data/progtrack.db'));

// Users table, bot will only DM if dm_opt_in is 1
db.prepare(
    `CREATE TABLE IF NOT EXISTS users(
        user_id TEXT PRIMARY KEY,
        dm_opt_in INTEGER NOT NULL DEFAULT 0, 
        created_at TEXT NOT NULL
        );`
).run();

//Logs table, keeps track of each log requested by user
db.prepare(
    `CREATE TABLE IF NOT EXISTS activity_logs(
        log_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        activity_type TEXT NOT NULL,
        hours INTEGER NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(user_id)
    );`

).run();

//For faster queries
db.prepare(`
  CREATE INDEX IF NOT EXISTS idx_user_timestamp ON activity_logs(user_id, timestamp);
`).run();

module.exports = db;
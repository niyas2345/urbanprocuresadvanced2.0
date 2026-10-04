// Urban Procures Advanced
// Cloudflare D1 Database Engine
// Powered by SQLite with strict relational integrity, indexed lookups & foreign keys

import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export class D1Database {
  private static instance: DatabaseSync | null = null;
  private static dbPath: string = path.resolve(process.cwd(), 'urbanprocures advanced/database/urbanprocures_d1.sqlite');

  /**
   * Initializes and retrieves the singleton persistent D1 SQLite connection
   */
  public static getDb(): DatabaseSync {
    if (!this.instance) {
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const isNew = !fs.existsSync(this.dbPath);
      this.instance = new DatabaseSync(this.dbPath);
      this.instance.exec('PRAGMA foreign_keys = ON;');
      this.instance.exec('PRAGMA journal_mode = WAL;');

      if (isNew) {
        this.runMigrationsAndSeeds();
      } else {
        // Verify schema exists
        const test = this.instance.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").all();
        if (test.length === 0) {
          this.runMigrationsAndSeeds();
        }
      }
    }
    return this.instance;
  }

  /**
   * Runs schema migrations and seed records
   */
  public static runMigrationsAndSeeds(): void {
    const db = this.instance || (this.instance = new DatabaseSync(this.dbPath));
    const schemaPath = path.resolve(process.cwd(), 'urbanprocures advanced/database/schema.sql');
    const seedsPath = path.resolve(process.cwd(), 'urbanprocures advanced/database/seeds.sql');

    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
      db.exec(schemaSql);
    }

    if (fs.existsSync(seedsPath)) {
      const seedsSql = fs.readFileSync(seedsPath, 'utf-8');
      db.exec(seedsSql);
    }
  }

  /**
   * Cloudflare D1 query compatible helper: prepare and execute all
   */
  public static queryAll<T = any>(sql: string, params: any[] = []): T[] {
    const db = this.getDb();
    const stmt = db.prepare(sql);
    return stmt.all(...params) as T[];
  }

  /**
   * Cloudflare D1 query compatible helper: prepare and execute single first row
   */
  public static queryFirst<T = any>(sql: string, params: any[] = []): T | undefined {
    const db = this.getDb();
    const stmt = db.prepare(sql);
    const rows = stmt.all(...params) as T[];
    return rows.length > 0 ? rows[0] : undefined;
  }

  /**
   * Cloudflare D1 query compatible helper: execute statement and return changes
   */
  public static execute(sql: string, params: any[] = []): { changes: number; lastInsertRowid: number | bigint } {
    const db = this.getDb();
    const stmt = db.prepare(sql);
    return stmt.run(...params);
  }

  /**
   * Executes multiple SQL statements in transaction
   */
  public static exec(sql: string): void {
    const db = this.getDb();
    db.exec(sql);
  }
}

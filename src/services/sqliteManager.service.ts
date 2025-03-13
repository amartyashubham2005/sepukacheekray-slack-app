import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

class SQLiteManager {
    private db!: Database<sqlite3.Database, sqlite3.Statement>;

    constructor(private dbPath: string = 'history.db') {
        this.init();
    }

    async init(): Promise<void> {
        this.db = await open({
            filename: this.dbPath,
            driver: sqlite3.Database
        });

        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS user_threads (
                slackUserId TEXT NOT NULL,
                slackTeamId TEXT NOT NULL,
                history TEXT NOT NULL,
                PRIMARY KEY (slackUserId, slackTeamId)
            )
        `);
    }

    async getOrCreateHistory(slackUserId: string, slackTeamId: string): Promise<string> {
        const row = await this.db.get(
            'SELECT history FROM user_threads WHERE slackUserId = ? AND slackTeamId = ?',
            [slackUserId, slackTeamId]
        );

        if (row) {
            return row.history; // Reuse existing history
        }
        
        const newHistory = '[]';
        await this.db.run(
            'INSERT INTO user_threads (slackUserId, slackTeamId, history) VALUES (?, ?, ?)',
            [slackUserId, slackTeamId, newHistory]
        );
        return newHistory;
    }

    async updateHistory(slackUserId: string, slackTeamId: string, history: string): Promise<void> {
        await this.getOrCreateHistory(slackUserId, slackTeamId);
        await this.db.run(
            'UPDATE user_threads SET history = ? WHERE slackUserId = ? AND slackTeamId = ?',
            [history, slackUserId, slackTeamId]
        );
    }

    async close(): Promise<void> {
        await this.db.close();
    }
}

export default SQLiteManager;

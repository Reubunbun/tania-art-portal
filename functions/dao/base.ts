import { type QueryResultRow, Client as PgClient } from 'pg';
import knexInitialiser, { type Knex } from 'knex';

export default abstract class Dao<T extends QueryResultRow> {
    private _pgClient: PgClient;
    protected _knex: Knex;

    constructor(pgClient: PgClient) {
        this._pgClient = pgClient;
        this._knex = knexInitialiser({ client: 'pg' });
    }

    protected async _query(q: string) : Promise<Array<T>> {
        const res = await this._pgClient.query<T>(q);
        return res.rows;
    }
}

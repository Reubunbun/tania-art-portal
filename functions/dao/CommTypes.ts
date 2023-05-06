import { Client as PgClient } from 'pg';
import Dao from './base';

type CommissionTypeRow = {
    [CommissionTypes.COL_DISPLAY]: string;
    [CommissionTypes.COL_PRICE]: number;
    [CommissionTypes.COL_OFFER]: number;
    [CommissionTypes.COL_EX_URL]: string;
};

export default class CommissionTypes extends Dao<CommissionTypeRow> {
    static readonly COL_DISPLAY = 'display';
    static readonly COL_PRICE = 'price';
    static readonly COL_OFFER = 'offer';
    static readonly COL_EX_URL = 'example_url';

    private _tableName: string;

    constructor(pgClient: PgClient, type: string) {
        super(pgClient);

        if (type === 'base') {
            this._tableName = 'tania_comm_types';
        } else if (type === 'bg') {
            this._tableName = 'tania_comm_bgs';
        } else {
            throw new Error('Invalid or missing type');
        }
    }

    async getAll() {
        return await this._query(
            this._knex(this._tableName)
                .select()
                .orderBy(CommissionTypes.COL_PRICE)
                .toString(),
        );
    }

    async create(display: string, price: number, offer: number, exampleURL: string) {
        const toInsert: CommissionTypeRow = {
            [CommissionTypes.COL_DISPLAY]: display,
            [CommissionTypes.COL_PRICE]: price,
            [CommissionTypes.COL_OFFER]: offer,
            [CommissionTypes.COL_EX_URL]: exampleURL,
        };
        await this._query(
            this._knex(this._tableName)
                .insert(toInsert)
                .toString(),
        );
    }

    async delete(display: string) {
        await this._query(
            this._knex(this._tableName)
                .del()
                .where(CommissionTypes.COL_DISPLAY, decodeURIComponent(display))
                .toString(),
        );
    }

    async update(
        displayBefore: string,
        displayNew?: string,
        price?: number,
        offer?: number,
        exampleURL?: string,
    ) {
        const objUpdate: Partial<CommissionTypeRow> = {};

        if (displayNew) {
            objUpdate[CommissionTypes.COL_DISPLAY] = displayNew;
        }

        if (price) {
            objUpdate[CommissionTypes.COL_PRICE] = price;
        }

        if (offer !== undefined) {
            objUpdate[CommissionTypes.COL_OFFER] = offer;
        }

        if (exampleURL) {
            objUpdate[CommissionTypes.COL_EX_URL] = exampleURL;
        }

        if (Object.keys(objUpdate).length) {
            await this._query(
                this._knex(this._tableName)
                    .update(objUpdate)
                    .where(CommissionTypes.COL_DISPLAY, displayBefore)
                    .toString(),
            );
        }
    }
}

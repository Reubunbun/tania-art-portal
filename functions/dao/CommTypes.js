const knex = require('knex')({
    client: 'pg',
});

module.exports = class PortfolioTypes {
    static COL_DISPLAY = 'display';
    static COL_PRICE = 'price';
    static COL_OFFER = 'offer';
    static COL_EX_URL = 'example_url';

    constructor(pgClient, type) {
        if (type === 'base') {
            this._tableName = 'tania_comm_types';
        } else if (type === 'bg') {
            this._tableName = 'tania_comm_bgs';
        } else {
            throw new Error('Invalid or missing type');
        }

        this._pgClient = pgClient;
    }

    async getAll() {
        const arrRows = (await this._pgClient.query(
            knex(this._tableName)
                .select()
                .orderBy(PortfolioTypes.COL_PRICE, 'asc')
                .toString(),
        )).rows;

        return arrRows;
    }

    async create(display, price, offer, example_url) {
        await this._pgClient.query(
            knex(this._tableName)
                .insert({
                    [PortfolioTypes.COL_DISPLAY]: display,
                    [PortfolioTypes.COL_PRICE]: price,
                    [PortfolioTypes.COL_OFFER]: offer,
                    [PortfolioTypes.COL_EX_URL]: example_url,
                })
                .toString()
        );
    }

    async delete(display) {
        await this._pgClient.query(
            knex(this._tableName)
                .del()
                .where(PortfolioTypes.COL_DISPLAY, decodeURIComponent(display))
                .toString(),
        );
    }

    async update(displayBefore, displayNew, price, offer, example_url) {
        console.log(displayBefore, displayNew, price, offer, example_url);
        if (!displayBefore) {
            throw new Error('Missing original display name');
        }

        const objUpdate = {};

        if (displayNew) {
            objUpdate[PortfolioTypes.COL_DISPLAY] = displayNew;
        }

        if (price) {
            objUpdate[PortfolioTypes.COL_PRICE] = price;
        }

        if (offer !== undefined) {
            objUpdate[PortfolioTypes.COL_OFFER] = offer;
        }

        if (example_url) {
            objUpdate[PortfolioTypes.COL_EX_URL] = example_url;
        }

        console.log({objUpdate});

        if (Object.keys(objUpdate).length) {
            await this._pgClient.query(
                knex(this._tableName)
                    .update(objUpdate)
                    .where(PortfolioTypes.COL_DISPLAY, displayBefore)
                    .toString(),
            );
        }
    }
};

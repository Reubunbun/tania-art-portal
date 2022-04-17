const Util = require('util');
const knex = require('knex')({
    client: require('knex-serverless-mysql'),
});

module.exports = class CommSpaces {
    static TABLE_NAME = 'tania_portfolio_comm_spaces';

    static COL_NUM_SPACES = 'num_spaces';

    constructor(connSQL) {
        this._connSQL = connSQL;
        this._connSQL.query = Util.promisify(this._connSQL.query);
    }

    async getSpaces() {
        const arrResult = await this._connSQL.query(
            knex(CommSpaces.TABLE_NAME)
                .select(CommSpaces.COL_NUM_SPACES)
                .toString(),
        );

        if (!arrResult.length) {
            return 0;
        }

        return arrResult[0][CommSpaces.COL_NUM_SPACES];
    }

    async updateSpaces(intNewSpaces) {
        await this._connSQL.query(
            knex(CommSpaces.TABLE_NAME)
                .update({
                    [CommSpaces.COL_NUM_SPACES]: intNewSpaces,
                })
                .toString()
        );
    }
}

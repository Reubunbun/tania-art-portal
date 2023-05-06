const knex = require('knex')({
    client: 'pg',
});

module.exports = class CommSpaces {
    static TABLE_NAME = 'tania_comm_spaces';

    static COL_NUM_SPACES = 'num_spaces';

    constructor(pgClient) {
        this._pgClient = pgClient;
    }

    async getSpaces() {
        const arrResult = (await this._pgClient.query(
            knex(CommSpaces.TABLE_NAME)
                .select(CommSpaces.COL_NUM_SPACES)
                .toString(),
        )).rows;

        if (!arrResult.length) {
            return 0;
        }

        return arrResult[0][CommSpaces.COL_NUM_SPACES];
    }

    async updateSpaces(intNewSpaces) {
        await this._pgClient.query(
            knex(CommSpaces.TABLE_NAME)
                .update({
                    [CommSpaces.COL_NUM_SPACES]: intNewSpaces,
                })
                .toString()
        );
    }
}

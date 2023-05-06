import Dao from './base';

type CommSpacesRow = {
    [CommSpaces.COL_NUM_SPACES]: number;
};

export default class CommSpaces extends Dao<CommSpacesRow> {
    static readonly TABLE_NAME = 'tania_comm_spaces';
    static readonly COL_NUM_SPACES = 'num_spaces';

    async getSpaces() : Promise<number> {
        const rows = await this._query(
            this._knex(CommSpaces.TABLE_NAME)
                .select(CommSpaces.COL_NUM_SPACES)
                .toString(),
        );

        if (!rows.length) {
            return 0;
        }

        return rows[0][CommSpaces.COL_NUM_SPACES];
    }

    async updateSpaces(newSpaces: number) {
        await this._query(
            this._knex(CommSpaces.TABLE_NAME)
                .update({ [CommSpaces.COL_NUM_SPACES]: newSpaces })
                .toString(),
        );
    }
}

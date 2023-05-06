const knex = require('knex')({
    client: 'pg',
});

module.exports = class PortfolioTags {
    static TABLE_NAME = 'tania_tags';
    static COL_IMG_ID = 'image_id';
    static COL_TAG_NAME = 'tag_name';

    constructor(pgClient) {
        this._pgClient = pgClient;
    }

    async getAllTags() {
        const arrRows = (await this._pgClient.query(
            knex(PortfolioTags.TABLE_NAME)
                .distinct(PortfolioTags.COL_TAG_NAME)
                .toString(),
        )).rows;

        return arrRows.map(objRow => objRow[PortfolioTags.COL_TAG_NAME]);
    }

    async createTags(intImgId, arrTags) {
        const arrCleanTags = arrTags
            .map(tag => tag.trim())
            .filter(tag => tag);

        const arrInserts = arrCleanTags.map(strTag => ({
            [PortfolioTags.COL_IMG_ID]: intImgId,
            [PortfolioTags.COL_TAG_NAME]: strTag,
        }));

        await this._pgClient.query(
            knex(PortfolioTags.TABLE_NAME)
                .insert(arrInserts)
                .toString(),
        );
    }

    async updateTags(intImgId, arrTags) {
        await this._pgClient.query(
            knex(PortfolioTags.TABLE_NAME)
                .where(PortfolioTags.COL_IMG_ID, intImgId)
                .del()
                .toString(),
        );

        if (!arrTags.length) {
            return;
        }

        await this.createTags(intImgId, arrTags);
    }
};

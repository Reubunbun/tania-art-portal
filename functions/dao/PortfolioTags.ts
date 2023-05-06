import Dao from './base';

type PortfolioTagsRow = {
    [PortfolioTags.COL_IMG_ID]: number;
    [PortfolioTags.COL_TAG_NAME]: string;
};

export default class PortfolioTags extends Dao<PortfolioTagsRow> {
    static readonly TABLE_NAME = 'tania_tags';

    static readonly COL_IMG_ID = 'image_id';
    static readonly COL_TAG_NAME = 'tag_name';

    async getAllTags() : Promise<Array<string>> {
        const rows = await this._query(
            this._knex<PortfolioTagsRow>(PortfolioTags.TABLE_NAME)
                .distinct()
                .toString(),
        );

        return rows.map(row => row[PortfolioTags.COL_TAG_NAME]);
    }

    async createTags(imgId: number, tags: Array<string>) {
        const cleanTags = tags.map(tag => tag.trim()).filter(Boolean);

        if (!cleanTags.length) {
            return;
        }

        const inserts: Array<PortfolioTagsRow> = cleanTags.map(tag => ({
            [PortfolioTags.COL_IMG_ID]: imgId,
            [PortfolioTags.COL_TAG_NAME]: tag,
        }));

        await this._query(
            this._knex(PortfolioTags.TABLE_NAME)
                .insert(inserts)
                .toString(),
        );
    }

    async updateTags(imgId: number, tags: Array<string>) {
        await this._query(
            this._knex(PortfolioTags.TABLE_NAME)
                .where(PortfolioTags.COL_IMG_ID, imgId)
                .del()
                .toString(),
        );

        await this.createTags(imgId, tags);
    }
}

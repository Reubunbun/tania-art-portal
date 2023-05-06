import Dao from './base';
import DaoPortfolioTags from './PortfolioTags';
import { type MyImage } from '../../shared/Constants';

type PortfolioImageRow = {
    [PortfolioImages.COL_IMAGE_ID]: number;
    [PortfolioImages.COL_KEY]: string;
    [PortfolioImages.COL_URL]: string;
    [PortfolioImages.COL_TITLE]: string;
    [PortfolioImages.COL_DESCRIPTION]: string;
    [PortfolioImages.COL_PRIO]: number;
    [PortfolioImages.COL_WIDTH]: number;
    [PortfolioImages.COL_HEIGHT]: number;
};

export default class PortfolioImages extends Dao<PortfolioImageRow> {
    static readonly TABLE_NAME = 'tania_images';

    static readonly COL_IMAGE_ID = 'image_id';
    static readonly COL_KEY = 'key';
    static readonly COL_URL = 'url';
    static readonly COL_TITLE = 'title';
    static readonly COL_DESCRIPTION = 'description';
    static readonly COL_PRIO = 'priority';
    static readonly COL_WIDTH = 'width';
    static readonly COL_HEIGHT = 'height';

    static readonly IMAGES_GET_LIMIT = 200;

    async getAll() : Promise<Array<MyImage>> {
        const rows = await this._query(
            this._knex(PortfolioImages.TABLE_NAME)
                .select(this._knex.raw(`${PortfolioImages.TABLE_NAME}.*, ${DaoPortfolioTags.TABLE_NAME}.${DaoPortfolioTags.COL_TAG_NAME}`))
                .leftJoin(
                    DaoPortfolioTags.TABLE_NAME,
                    `${PortfolioImages.TABLE_NAME}.${PortfolioImages.COL_IMAGE_ID}`,
                    `${DaoPortfolioTags.TABLE_NAME}.${DaoPortfolioTags.COL_IMG_ID}`,
                )
                .toString(),
        );

        if (!rows.length) {
            return [];
        }

        type IndexedImg = Omit<MyImage, 'Tags'> & { Tags: Array<string> };

        const indexesImages: Record<number, IndexedImg> = rows.reduce(
            (indexed: Record<number, IndexedImg>, row: PortfolioImageRow) : Record<number, IndexedImg> => {
                const objImg = indexed[row[PortfolioImages.COL_IMAGE_ID]];
                if (objImg) {
                    return {
                        ...indexed,
                        [row[PortfolioImages.COL_IMAGE_ID]]: {
                            ...objImg,
                            Tags: [
                                ...(objImg.Tags || []),
                                row[DaoPortfolioTags.COL_TAG_NAME],
                            ],
                        },
                    };
                }

                return {
                    ...indexed,
                    [row[PortfolioImages.COL_IMAGE_ID]]: {
                        Id: row[PortfolioImages.COL_IMAGE_ID],
                        Priority: row[PortfolioImages.COL_PRIO],
                        URL: row[PortfolioImages.COL_URL],
                        Title: row[PortfolioImages.COL_TITLE],
                        Description: row[PortfolioImages.COL_DESCRIPTION],
                        Tags: [row[DaoPortfolioTags.COL_TAG_NAME]],
                    },
                };
            },
            {},
        );

        return (Object.values(indexesImages) as Array<IndexedImg>)
            .sort((a, b) => a.Priority - b.Priority)
            .map(img => ({
                ...img,
                Tags: img.Tags.filter(Boolean).join(', '),
            }));
    }

    async create(title: string, description: string, imageUrl: string, width: number, height: number) {
        const insert: Partial<PortfolioImageRow> = {
            [PortfolioImages.COL_TITLE]: title,
            [PortfolioImages.COL_DESCRIPTION]: description,
            [PortfolioImages.COL_URL]: imageUrl,
            [PortfolioImages.COL_WIDTH]: width,
            [PortfolioImages.COL_HEIGHT]: height,
        };

        const alias = 'max_prio';
        const lastPrioResult = await this._query(
            this._knex(PortfolioImages.TABLE_NAME)
                .max(PortfolioImages.COL_PRIO, { as: alias })
                .toString(),
        );

        let newPrio = 1;

        if (lastPrioResult.length) {
            const row = lastPrioResult[0];
            if (alias in row) {
                newPrio = (row[alias] as number) + 1;
            }
        }

        insert[PortfolioImages.COL_PRIO] = newPrio;

        const insertResult = await this._query(
            this._knex(PortfolioImages.TABLE_NAME)
                .insert(insert, [PortfolioImages.COL_IMAGE_ID])
                .toString(),
        );
        return {
            Prio: newPrio,
            Id: insertResult[0][PortfolioImages.COL_IMAGE_ID],
        };
    }

    async update(id: number, prio?: number, title?: string, description?: string) {
        const update: Partial<PortfolioImages> = {};

        if (prio) {
            update[PortfolioImages.COL_PRIO] = prio;
        }

        if (title) {
            update[PortfolioImages.COL_TITLE] = title;
        }

        if (description) {
            update[PortfolioImages.COL_DESCRIPTION] = description;
        }

        if (Object.keys(update).length) {
            await this._query(
                this._knex(PortfolioImages.TABLE_NAME)
                    .update(update)
                    .where(PortfolioImages.COL_IMAGE_ID, id)
                    .toString(),
            );
        }
    }

    async delete(id: number) {
        await this._query(
            this._knex(PortfolioImages.TABLE_NAME)
                .del()
                .where(PortfolioImages.COL_IMAGE_ID, id)
                .toString(),
        );
    }
}

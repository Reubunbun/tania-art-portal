const knex = require('knex')({
    client: 'pg',
});
const DaoPortfolioTags = require('./PortfolioTags.js');

module.exports = class PortfolioImages {
    static TABLE_NAME = 'tania_images';

    static COL_IMAGE_ID = 'image_id';
    static COL_KEY = 'key';
    static COL_URL = 'url';
    static COL_TITLE = 'title';
    static COL_DESCRIPTION = 'description';
    static COL_PRIO = 'priority';
    static COL_WIDTH = 'width';
    static COL_HEIGHT = 'height';

    static IMAGES_GET_LIMIT = 200;

    constructor(pgClient) {
        this._pgClient = pgClient;
    }

    async getAll() {
        const arrRows = (await this._pgClient.query(
            knex(PortfolioImages.TABLE_NAME)
                .select(
                    knex.raw(`${PortfolioImages.TABLE_NAME}.*, ${DaoPortfolioTags.TABLE_NAME}.${DaoPortfolioTags.COL_TAG_NAME}`),
                )
                .leftJoin(
                    DaoPortfolioTags.TABLE_NAME,
                    `${PortfolioImages.TABLE_NAME}.${PortfolioImages.COL_IMAGE_ID}`,
                    `${DaoPortfolioTags.TABLE_NAME}.${DaoPortfolioTags.COL_IMG_ID}`,
                )
                .toString(),
        )).rows;

        if (!arrRows.length) {
            return [];
        }

        const objIndexedImages = arrRows.reduce(
            (objIndex, objRow) => {
                const objImg = objIndex[objRow[PortfolioImages.COL_IMAGE_ID]];
                if (objImg) {
                    return {
                        ...objIndex,
                        [objRow[PortfolioImages.COL_IMAGE_ID]]: {
                            ...objImg,
                            Tags: [
                                ...(objImg.Tags || []),
                                objRow[DaoPortfolioTags.COL_TAG_NAME],
                            ],
                        },
                    };
                }

                return {
                    ...objIndex,
                    [objRow[PortfolioImages.COL_IMAGE_ID]]: {
                        Id: objRow[PortfolioImages.COL_IMAGE_ID],
                        Priority: objRow[PortfolioImages.COL_PRIO],
                        URL: objRow[PortfolioImages.COL_URL],
                        Title: objRow[PortfolioImages.COL_TITLE],
                        Description: objRow[PortfolioImages.COL_DESCRIPTION],
                        Tags: [objRow[DaoPortfolioTags.COL_TAG_NAME]],
                    },
                };
            },
            {},
        );

        return Object.values(objIndexedImages)
            .sort((a, b) => a.Priority - b.Priority)
            .map(
                objImg => ({
                    ...objImg,
                    Tags: objImg.Tags.filter(tag=>tag).join(', '),
                }),
            );
    }

    async create(strTitle, strDescription, strImageUrl, intWidth, intHeight) {
        const objInsert = {
            [PortfolioImages.COL_TITLE]: strTitle,
            [PortfolioImages.COL_DESCRIPTION]: strDescription,
            [PortfolioImages.COL_URL]: strImageUrl,
            [PortfolioImages.COL_WIDTH]: intWidth,
            [PortfolioImages.COL_HEIGHT]: intHeight,
        };

        const strGetLastPrio = knex(PortfolioImages.TABLE_NAME)
            .max(PortfolioImages.COL_PRIO)
            .toString();

        let intNewPrio = 1;

        const arrResults = (await this._pgClient.query(strGetLastPrio)).rows;
        if (arrResults && arrResults.length) {
            const intLastPrio = arrResults[0][`max(\`${PortfolioImages.COL_PRIO}\`)`];

            if (intLastPrio === null) {
                intNewPrio = 1;
            } else {
                intNewPrio = intLastPrio + 1;
            }
        }

        objInsert[PortfolioImages.COL_PRIO] = intNewPrio;

        const objInsertResult = await this._pgClient.query(
            knex(PortfolioImages.TABLE_NAME)
                .insert(objInsert, PortfolioImages.COL_IMAGE_ID)
                .toString()
        );
        console.log('NEWLY INSERTED ID = ',objInsertResult.rows[0][PortfolioImages.COL_IMAGE_ID]);
        return {
            Prio: intNewPrio,
            Id: objInsertResult.rows[0][PortfolioImages.COL_IMAGE_ID],
        };
    }

    async update(intId, intPrio, strTitle, strDescription) {
        const objUpdate = {};

        if (intPrio) {
            objUpdate[PortfolioImages.COL_PRIO] = intPrio;
        }

        if (strTitle) {
            objUpdate[PortfolioImages.COL_TITLE] = strTitle;
        }

        if (strDescription) {
            objUpdate[PortfolioImages.COL_DESCRIPTION] = strDescription;
        }

        if (Object.keys(objUpdate).length) {
            const strUpdate = knex(PortfolioImages.TABLE_NAME)
                .update(objUpdate)
                .where(PortfolioImages.COL_IMAGE_ID, intId)
                .toString();

            await this._pgClient.query(strUpdate);
        }
    }

    async delete(intId) {
        await this._pgClient.query(
            knex(PortfolioImages.TABLE_NAME)
                .del()
                .where(PortfolioImages.COL_IMAGE_ID, intId)
                .toString(),
        );
    }
};

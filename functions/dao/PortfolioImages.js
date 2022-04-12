const Util = require('util');
const knex = require('knex')({
    client: require('knex-serverless-mysql'),
});

module.exports = class PortfolioImages {
    static TABLE_NAME = 'tania_portfolio_images';

    static COL_IMAGE_ID = 'image_id';
    static COL_KEY = 'key';
    static COL_URL = 'url';
    static COL_TITLE = 'title';
    static COL_DESCRIPTION = 'description';
    static COL_TAGS = 'tags';
    static COL_PRIO = 'priority';

    static TAG_TABLE_NAME = 'tania_portfolio_tags';
    static COL_TAG_NAME = 'tag_name';
    static COL_BIT_FLAG = 'bit_flag';

    static IMAGES_GET_LIMIT = 200;

    constructor(connSQL) {
        this._connSQL = connSQL;
        this._connSQL.query = Util.promisify(this._connSQL.query);
    }

    _convertBitsToTags(intBits, objBitMap) {
        return intBits
            .toString(2)
            .split('')
            .reverse()
            .map((char, i) => objBitMap[(+char) * 2**i])
            .filter(bit => bit);
    }

    _convertTagsToBits(arrTags, objBitMap) {
        return arrTags.reduce((prev, curr) => prev + (objBitMap[curr] || 0), 0);
    }

    _generateBitMap(arrTags) {
        return arrTags.reduce((prev, curr, i) => ({
            ...prev,
            [curr]: 2**i,
        }), {});
    }

    async getTagsAsStrings(intIgnoreId) {
        const objQuery = knex(PortfolioImages.TABLE_NAME).select(PortfolioImages.COL_TAGS);
        if (intIgnoreId) {
            objQuery.whereNot(PortfolioImages.COL_IMAGE_ID, intIgnoreId);
        }
        const arrBitRows = await this._connSQL.query(objQuery.toString());
        const objTags = await this.getTags();

        return [
            ...new Set(
                arrBitRows.reduce((prev, curr) =>
                    [
                        ...prev,
                        ...this._convertBitsToTags(
                            curr[PortfolioImages.COL_TAGS],
                            objTags,
                        ),
                    ],
                []),
            ),
        ];
    }

    async _refreshTags(objNewMapping) {
        const objOldMapping = await this.getTags();

        await this._connSQL.query(
            knex(PortfolioImages.TAG_TABLE_NAME).truncate().toString()
        );

        const arrTagInserts = Object.entries(objNewMapping).reduce((prev, [tagName, bitFlag]) =>
            [
                ...prev,
                {
                    [PortfolioImages.COL_TAG_NAME]: tagName,
                    [PortfolioImages.COL_BIT_FLAG]: bitFlag,
                }
            ],
            []
        );

        if (arrTagInserts.length) {
            await this._connSQL.query(
                knex(PortfolioImages.TAG_TABLE_NAME)
                    .insert(arrTagInserts)
                    .toString()
            );
        };

        const arrAllRows = await this._connSQL.query(
            knex(PortfolioImages.TABLE_NAME)
                .select(PortfolioImages.COL_IMAGE_ID)
                .select(PortfolioImages.COL_TAGS)
                .toString(),
        );
        const arrImageInserts = arrAllRows.map(row => ({
            [PortfolioImages.COL_IMAGE_ID]: row[PortfolioImages.COL_IMAGE_ID],
            [PortfolioImages.COL_TAGS]: this._convertTagsToBits(
                this._convertBitsToTags(
                    row[PortfolioImages.COL_TAGS],
                    objOldMapping,
                ),
                objNewMapping,
            ),
        }));

        if (arrImageInserts.length) {
            await this._connSQL.query(
                knex(PortfolioImages.TABLE_NAME)
                    .insert(arrImageInserts)
                    .onConflict()
                    .merge([PortfolioImages.COL_TAGS])
                    .toString(),
            );
        }
    }

    async getTags(bTagAsKey) {
        const strSelect = knex(PortfolioImages.TAG_TABLE_NAME)
            .select()
            .toString();

        const arrResults = await this._connSQL.query(strSelect);

        if (bTagAsKey) {
            return arrResults.reduce((prev, curr) => ({
                ...prev,
                [curr[PortfolioImages.COL_TAG_NAME]]: curr[PortfolioImages.COL_BIT_FLAG],
            }), {});
        }

        return arrResults.reduce((prev, curr) => ({
            ...prev,
            [curr[PortfolioImages.COL_BIT_FLAG]]: curr[PortfolioImages.COL_TAG_NAME],
        }), {});
    }

    async getAll(intPage, objTagFlags) {
        const objSelect = knex(PortfolioImages.TABLE_NAME)
            .select();
        const objCount = knex(PortfolioImages.TABLE_NAME)
            .count('*');

        objSelect
            .orderBy(PortfolioImages.COL_PRIO, 'asc')
            .limit(PortfolioImages.IMAGES_GET_LIMIT)
            .offset(intPage * PortfolioImages.IMAGES_GET_LIMIT);

        let arrImgResults, arrCountResult;
        await Promise.all([
            this._connSQL.query(objSelect.toString()).then(res => arrImgResults = res),
            this._connSQL.query(objCount.toString()).then(res => arrCountResult = res),
        ]);

        return {
            Images: arrImgResults.map(objRow => ({
                Id: objRow[PortfolioImages.COL_IMAGE_ID],
                Priority: objRow[PortfolioImages.COL_PRIO],
                URL: objRow[PortfolioImages.COL_URL],
                Title: objRow[PortfolioImages.COL_TITLE],
                Description: objRow[PortfolioImages.COL_DESCRIPTION],
                Tags: this._convertBitsToTags(
                    objRow[PortfolioImages.COL_TAGS],
                    objTagFlags
                )
                    .join(', '),
            })),
            intTotalCount: arrCountResult[0]['count(*)'],
        };
    }

    async createNEW(strTitle, strDescription, arrTags, strImageUrl) {
        const objInsert = {
            [PortfolioImages.COL_TITLE]: strTitle,
            [PortfolioImages.COL_DESCRIPTION]: strDescription,
            [PortfolioImages.COL_URL]: strImageUrl,
            [PortfolioImages.COL_TAGS]: 0,
        };

        if (arrTags) {
            const arrExistingTags = await this.getTagsAsStrings();
            const arrNewTags = [...new Set([...arrExistingTags, ...arrTags])];
            const objNewBitMap = this._generateBitMap(arrNewTags);
            await this._refreshTags(objNewBitMap);

            objInsert[PortfolioImages.COL_TAGS] = this._convertTagsToBits(
                arrTags,
                objNewBitMap,
            );
        }

        const strGetLastPrio = knex(PortfolioImages.TABLE_NAME)
            .max(PortfolioImages.COL_PRIO)
            .toString();

        let intNewPrio = 1;

        const arrResults = await this._connSQL.query(strGetLastPrio);
        if (arrResults && arrResults.length) {
            const intLastPrio = arrResults[0][`max(\`${PortfolioImages.COL_PRIO}\`)`];

            if (intLastPrio === null) {
                intNewPrio = 1;
            } else {
                intNewPrio = intLastPrio + 1;
            }
        }

        objInsert[PortfolioImages.COL_PRIO] = intNewPrio;

        const objInsertResult =  await this._connSQL.query(
            knex(PortfolioImages.TABLE_NAME)
                .insert(objInsert)
                .toString()
        );
        return {
            Prio: intNewPrio,
            Id: objInsertResult.insertId,
        };
    }

    async updateNEW(intId, intPrio, strTitle, strDescription, arrTags) {
        const objUpdate = {};

        if (arrTags) {
            const arrTagsToUpdate = await this.getTagsAsStrings(intId);
            arrTagsToUpdate.push(...arrTags);
            const arrNewTags = [...new Set(arrTagsToUpdate)];
            const objNewBitMap = this._generateBitMap(arrNewTags);
            await this._refreshTags(objNewBitMap);

            objUpdate[PortfolioImages.COL_TAGS] = this._convertTagsToBits(
                arrTags,
                objNewBitMap
            );
        }


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

            await this._connSQL.query(strUpdate);
        }
    }

    async deleteNEW(intId) {
        await this._connSQL.query(
            knex(PortfolioImages.TABLE_NAME)
                .del()
                .where(PortfolioImages.COL_IMAGE_ID, intId)
                .toString(),
        );

        const arrRemainingTags = await this.getTagsAsStrings();
        const objNewMapping = this._generateBitMap(arrRemainingTags);
        await this._refreshTags(objNewMapping);
    }
};

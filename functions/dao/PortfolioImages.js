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
    static COL_PRIORITY = 'priority';

    static TAG_TABLE_NAME = 'tania_portfolio_tags';
    static COL_TAG_NAME = 'tag_name';
    static COL_BIT_FLAG = 'bit_flag';

    static IMAGES_GET_LIMIT = 100;

    constructor(connSQL) {
        this._connSQL = connSQL;
        this._connSQL.query = Util.promisify(this._connSQL.query);
    }

    _convertBitsToTags(intBits, objTags) {
        return intBits
            .toString(2)
            .split('')
            .map((char, i) => objTags[(+char) * 2**i])
            .filter(bit => bit);
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

    async refreshTags(arrNewTags) {
        const objTags = await this.getTags();

        const strGetExistingImageTags = knex(PortfolioImages.TABLE_NAME)
            .select([
                PortfolioImages.COL_IMAGE_ID,
                PortfolioImages.COL_TAGS,
            ])
            .toString();

        const arrImagesResult = await this._connSQL.query(strGetExistingImageTags);

        const arrExistingTagNames = arrImagesResult.reduce((prev, curr) => {
            return [
                ...prev,
                ...this._convertBitsToTags(
                    curr[PortfolioImages.COL_TAGS],
                    objTags
                ),
            ];
        }, []);

        const arrUniqueTags = [...new Set(arrExistingTagNames)];

        const bNewTags = arrNewTags.some(
            strTag => !arrUniqueTags.includes(strTag),
        );

        if (!bNewTags) {
            return;
        }

        const objNewTagBits = [...new Set([...arrUniqueTags, ...arrNewTags])]
            .reduce((prev, curr, i) => ({
                ...prev,
                [curr]: 2**i,
            }), {});

        await this._connSQL.query(
            knex(PortfolioImages.TAG_TABLE_NAME)
                .del()
                .toString()
        );

        await this._connSQL.query(
            knex(PortfolioImages.TAG_TABLE_NAME)
                .insert(
                    Object.entries(objNewTagBits)
                        .map(([key, value]) => ({
                            [PortfolioImages.COL_TAG_NAME]: key,
                            [PortfolioImages.COL_BIT_FLAG]: value,
                        }))
                )
                .toString()
        );

        const arrUpdateRows = arrImagesResult.map(objRow => ({
            ...objRow,
            [PortfolioImages.COL_TAGS]: this._convertBitsToTags(
                objRow[PortfolioImages.COL_TAGS],
                objTags
            )
                .reduce((prev, curr) => prev + (objNewTagBits[curr] || 0), 0),
        }));

        if (!arrUpdateRows.length) {
            return;
        }

        await this._connSQL.query(
            knex(PortfolioImages.TABLE_NAME)
                .insert(arrUpdateRows)
                .onConflict()
                .merge([PortfolioImages.COL_TAGS])
                .toString()
        );
    }

    async getAll(intPage, objTagFlags) {
        const objSelect = knex(PortfolioImages.TABLE_NAME)
            .select();
        const objCount = knex(PortfolioImages.TABLE_NAME)
            .count('*');

        objSelect
            .orderBy(PortfolioImages.COL_PRIORITY, 'asc')
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
                Priority: objRow[PortfolioImages.COL_PRIORITY],
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

    async update(intId, intPrio, strTitle, strDescription, arrTags) {
        const objUpdate = {};

        if (intPrio) {
            objUpdate[PortfolioImages.COL_PRIORITY] = intPrio;
        }

        if (strTitle) {
            objUpdate[PortfolioImages.COL_TITLE] = strTitle;
        }

        if (strDescription) {
            objUpdate[PortfolioImages.COL_DESCRIPTION] = strDescription;
        }

        if (arrTags) {
            const objTagFlags = await this.getTags(true);
            objUpdate[PortfolioImages.COL_TAGS] = arrTags
                .reduce((prev, curr) => prev + (objTagFlags[curr] || 0), 0);
        }

        if (Object.keys(objUpdate).length) {
            const strUpdate = knex(PortfolioImages.TABLE_NAME)
                .update(objUpdate)
                .where(PortfolioImages.COL_IMAGE_ID, intId)
                .toString();

            await this._connSQL.query(strUpdate);
        }
    }

    async create(strTitle, strDescription, arrTags, strImageUrl) {
        const objInsert = {
            [PortfolioImages.COL_TITLE]: strTitle,
            [PortfolioImages.COL_DESCRIPTION]: strDescription,
            [PortfolioImages.COL_URL]: strImageUrl,
        };

        objInsert[PortfolioImages.COL_TAGS] = 0;
        if (arrTags) {
            const objTagFlags = await this.getTags(true);
            objInsert[PortfolioImages.COL_TAGS] = arrTags
                .reduce((prev, curr) => prev + (objTagFlags[curr] || 0), 0);
        }

        const strGetLastPrio = knex(PortfolioImages.TABLE_NAME)
            .max(PortfolioImages.COL_PRIORITY)
            .toString();

        let intNewPrio = 1;

        const arrResults = await this._connSQL.query(strGetLastPrio);
        console.log({arrResults});
        if (arrResults && arrResults.length) {
            const intLastPrio = arrResults[0][`max(\`${PortfolioImages.COL_PRIORITY}\`)`];

            if (intLastPrio === null) {
                intNewPrio = 1;
            } else {
                intNewPrio = intLastPrio + 1;
            }
        }

        objInsert[PortfolioImages.COL_PRIORITY] = intNewPrio;

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

    async deleteById(intId) {
        await this._connSQL.query(
            knex(PortfolioImages.TABLE_NAME)
                .del()
                .where(PortfolioImages.COL_IMAGE_ID, intId)
                .toString(),
        );
    }
};

const knex = require('knex')({
    client: 'pg',
});

module.exports = class Products {
    static GROUP_TABLE_NAME = 'tania_product_group';
    static PRODUCT_TABLE_NAME = 'tania_product';

    static COL_PRODUCT_ID = 'product_id';
    static COL_GROUP_ID = 'group_id';
    static COL_STOCK = 'stock';
    static COL_NAME = 'name';

    constructor(pgClient) {
        this._pgClient = pgClient;
    }

    async getAll() {
        const arrRows = (await this._pgClient.query(
            knex(Products.PRODUCT_TABLE_NAME)
                .select(Products.COL_PRODUCT_ID)
                .select(Products.COL_STOCK)
                .select({
                    ProductName: `${Products.PRODUCT_TABLE_NAME}.${Products.COL_NAME}`
                })
                .select({
                    GroupName: `${Products.GROUP_TABLE_NAME}.${Products.COL_NAME}`,
                })
                .join(
                    Products.GROUP_TABLE_NAME,
                    `${Products.PRODUCT_TABLE_NAME}.${Products.COL_GROUP_ID}`,
                    `${Products.GROUP_TABLE_NAME}.${Products.COL_GROUP_ID}`,
                )
                .orderBy(`${Products.PRODUCT_TABLE_NAME}.${Products.COL_GROUP_ID}`)
                .toString(),
        )).rows;

        return arrRows.map(objRow => ({
            ProductId: objRow[Products.COL_PRODUCT_ID],
            Name: objRow.ProductName === objRow.GroupName
                ? objRow.ProductName
                : `${objRow.GroupName} - ${objRow.ProductName}`,
            Stock: objRow[Products.COL_STOCK],
        }));
    }

    async updateStockByProductId(intProductId, intStock) {
        await this._pgClient.query(
            knex(Products.PRODUCT_TABLE_NAME)
                .update({
                    [Products.COL_STOCK]: intStock,
                })
                .where(Products.COL_PRODUCT_ID, intProductId)
                .toString(),
        );
    }
};

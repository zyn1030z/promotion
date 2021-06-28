odoo.define('ev_pos_promotion_total_price_buy_other_product.DB', function (require) {
    "use strict"

    const PosDB = require('point_of_sale.DB');


    PosDB.include({

        addPromotionTotalPriceBuyOtherProduct: function (data) {
            this.save('pos_promotion_total_price_buy_other_product', data);
        },

        getPromotionTotalPriceBuyOtherProductByPromotionIds: function (ids) {
            let rows = this.load('pos_promotion_total_price_buy_other_product', []);
            // console.log('rows', rows);
            return rows.filter((item) => {
                return _.indexOf(ids, item.promotion_id[0]) != -1;
            });
        },
        getPromotionDiscountByPromotionIds: function (ids) {
            let rows = this.load('discount', []);
            return rows.filter((item) => {
                return _.indexOf(ids, item.promotion_id[0]) != -1;
            });
        },

    });

    return PosDB;

});

odoo.define('ev_pos_promotion_gift_total_amount.DB', function (require) {
    "use strict"

    const PosDB = require('point_of_sale.DB');

    PosDB.include({

        addPromotionGiftTotalAmount: function (conditions) {
            this.save('gift_total_amount', conditions);
        },

        getPromotionGiftTotolAmountByPromotionIds: function (ids) {
            let rows = this.load('gift_total_amount', []);
            return rows.filter((item) => {
                return _.indexOf(ids, item.promotion_id[0]) != -1;
            });
        },

        // addPromotionGiftApply: function (applies) {
        //     this.save('gift_apply', applies);
        // },
        //
        // getPromotionGiftApplyByPromotionIds: function (ids) {
        //     let rows = this.load('gift_apply', []);
        //     return rows.filter((item) => {
        //         return _.indexOf(ids, item.promotion_id[0]) != -1;
        //     });
        // },

    });

    return PosDB;

});

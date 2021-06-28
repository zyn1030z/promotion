odoo.define('ev_pos_promotion_gift_total_amount.models', function (require) {
    "use strict"

    const models = require('point_of_sale.models');

    models.load_models([{
        model: 'pos.promotion.gift.total.amount.apply',
        label: 'Promotion Gift Total Amount Apply',
        fields: ['promotion_id', 'product_id', 'qty', 'total_amount', 'apply_type'],
        domain: (self) => {
            return [['promotion_id', 'in', self.db.getPromotionIds()]]
        },
        loaded: (self, res) => {
            self.db.addPromotionGiftTotalAmount(res);
        }
    }], {after: 'pos.promotion'});

    models.load_fields('pos.promotion', ['pos_promotion_gift_total_amount_ids']);

    return models;

})

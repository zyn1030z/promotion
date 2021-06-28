odoo.define('ev_pos_promotion_total_price_buy_other_product.models', function (require) {
    "use strict"

    let models = require('point_of_sale.models');

    models.load_models([{
        model: 'pos.promotion.total.price.buy.other.product',
        label: 'Promotion Total Price Buy Other Product',
        fields: ['promotion_id', 'product_id', 'qty', 'price_unit', 'discount', 'total_price'],
        domain: (self) => {
            return [['promotion_id', 'in', self.db.getPromotionIds()]]
        },
        loaded: (self, res) => {
            self.db.addPromotionTotalPriceBuyOtherProduct(res);
        }
    }], {after: 'pos.promotion'});

    models.load_fields('pos.promotion', ['pos_promotion_total_price_buy_other_product_ids']);

    return models;

});

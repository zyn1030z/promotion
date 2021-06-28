# -*- coding: utf-8 -*-

from odoo import models, fields, _, api


class PosPromotionTotalPriceBuyOtherProduct(models.Model):
    _name = 'pos.promotion.total.price.buy.other.product'

    promotion_id = fields.Many2one('pos.promotion', string='Promotion')
    product_id = fields.Many2one('product.product', string='Sản phẩm áp dụng')
    qty = fields.Float(string='Số lượng')
    price_unit = fields.Float(string='Giảm giá')
    total_price = fields.Float(string='Tổng giá trị đơn hàng')
    discount = fields.Float(digits=(18, 2), string=_('Chiết khấu'), default=0.0,
                            help=_('Percent to discount. This value between 0 - 100'), required=True)

    @api.constrains('discount')
    def _constraint_discount(self):
        for r in self:
            r._discount_factory()

    @api.onchange('discount')
    def _onchange_discount(self):
        for r in self:
            r._discount_factory()

    def _discount_factory(self):
        MIN, MAX = 0, 100
        if self.discount < MIN:
            self.discount = MIN
        elif self.discount > MAX:
            self.discount = MAX

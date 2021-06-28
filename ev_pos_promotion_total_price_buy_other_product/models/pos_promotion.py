# -*- coding: utf-8 -*-

from odoo import models, fields, _


class PosPromotion(models.Model):
    _inherit = 'pos.promotion'

    type = fields.Selection(selection_add=[
        ('total_price_buy_other_product', 'Giảm giá hàng hóa theo giá trị đơn hàng')
    ])
    pos_promotion_total_price_buy_other_product_ids = fields.One2many('pos.promotion.total.price.buy.other.product', 'promotion_id',
                                                   string="Promotion Total Price Buy Other Product")

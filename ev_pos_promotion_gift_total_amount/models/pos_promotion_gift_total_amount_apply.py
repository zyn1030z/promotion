# -*- coding: utf-8 -*-

from odoo import models, fields, _


class PosPromotionGiftTotalAmountApply(models.Model):
    _name = 'pos.promotion.gift.total.amount.apply'

    promotion_id = fields.Many2one('pos.promotion', string='Promotion')
    product_id = fields.Many2many('product.product', string='Product')
    apply_type = fields.Selection([('one', 'Tặng lẻ'), ('many', 'Tặng gộp')], string='Kiểu tặng')
    qty = fields.Float(string='Quantity')
    total_amount = fields.Float(string='Total Amount')

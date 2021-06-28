# -*- coding: utf-8 -*-

from odoo import models, fields, _


class PosPromotion(models.Model):
    _inherit = 'pos.promotion'

    type = fields.Selection(selection_add=[
        ('gift_total_amount', 'Tặng sản phẩm theo giá trị đơn hàng')
    ])
    pos_promotion_gift_total_amount_apply_ids = fields.One2many('pos.promotion.gift.total.amount.apply', 'promotion_id',
                                                   string="Promotion Gift Total Amount Apply")
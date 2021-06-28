from odoo import fields, models


class PosOrder(models.Model):
    _inherit = 'pos.order'

    def get_current_session_name(self, pos_session_id):
        pos_session_name = self.env['pos.session'].browse(pos_session_id)
        return pos_session_name

# -*- coding: utf-8 -*-
{
    'name': "ERPVIET Pos Promotion Gift Total Amount",

    'summary': """
        Module quản lý các chương trình khuyến mãi tặng sản phẩm theo giá trị hàng bán
    """,

    'author': "ErpViet",
    'website': "http://www.izisolution.vn",

    'category': 'Point Of Sale',
    'version': '0.1',

    'depends': ['base', 'ev_pos_promotion'],

    'data': [
        'security/ir.model.access.csv',
        'views/assets.xml',
        'views/pos_promotion.xml',
    ],
    'qweb': [
        'static/src/xml/Popups/PromotionPopup.xml',
        'static/src/xml/Popups/firt_button.xml',
    ]
}

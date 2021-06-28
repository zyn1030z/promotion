odoo.define('SearchPhone', function (require) {
    "use strict"

    const PosComponent = require('point_of_sale.PosComponent')
    const Registries = require('point_of_sale.Registries')


    class SearchPhonePromotion extends PosComponent {

        /**
         * onClick.
         *
         * Hàm sử lý hàm động click vào button
         *
         * Hàm gọi lại callback từ props thông qua onClickButton;
         *
         * @param {} ev
         */
        onClick(ev) {
            ev.preventDefault();
            this.props.onClickButton(ev);
        }
    }

    SearchPhonePromotion.template = 'SearchPhone'

    Registries.Component.add(SearchPhonePromotion)

    return SearchPhonePromotion

});
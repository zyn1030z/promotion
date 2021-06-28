odoo.define('ev_pos_promotion_total_price_buy_other_product.Promotion', function (require) {
    "use strict"
    const models = require('ev_pos_promotion.Promotion');
    const Promotion = models.Promotion;
    models.Promotion = Promotion.extend({
        // check xem sp có trong ct km ko
        isValidOrder: function (order, show) {
            let res = Promotion.prototype.isValidOrder.call(this, order, show);
            if (this.type !== 'total_price_buy_other_product') {
                return res;
            }
            // check in time
            let isValidTime = this.isValidTime()
            if (!isValidTime) {
                return res
            }
            // check partner for apply promotion
            let isValidPartner = this.isValidPartner(order)
            if (!isValidPartner) {
                return res
            }
            let [conditionAmount, applyProductIds] = this.getPromotionRequirementsOrderBuyOther();
            console.log(conditionAmount)
            let isValidOrderAmountBuyOther = this.isValidOrderAmountBuyOther(order, conditionAmount);
            let isValidProductApplyBuyOther = this.isValidProductApplyBuyOther(order, applyProductIds);
            if (!isValidOrderAmountBuyOther) {
                return false;
            }
            return (isValidProductApplyBuyOther);
            // return true;
        },
        revertAppliedOnOrder: function (order) {
            Promotion.prototype.revertAppliedOnOrder.call(this, order);
            if (this.type !== 'total_price_buy_other_product') {
                return;
            }
            // revert promotion applied quantity in condition order line
            let conditionOrderLine = this.getConditionOrderLineDiscountCondition(order)
            order.orderlines.filter(line => conditionOrderLine.includes(line.id)).forEach((line) => {
                // Fix when clear promotion;
                if (!line) return;
                line.promotion_applied_quantity = 0
            });

            let removeLines = order.orderlines.filter((line) => {
                if (!line.promotion_id) {
                    return;
                }
                let promotion_id = line.promotion_id;
                if (typeof promotion_id == 'object') {
                    promotion_id = promotion_id[0];
                }
                if (promotion_id != this.id) {
                    return;
                }
                return line;
            });
            removeLines.forEach((line) => {
                let product = line.product;
                let qty = line.quantity;
                order.remove_orderline(line);
                order.add_product(product, {
                    quantity: qty,
                });
            });
        },
        applyPromotionToOrder: function (order) {
            Promotion.prototype.applyPromotionToOrder.call(this, order);
            if (this.type != 'total_price_buy_other_product') {
                return;
            }
            if (!this.isValidOrder(order)) {
                return;
            }
            let self = this;
            let rules = this.db.getPromotionTotalPriceBuyOtherProductByPromotionIds([this.id]);
            rules.forEach((rule) => {
                if (rule.product_id) {
                    self.applyForProductBuyOther(order, rule);
                }
            });

        },
        applyForProductBuyOther: function (order, rule) {
            let self = this;
            order.orderlines.forEach((line) => {
                if (line.product.id != rule.product_id[0] || line.promotion_id) {
                    return;
                }
                self.applyWithTypeBuyOther(order, line, rule);
            })
        },
        applyWithTypeBuyOther: function (order, line, rule) {
            if (line.quantity < rule.qty) {
                return
            } else {
                line.set_quantity(line.quantity - rule.qty);
            }
            let product = this.db.get_product_by_id(rule.product_id[0]);
            let options = {
                discount: rule.discount,
                merge: false,
                quantity: rule.qty,
                extras: {
                    promotion_id: this.id
                }
            }
            order.add_product(product, options);

            // line.set_discount(rule.discount);
            // line.setPromotion(rule.promotion_id[0]);
        },

        isValidOrderAmountBuyOther: function (order, amount) {
            if (order.get_total_with_tax() < amount && amount != 0) {
                return false;
            }
            return true;
        },
        isValidProductApplyBuyOther: function (order, applyProductIds) {  //kiểm tra sản phẩm trên pos có trong điều kiện k
            let self = this;
            let orderApplyProductIds = [];
            order.orderlines.forEach((line) => {
                // Không tính các line đã được tính cho promotion khác
                // let promotionId = this.parsePromotionId(line.promotion_id);
                // if (promotionId && promotionId != self.id) {
                //     return;
                // }
                // kiểm tra sản phẩm được áp dụng trong đơn
                if (_.indexOf(applyProductIds, line.product.id) != -1) {
                    orderApplyProductIds.push(line.product.id);
                }
            })
            return orderApplyProductIds.length

        },
        getPromotionRequirementsOrderBuyOther: function () {
            let conditions =
                this.db.getPromotionTotalPriceBuyOtherProductByPromotionIds([this.id]);
            let applyProductIds = [];
            let total = 0;
            conditions.forEach((item) => {
                if (item.product_id)
                    applyProductIds.push(item.product_id[0]);
            });
            conditions.forEach((item) => {
                total = total > item.total_price ? total : item.total_price;
            });
            return [total, applyProductIds];
        },

        initFromJson: function (json) {
            Promotion.prototype.initFromJson(json);
            this.pos_promotion_total_price_buy_other_product_ids = json.pos_promotion_total_price_buy_other_product_ids;
        },

        exportToJson: function () {
            let json = Promotion.prototype.exportToJson();
            json.pos_promotion_total_price_buy_other_product_ids = this.pos_promotion_total_price_buy_other_product_ids;
            return json;
        }
    });
    return models;
});
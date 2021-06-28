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

            //kiểm tra số lượng sp
            let conditions =
                this.db.getPromotionTotalPriceBuyOtherProductByPromotionIds([this.id]);
            let arr = []
            conditions.forEach((condition) => {
                arr.push(condition.total_price)
                // this.CheckProductInPos(order, condition)
            });
            let test = [];
            arr.forEach((ar) => {
                if (order.get_total_with_tax() > ar) {
                    test = [];
                    test.push(ar)
                }
            });
            let checkQtyProduct;
            let arr_checkQtyProduct = [];//kiểm tra nế sp gộp thì k hiện chương trình khuyến mại
            conditions.forEach((condition) => {
                if (condition.total_price === test[0]) {
                    checkQtyProduct = this.checkQtyProduct(order, condition);
                    arr_checkQtyProduct.push(checkQtyProduct)
                }
            });
            let flag_check;
            if (_.indexOf(arr_checkQtyProduct, 1) !== -1) {
                flag_check = true
            }
            // let checkQtyProduct = this.checkQtyProduct(order);
            let isValidOrderAmountBuyOther = this.isValidOrderAmountBuyOther(order, conditionAmount);
            let applyProductIdsCurrentAmount = this.isValidProductApplyBuyOtherWithCurrentAmount(order, applyProductIds);
            let isValidProductApplyBuyOther = this.isValidProductApplyBuyOther(order, applyProductIdsCurrentAmount);
            if (!isValidOrderAmountBuyOther || !flag_check) {
                return false;
            }
            return (isValidProductApplyBuyOther);
            // return true;
        },
        isValidProductApplyBuyOtherWithCurrentAmount(order, applyProductIds) {
            let applyProductIdsCurrentAmount = [];
            let total_in_pos = order.get_total_with_tax();
            let conditions =
                this.db.getPromotionTotalPriceBuyOtherProductByPromotionIds([this.id]);
            conditions.forEach((item) => {
                if (item.total_price < total_in_pos) {
                    applyProductIdsCurrentAmount.push(item.product_id[0])
                }
            })
            return applyProductIdsCurrentAmount
        },
        isValidProductApplyBuyOther: function (order, applyProductIdsCurrentAmount) {  //kiểm tra sản phẩm trên pos có trong điều kiện k
            let orderApplyProductIds = [];
            order.orderlines.forEach((line) => {
                // Không tính các line đã được tính cho promotion khác
                // let promotionId = this.parsePromotionId(line.promotion_id);
                // if (promotionId && promotionId != self.id) {
                //     return;
                // }
                // kiểm tra sản phẩm được áp dụng trong đơn
                if (_.indexOf(applyProductIdsCurrentAmount, line.product.id) !== -1) {
                    orderApplyProductIds.push(line.product.id);
                }
            })
            return orderApplyProductIds.length

        },
        isValidOrderAmountBuyOther: function (order, amounts) {
            var lowest = Number.POSITIVE_INFINITY;
            var tmp;
            amounts.forEach((amount) => {
                tmp = amount
                if (tmp < lowest) lowest = tmp;
            });
            if (order.get_total_with_tax() < lowest && lowest !== 0) {
                return false;
            }
            return true
        },
        applyPromotionToOrder: function (order) {
            Promotion.prototype.applyPromotionToOrder.call(this, order);
            if (this.type !== 'total_price_buy_other_product') {
                return;
            }
            if (!this.isValidOrder(order)) {
                return;
            }
            let self = this;
            let rules = this.db.getPromotionTotalPriceBuyOtherProductByPromotionIds([this.id]);
            let arr = []
            var total_before = order.get_total_with_tax();
            rules.forEach((rule) => {
                if (total_before > rule.total_price) {
                    arr.push(rule.total_price);
                    // self.applyForProductBuyOther(order, rule);
                }
            });
            let test = [];
            arr.forEach((ar) => {
                if (order.get_total_with_tax() > ar) {
                    test = [];
                    test.push(ar)
                }
            });
            rules.forEach((rule) => {
                if (rule.total_price === test[0]) {
                    this.applyForProductBuyOther(order, rule)
                }
            })

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
            } else if (line.quantity === rule.qty) {
                if (rule.price_unit) {
                    let product = this.db.get_product_by_id(rule.product_id[0]);
                    let price_before = line.price - rule.price_unit;
                    // line.set_unit_price(price_before)
                    let options = {
                        price: rule.price_unit * -1,
                        quantity: 1,
                        merge: false,
                        extras: {
                            promotion_id: this.id
                        }
                    }
                    order.add_product(product, options);

                } else {
                    line.set_discount(rule.discount);
                }
                // line.set_discount(rule.discount);
                line.setPromotion(rule.promotion_id[0]);
                return;
            } else {
                // line.set_quantity(line.quantity - rule.qty);
                line.set_quantity(line.quantity);
            }
            let product = this.db.get_product_by_id(rule.product_id[0]);
            let price_before = line.price - rule.price_unit;
            let options;
            if (rule.price_unit) {
                options = {
                    price: rule.price_unit * -1,
                    merge: false,
                    quantity: rule.qty,
                    extras: {
                        promotion_id: this.id
                    }
                }
            } else {
                options = {
                    discount: rule.discount,
                    merge: false,
                    quantity: rule.qty,
                    extras: {
                        promotion_id: this.id
                    }
                }
            }
            // let options = {
            //     discount: rule.discount,
            //     merge: false,
            //     quantity: rule.qty,
            //     extras: {
            //         promotion_id: this.id
            //     }
            // }
            order.add_product(product, options);

            // line.set_discount(rule.discount);
            // line.setPromotion(rule.promotion_id[0]);
        },
        checkQtyProduct: function (order, condition) {
            // let rules = this.db.getPromotionTotalPriceBuyOtherProductByPromotionIds([this.id]);
            // let arr_product_conditions = [];
            // let checkQty = [];
            // rules.forEach((rule) => {
            //     arr_product_conditions.push(rule.product_id[0])
            // });
            // order.orderlines.forEach((line) => {
            //     if (_.indexOf(arr_product_conditions, line.product.id) !== -1) {
            //         rules.forEach((rule) => {
            //             if (line.quantity >= rule.qty) {
            //                 // console.log('line.quantity', line.quantity);
            //                 // console.log('rule.qty', rule.qty);
            //                 checkQty.push(line.quantity)
            //             }
            //         });
            //     }
            // });
            // return checkQty.length
            let product_in_condition = [];
            let product_in_pos = [];
            condition.product_id.forEach((pr) => {
                product_in_condition.push(pr)
            });
            order.orderlines.forEach((line) => {
                product_in_pos.push(line.product.id)
            });
            let arr = [];
            // product_in_pos.forEach((item) => {
            //     if (_.indexOf(product_in_condition, item) !== -1) {
            //
            //         arr.push(item)
            //     }
            // });
            order.orderlines.forEach((line) => {
                if (_.indexOf(product_in_condition, line.product.id) !== -1 && line.quantity >= condition.qty) {
                    arr.push(line.product.id)
                }
            });
            return arr.length

        },
        getPromotionRequirementsOrderBuyOther: function () {
            let conditions =
                this.db.getPromotionTotalPriceBuyOtherProductByPromotionIds([this.id]);
            let applyProductIds = [];
            let total = [];
            conditions.forEach((item) => {
                if (item.product_id)
                    applyProductIds.push(item.product_id[0]);
            });
            conditions.forEach((item) => {
                if (_.indexOf(total, item.total_price) === -1) {
                    total.push(item.total_price)
                }
            });
            return [total, applyProductIds];
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
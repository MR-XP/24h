<?php

namespace app\v2\model;

use app\common\component\Code;
use think\Db;

class CouponUser extends \app\common\model\CouponUser {

    public function getList($mchId, $userId, $params, $search = ['order' => 'expire_time asc']) {
        $where = [
            'mch_id'  => $mchId,
            'user_id' => $userId
        ];
        $where['expire_time'] = ['gt', get_now_time('Y-m-d H:i:s')];
        $where['status'] = self::STATUS_UNUSED;
        return $this->where($where)->select();
    }

    /**
     * 获取订单可以使用的优惠券
     * @param type $order
     * @return type
     */
    public function getListByOrder($order) {
        if (in_array($order['type'], [Order::TYPE_BUY_CARD, Order::TYPE_BUY_GROUP_COURSE, Order::TYPE_BUY_PRIVATE_COURSE])) { //购卡，课才可以使用优惠券
            $where = [
                'order_id' => $order['order_id'],
                'status' => self::STATUS_USED,
            ];
            if ($this->where($where)->count() > 0) {
                return []; //使用过优惠券就不列出了
            }
            $where = [
                'mch_id'    => $order['mch_id'],
                'user_id'   => $order['user_id'],
                'status'    => self::STATUS_UNUSED
            ];
            $res = $this->where($where)
                        ->order('expire_time desc')
                        ->select();

            //遍历是否可以使用
            foreach($res as $val){

                $val['can_use']         = 1;
                $val['can_not_text']    = '';
                //不可使用和原因
                if(strtotime($val['expire_time']) < time()){
                    $val['can_use'] = 0;
                    $val['can_not_text'] = '优惠劵已过期';
                }

                if($val['type'] == self::TYPE_CASH && $val['discount_value'] >= $order['price']){
                    $val['can_use'] = 0;
                    $val['can_not_text'] = '优惠劵金额大于或等同于商品价格，无法使用';
                }

                if($val['use_type'] != 0 && $val['use_type'] != $order['type']){
                    $val['can_use'] = 0;
                    switch ($val['use_type']){
                        case 1:
                            $val['can_not_text'] = '该优惠券只能用于会员卡抵扣';
                            break;
                        case 2:
                            $val['can_not_text'] = '该优惠券只能用于小团课抵扣';
                            break;
                        case 3:
                            $val['can_not_text'] = '该优惠券只能用于私教课抵扣';
                            break;
                    }
                }
            }

            return $res;

        } else {
            return [];
        }
    }

    /**
     * 使用优惠券更改订单
     * @param type $order
     * @param type $couponUserId
     */
    public function changeOrder($order, $couponUserId) {
        $coupon = $this->where([
                        'coupon_user_id' => $couponUserId,
                        'user_id' => $order['user_id'],
                        'status' => self::STATUS_UNUSED,
                    ])->find();
        if ($coupon) {

            if ($this->where(['order_id' => $order['order_id'], 'status' => self::STATUS_USED])->count() > 0) {
                return error(Code::VALIDATE_ERROR, '该订单已经使用过优惠券，无法再使用优惠券');
            }
            if (strtotime($coupon['expire_time']) < get_now_time()) {
                return error(Code::VALIDATE_ERROR, '该优惠券已过期');
            }
            if($coupon['type'] == self::TYPE_CASH && $coupon['discount_value'] >= $order['price']){
                return error(Code::VALIDATE_ERROR, '优惠劵金额大于或等同于商品价格，无法使用');
            }

            if($coupon['use_type'] != 0 && $coupon['use_type'] != $order['type']){
                switch ($coupon['use_type']){
                    case 1:
                        return error(Code::VALIDATE_ERROR, '该优惠券只能用于会员卡抵扣');
                        break;
                    case 2:
                        return error(Code::VALIDATE_ERROR, '该优惠券只能用于小团课抵扣');
                        break;
                    case 3:
                        return error(Code::VALIDATE_ERROR, '该优惠券只能用于私教课抵扣');
                        break;
                }
            }

            Db::startTrans();
            try {
                $coupon['order_id'] = $order['order_id'];
                $coupon['status'] = self::STATUS_USED;
                $result = $coupon->save();
                if ($result === false) {
                    Db::rollback();
                    return error(Code::SAVE_DATA_ERROR);
                }
                if ($coupon['type'] == Coupon::TYPE_DISCOUNT) { //打折
                    $order['price'] = $order['price'] * $coupon['discount_value'];
                } elseif ($coupon['type'] == Coupon::TYPE_CASH) { //直减现金
                    $order['price'] = $order['price'] - $coupon['discount_value'];
                }
                $order['discount_price'] = $order['sale_price'] - $order['price'];
                $result = $order->save();
                if ($result === false) {
                    Db::rollback();
                    return error(Code::SAVE_DATA_ERROR);
                }
                Db::commit();
                return success($order);
            } catch (\Exception $e) {
                Db::rollback();
                return error(Code::SAVE_DATA_ERROR);
            }
        }
        return success($order);
    }

}

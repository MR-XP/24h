<?php

namespace app\v2\controller;

use app\v2\validate;
use app\v2\model;
use app\common\component\Code;
use app\v2\model\OrderModel;
use app\v2\model\MemberCardModel;
use app\v2\model\CardModel;

class Order extends Base {

    /*
     * 列表
     */
    public function getList() {
        $model = new model\Order();
        $data = $this->request->param();
        $data['user_id'] = $this->user['user_id'];
        $pageNo = input('page_no', 1);
        $pageSize = input('page_size', $this->pageSize);
        return $model->getList($this->merchant['mch_id'], $data, $pageNo, $pageSize);
    }

    /**
     * 统一下单
     * @return type
     */
    public function createOrder() {
        $model = new model\Order();
        $validate = new validate\Order();
        $data = $this->request->param();
        $data['mch_id'] = $this->merchant['mch_id'];
        $data['user_id'] = $this->user['user_id'];
        if (!$validate->check($data)) {
            return error(Code::VALIDATE_ERROR, $validate->getError());
        }
        return $model->createOrder($data);
    }

    /**
     * 订单详情
     */
    public function detail() {
        $orderId = $this->request->param('order_id', 0);
        $payStatus = $this->request->param('pay_status', 0);
        $status = $this->request->param('status', 1);
        $where = ['order_id' => $orderId, 'pay_status' => $payStatus, 'status' => $status];
        $order = model\Order::get($where);
        if ($order) {
            //剩余豆豆
            $order['pre_paid'] = model\Member::where(['member_id' => $this->member['member_id']])->value('pre_paid');
            //可以使用的优惠劵
            $order['send_coupon'] = (new model\Coupon())->getSendCoupon($order);
            //可以使用的优惠劵
            $order['use_coupon'] = (new model\CouponUser())->getListByOrder($order);
            if ($order['type'] == model\Order::TYPE_BUY_CARD) { //购卡
                $order['image'] = model\Card::where(['card_id' => $order['product_id']])->value('image');
            } elseif ($order['type'] == model\Order::TYPE_BUY_GROUP_COURSE || $order['type'] == model\Order::TYPE_BUY_PRIVATE_COURSE) { //购课
                $order['image'] = model\Course::where(['course_id' => $order['product_id']])->value('cover');
            }
            return success($order);
        } else {
            return error(Code::VALIDATE_ERROR, '未找到订单信息');
        }
    }

    /*
     * 订单详情产品内容加载
     */
    public function loadProduct(){
        $orderId = input('order_id');
        if(empty($orderId)){
            return error(Code::VALIDATE_ERROR,'您未提交订单ID');
        }
        $model = new model\Order();
        return success($model->loadProduct($this->merchant['mch_id'],['order_id' => $orderId]));
    }

    /**
     * 取消订单
     */
    public function cancel() {
        $orderId = input('order_id');
        $model = new model\Order();
        return $model->cancelOrder($this->merchant['mch_id'], $this->user['user_id'], $orderId);
    }

    /**
     * 支付订单
     */
    public function pay() {
        $orderId = input('order_id', 0);
        $couponUserId = input('coupon_user_id', 0);
        $payType = input('pay_type');
        $usePrePaid = input('use_pre_paid', 0);
        $orderModel = new model\Order();
        return $orderModel->pay($this->merchant, $this->member, $orderId, $payType, $couponUserId, $usePrePaid);
    }

    public function orderPay() {
        $order_id = input('post.order_id');
        $pay_type = input('post.pay_type');
        if (!$order_id || !$pay_type) {
            return error(0, '参数错误');
        }
        $Pay = new Pay();
        //微信支付
        if ($pay_type == 'WXPAY') {
            $log = \app\common\model\PrePaid::get(['order_id' => $order_id]);
            $pre_paid = 0;
            if ($log) {
                $pre_paid = abs($log['num']);
            }
            $result = $Pay->wxpay($order_id, $this->member['open_id'], $pre_paid);
//            $result = $Pay->wxpay($order_id, $this->member['open_id'], 0);
            if ($result['code'] != Code::SUCCESS) {
                return error(0, $result['message']);
            }
            return success($result['data']);
        }
        //支付宝支付
        if ($pay_type == 'ALIPAY') {
            $log = \app\common\model\PrePaid::get(['order_id' => $order_id]);
            $pre_paid = 0;
            if ($log) {
                $pre_paid = abs($log['num']);
            }
            $result = $Pay->alipay($order_id);
            if ($result['code'] == Code::SUCCESS) {
                return success($result['data']);
            }
        }
        //豆豆支付
        if ($pay_type == 'SITEPAY') {
            $result = (new \app\common\payment\SitePay())->doPay($order_id);
            if ($result['code'] != Code::SUCCESS) {
                return error(0, $result['message']);
            }
            return error(10028, '支付成功');
        }

        //组合支付
        if ($pay_type == 'GROUPPAY') {
            //豆满足订单
            $order = \app\common\model\Order::get($order_id);
            $member = \app\common\model\Member::get(['user_id' => $this->user['user_id']]);
            if ($member['pre_paid'] >= $order['price']) {
                $result = (new \app\common\payment\SitePay())->doPay($order_id);
                if ($result['code'] != Code::SUCCESS) {
                    return error(0, $result['message']);
                }
                return error(10028, '支付成功');
            } else {
                $log = \app\common\model\PrePaid::get(['order_id' => $order_id]);
                if (!$log) {
                    $log = ['mch_id' => $this->merchant['mch_id'],
                        'note' => '支付',
                        'num' => -$member['pre_paid'],
                        'user_id' => $this->user['user_id'],
                        'order_id' => $order_id,
                        'create_time' => get_now_time('Y-m-d H:i:s'),
                    ];
                    $log_id = (new \app\common\model\PrePaid())->insertGetId($log);
                    if (!$log_id) {
                        return error(0, '支付信息出错');
                    }
                    //减豆
                    $res = (new \app\common\model\Member())->where(['user_id' => $this->user['user_id']])->setDec('pre_paid', abs($log['num']));
                    if ($res === false) {
                        return error(0, '支付信息出错');
                    }
                }
                //唤起微信支付
                $result = $Pay->wxpay($order_id, $this->member['open_id'], abs($log['num']));
                if ($result['code'] == Code::SUCCESS) {
                    return success($result['data']);
                }
            }
        }
    }

    public function OrderCancel() {
        $order_id = input('post.order_id');
        if (!$order_id) {
            return error(0, '参数错误');
        }
        $Order = new OrderModel();
        $result = $Order->order_cancel($order_id, $this->user['user_id']);
        if ($result['code'] != Code::SUCCESS) {
            return error(0, $result['message']);
        }
        return success('已取消');
    }
    /**
     * 赠送金豆
     * @return type
     */
/*    public function givePaid() {
        $model = new model\Order();
        $validate = new validate\Order();
        $data = $this->request->param();
        $data['mch_id'] = $this->merchant['mch_id'];
        $data['user_id'] = $this->user['user_id'];
        $data['type']=model\Order::TYPE_GIVE_PAID;
        if (!$validate->check($data)) {
            return error(Code::VALIDATE_ERROR, $validate->getError());
        }

        return $model->givePaid($data);
    }*/
}

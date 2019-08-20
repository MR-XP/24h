<?php

namespace app\common\model;

use think\Db;
use app\common\component\Code;

class Order extends Base {

    protected $table = 'sys_order';
    protected $insert = ['status' => 1, 'create_time', 'update_time' => '0000-00-00 00:00:00'];
    protected $update = ['update_time'];

    const CASH = 'CASH';
    const WXPAY = 'WXPAY';
    const ALIPAY = 'ALIPAY';
    const SITEPAY = 'SITEPAY';
    const TYPE_BUY_CARD = 1;
    const TYPE_BUY_GROUP_COURSE = 2;
    const TYPE_BUY_PRIVATE_COURSE = 3;
    const TYPE_BUY_PRE_PAID = 4;
    const TYPE_CANCEL_APPOINTMENT = 5;
    const TYPE_ADD_CARD_USER = 6;
    const TYPE_GIVE_PAID = 7;

    const PAY_STATUS_WAIT = 0;
    const PAY_STATUS_COMPLETED = 1;
    const PAY_STATUS_REFUND = 2;
    const PAY_ABOLISH_ABSENTEEISM=20;   //取消旷课价格
    const PAY_ADD_USER=40;              //增加成员价格，百分比计算
    
    const GIVE_PAID=2;//赠送金豆个数

    protected $_payType = [
        'CASH' => '现金',
        'WXPAY' => '微信支付',
        'ALIPAY' => '支付宝',
        'SITEPAY' => '豆豆支付',
    ];
    protected $_type = [
        1 => '会员卡',
        2 => '小团课',
        3 => '私教课',
        4 => '储值',
        5 => '取消旷课',
        6 => '添加成员'
    ];
    protected $_payStatus = [
        0 => '未支付',
        1 => '已支付',
        2 => '已退款'
    ];

    public function setCreateTimeAttr($value) {
        return get_now_time('Y-m-d H:i:s');
    }

    public function setUpdateTimeAttr($value) {
        return get_now_time('Y-m-d H:i:s');
    }

    public function getPayTypeTextAttr($value, $data) {
        return get_format_state($data['pay_type'], $this->_payType);
    }

    public function getTypeTextAttr($value, $data) {
        return get_format_state($data['type'], $this->_type);
    }

    public function getPayStatusTextAttr($value, $data) {
        return get_format_state($data['pay_status'], $this->_payStatus);
    }

    public function getPayType() {
        return $this->_payType;
    }

    /**
     * 支付成功，保存订单，
     * @param type $orderId
     * @param type $payType
     * @return boolean
     */
    public function paySuccess($order, $payType) {
        $order['pay_type'] = $payType;
        $data = [
            'transaction_id' => $order['transaction_id'],
            'order_id' => $order['order_id'],
            'pay_type' => $payType,
            'pay_status' => self::PAY_STATUS_COMPLETED,
            'pay_time' => get_now_time('Y-m-d H:i:s'),
        ];

        $re = $this->where(['order_id' => $order['order_id']])->update($data);
        if ($re !== false) {
            //此处进行订单后续操作
            if ($this->validateProduct($order)) { //验证订单关联的产品
                switch ($order['type']) {
                    case self::TYPE_BUY_CARD://购卡
                        $result = (new SoldCard())->buyCard($order);
                        break;
                    case self::TYPE_BUY_GROUP_COURSE://购小团课
                        $result = (new SoldCourse())->buyCourse($order);
                        break;
                    case self::TYPE_BUY_PRIVATE_COURSE://购私教课
                        $result = (new SoldCourse())->buyCourse($order);
                        break;
                    case self::TYPE_BUY_PRE_PAID://储值
                        $result = (new Member())->buyPrePaid($order);
                        break;
                    case self::TYPE_CANCEL_APPOINTMENT://取消旷课
                        $result = (new Appointment())->cancelByOrder($order);
                        break;
                    case self::TYPE_ADD_CARD_USER://增加成员
                        $result = (new SoldCard())->addUser($order);
                        break;
                    default:
                        $result = error(Code::UNKNOWN_ORDER_TYPE);
                        break;
                }
            } else {
                $result = error(Code::UNKNOWN_ORDER_PRODUCT);
            }
            //如果处理出错，需要人工处理，保存备注
            if ($result['code'] != Code::SUCCESS) {
                $this->isUpdate(true)->save(['order_id' => $order['order_id'], 'note' => $result['message']]);
            }
            return $result;
        } else {
            return error(Code::VALIDATE_ERROR, '订单异常');
        }
    }

    /**
     * 验证订单关联的商品
     * @param type $order
     * @return boolean
     */
    public function validateProduct($order) {
        if($order['pay_type']== self::CASH){ //代购不验证
            return true;
        }
        if ($order['type'] == self::TYPE_BUY_CARD) {
            $card = Card::get(['card_id' => $order['product_id'], 'status' => Card::STATUS_ENABLE]);
            if (!$card) {
                return false;
            }
        } elseif ($order['type'] == self::TYPE_BUY_PRIVATE_COURSE || $order['type'] == self::TYPE_BUY_GROUP_COURSE) {
            $course = Course::get(['course_id' => $order['product_id'], 'status' => Course::STATUS_ENABLE]);
            if (!$course) {
                return false;
            }
        } elseif ($order['type'] == self::TYPE_CANCEL_APPOINTMENT) {
            $appointment = Appointment::get([
                        'appointment_id' => $order['product_id'],
                        'user_id' => $order['user_id'],
                        'status' => self::STATUS_ENABLE,
//                        'sign' => 0,
                        'start_time' => ['lt', get_now_time('Y-m-d H:i:s')],
//                        'plan_type' => Course::TYPE_PUBLIC, //公共课
            ]);
            if (!$appointment) {
                return false;
            }
        }
        return true;
    }

    //获取要送的优惠券
    public function getSendCoupon($order) {
        $model = new Coupon();
        $coupon = $model->getSendCoupon($order);
        if ($coupon) { //有优惠券
            $count = CouponUser::where(['order_id' => $order['order_id']])->count(); //使用了优惠券的订单，不发放优惠券
            if ($count == 0) {
                return $coupon;
            }
        }
        return null;
    }

}

<?php

namespace app\v2\model;

use app\common\component\Code;
use app\common\model\SoldCard;
use app\manager\validate\Merchant;
use think\Db;

class Order extends \app\common\model\Order {

    /**
     * 统一下单
     * @param type $data
     * @return type
     */
    public function createOrder($data) {
        $data['transaction_id'] = '';
        $data['trade_no'] = generate_number_order();
        $data['create_by'] = $data['user_id'];
        if ($data['type'] == self::TYPE_BUY_CARD) { //购卡

            $product = Card::get($data['product_id']);
            $data['product_info'] = $product['card_name'];
            $data['price'] = $product['price'];
            $data['sale_price'] = $product['price'];
            $data['origin_price'] = $product['origin_price'];
        } elseif ($data['type'] == self::TYPE_BUY_GROUP_COURSE || $data['type'] == self::TYPE_BUY_PRIVATE_COURSE) { //购课
            $product = Course::get($data['product_id']);
            if ($data['product_num'] < $product['min_buy'] && $product['min_buy'] != 0) {
                return error(Code::VALIDATE_ERROR, '该课程至少购买' . $product['min_buy'] . '节');
            }
            if ($product['max_buy'] != 0) {
                $buyNum = self::where(['user_id' => $data['user_id'],
                            'type' => ['in', [self::TYPE_BUY_PRIVATE_COURSE, self::TYPE_BUY_GROUP_COURSE]],
                            'product_id' => $data['product_id'],
                            'status' => self::STATUS_ENABLE]
                        )->sum('product_num');
                if ($buyNum + $data['product_num'] > $product['max_buy']) {
                    if ($buyNum > 0) {
                        return error(Code::VALIDATE_ERROR, '该课程最多购买' . $product['max_buy'] . '节,你已经购买过' . $buyNum . '节');
                    } else {
                        return error(Code::VALIDATE_ERROR, '该课程最多购买' . $product['max_buy'] . '节');
                    }
                }
            }
            $data['product_info'] = $product['course_name'] . '*' . $data['product_num'] . ' 节';
            $data['price'] = $product['price'] * $data['product_num'];
            $data['sale_price'] = $product['price'] * $data['product_num'];
            $data['origin_price'] = $product['origin_price'] * $data['product_num'];
            $data['seller_id'] = $product['coach_user_id'];
        } elseif ($data['type'] == self::TYPE_BUY_PRE_PAID) { //储值
            $data['product_info'] = '储值 ' . $data['origin_price'];
            $data['price'] = $data['origin_price'];
            $data['sale_price'] = $data['origin_price'];
        } elseif ($data['type'] == self::TYPE_CANCEL_APPOINTMENT) {//取消旷课
                $appointment = new Appointment();
                $product = $appointment->getCourseById($data['product_id']);
                if (!$product) {
                    return error('0', '未查询到该课程信息');
                }
                $data['product_info'] = '清除旷课记录';
                $data['sale_price'] = \app\common\model\Order::PAY_ABOLISH_ABSENTEEISM;
                $data['origin_price'] = \app\common\model\Order::PAY_ABOLISH_ABSENTEEISM;
                $data['price'] = \app\common\model\Order::PAY_ABOLISH_ABSENTEEISM;

        }elseif($data['type'] == self::TYPE_ADD_CARD_USER){//成员添加

            $product = SoldCard::get($data['product_id']);
            $data['product_info'] = $product['card_name']."-添加成员1名";
            
            if(empty($product['price']) || $product['price'] == 0 || $product['price'] < 2){     //没有价格，默认为600元
                $data['price']          = 600;
                $data['sale_price']     = 600;
                $data['origin_price']   = 600;
            }else{
                $data['price'] = round(($product['price'] * self::PAY_ADD_USER) / 100,0);        //计算百分比
                $data['sale_price'] = round(($product['price'] * self::PAY_ADD_USER) / 100,0);
                $data['origin_price'] = round(($product['price'] * self::PAY_ADD_USER) / 100,0);
            }

        } else {
            return error(Code::UNKNOWN_ORDER_TYPE);
        }
        $result = $this->allowField(true)->data($data, true)->save();

        if ($result === false) {
            return error(Code::SAVE_DATA_ERROR);
        } else {
            return success($this);
        }
    }

    /**
     * 订单详情产品内容加载
     * @param type $mchId
     * @param type $userId
     * @param type $data
     */
    public function loadProduct($mchId,$params){
        //订单查询
        $where = ['mch_id'  =>  $mchId,'order_id'   =>  $params['order_id']];
        $order = self::get($where);
        if($order['status'] != self::STATUS_ENABLE){
            return error(Code::VALIDATE_ERROR,'订单已被取消');
        }

        $data = [];
        $data['product_num'] = $order['product_num'];
        //会员卡加载
        if($order['type'] == 1){
            $data['card'] = Card::get(['card_id' => $order['product_id']]);
        }
        //课程加载
        if($order['type'] == 2 || $order['type'] == 3){
            $course = Course::get(['course_id' => $order['product_id']]);
            $coach  = Coach::get(['user_id' => $course['coach_user_id']]);
            $user   = User::where(['user_id' => $course['coach_user_id']])->field("nick_name,real_name,phone,sex")->find();
            $data['coach'] = $coach;
            $data['user'] = $user;
        }

        return $data;
    }


    /**
     * 取消订单
     * @param type $mchId
     * @param type $userId
     * @param type $orderId
     */
    public function cancelOrder($mchId, $userId, $orderId) {
        $order = $this->where([
                    'mch_id' => $mchId,
                    'user_id' => $userId,
                    'order_id' => $orderId,
                    'status' => self::STATUS_ENABLE,
                    'pay_status' => self::PAY_STATUS_WAIT,
                ])->find();
        if ($order) {
            Db::startTrans();
            try {
                $order['status'] = self::STATUS_DISABLE;
                $result = $order->save();
                if ($result === false) {
                    Db::rollback();
                    return error(Code::SAVE_DATA_ERROR);
                }
                //是否有金豆退还
                $prepaid = PrePaid::get(['order_id' => $order['order_id'], 'num' => ['lt', 0]]);
                if ($prepaid) {
                    $result = (new Member())->where("mch_id=$mchId and user_id=$userId")->update(['pre_paid' => ['exp', 'pre_paid+' . abs($prepaid['num'])]]);
                    if ($result === false) {
                        Db::rollback();
                        return error(Code::SAVE_DATA_ERROR);
                    }
                    $result = $prepaid->delete();
                    if ($result === false) {
                        Db::rollback();
                        return error(Code::SAVE_DATA_ERROR);
                    }
                }
                //是否有优惠券退还
                $coupon = CouponUser::get(['order_id' => $orderId, 'status' => CouponUser::STATUS_USED, 'user_id' => $userId]);
                if ($coupon) {
                    $coupon['order_id'] = 0;
                    $coupon['status'] = CouponUser::STATUS_UNUSED;
                    $result = $coupon->save();
                    if ($result === false) {
                        Db::rollback();
                        return error(Code::SAVE_DATA_ERROR);
                    }
                }
                Db::commit();
                return success($order);
            } catch (\Exception $e) {
                Db::rollback();
                return error(Code::SAVE_DATA_ERROR);
            }
        } else {
            return error(Code::VALIDATE_ERROR, '未找到该订单');
        }
    }

    //获取列表
    public function getList($mchId, $params, $pageNo, $pageSize, $search = ['order' => 'create_time desc']) {
        $where = ['mch_id' => $mchId, 'user_id' => $params['user_id'], 'type' => ['<>', self::TYPE_BUY_PRE_PAID]];
        $where['status'] = self::STATUS_ENABLE;
        isset($params['pay_status']) && $where['pay_status'] = $params['pay_status'];
        $totalResults = $this->where($where)->count();
        $totalPages = ceil($totalResults / $pageSize);
        $list = $this->where($where)->page($pageNo, $pageSize)->order($search['order'])->select();
        foreach ($list as &$value) {
            if ($value['type'] == self::TYPE_BUY_CARD) { //购卡
                $product = Card::get($value['product_id']);
                $value['image'] = $product['image'];
            } elseif ($value['type'] == self::TYPE_BUY_GROUP_COURSE || $value['type'] == self::TYPE_BUY_PRIVATE_COURSE) { //购课
                $product = Course::get($value['product_id']);
                $value['image'] = $product['cover'];
            }
            $value['coupon'] = CouponUser::where(['order_id' => $value['order_id'], 'status' => CouponUser::STATUS_USED])->find();
            $value['pre_paid'] = PrePaid::where(['order_id' => $value['order_id'], 'num' => ['lt', 0]])->value('abs(num)');
        }
        return page_result($list, $pageNo, $pageSize, $totalResults, $totalPages);
    }

    //支付
    public function pay($merchant, $member, $orderId, $payType, $couponUserId, $usePrePaid) {
        $order = $this->where(['mch_id' => $merchant['mch_id'],
                    'user_id' => $member['user_id'],
                    'order_id' => $orderId,
                    'status' => self::STATUS_ENABLE,
                    'pay_status' => self::PAY_STATUS_WAIT])->find();
        if (!$order) {
            return error(Code::VALIDATE_ERROR, '未找到订单信息');
        }
        if (!$this->validateProduct($order)) { //订单的商品是否还有效
            return error(Code::UNKNOWN_ORDER_PRODUCT);
        }
        $result = (new CouponUser())->changeOrder($order, $couponUserId); //使用优惠券
        if ($result['code'] != Code::SUCCESS) {
            return $result;
        }
        $order = $result['data'];
        $prePaid = PrePaid::where(['order_id' => $order['order_id'], 'num' => ['lt', 0]])->value('num');
        $prePaid = $prePaid ? abs($prePaid) : 0;
        if ($usePrePaid == true && $payType != self::SITEPAY && $prePaid == 0) {//勾选了金豆
            $prePaid = Member::where(['user_id' => $member['user_id'], 'mch_id' => $order['mch_id']])->value('pre_paid');
            if ($prePaid >= $order['price']) { //勾选了金豆，金豆又足够的情况下，直接支付。
                $payType = self::SITEPAY;
            }
            if ($payType != self::SITEPAY && $prePaid > 0) { //先减金豆
                $result = (new Member())->clearPrePaid($order);
                if ($result['code'] != Code::SUCCESS) {
                    return $result;
                } else {
                    $prePaid = $result['data']; //实际减掉的金豆
                }
            }
        }

        if ($payType == self::WXPAY) {//微信支付
            return $this->wxPay($merchant, $member, $order, $prePaid);
        } elseif ($payType == self::SITEPAY) { //金豆支付
            return $this->sitePay($order);
        } else {
            return error(Code::VALIDATE_ERROR, '错误的支付类型');
        }
    }

    public function wxPay($merchant, $member, $order, $prePaid) {
        $request = \think\Request::instance();
        $wxpay = \app\common\payment\WxPay::instance([
                    'app_id' => $merchant->detail->wx_pay_app_id,
                    'secret' => $merchant->app_secret,
                    'wx_mch_id' => $merchant->detail->wx_pay_mch_id,
                    'app_key' => $merchant->detail->wx_pay_app_key,
        ]);
        $notifyUrl = $request->domain() . "/index/payment/wxnotify";
        $result = $wxpay->unifiedOrder($order, $prePaid, $member['open_id'], $notifyUrl);
        if ($result['code'] != Code::SUCCESS) {
            return error(Code::VALIDATE_ERROR, '支付参数生成失败');
        }
        $jsParams = $wxpay->buildJsApiParameters($result['data']);
        //成功时要送的优惠券
        $sendCoupon = $this->getSendCoupon($order);
        return success(['need_pay' => true, 'send_coupon' => $sendCoupon, 'params' => $jsParams]);
    }

    public function sitePay($order) {
        $model = new \app\common\payment\SitePay();
        return $model->doPay($order);
    }

    //教练售出多少节课
    public function orderCount($userId, $mchId) {
        $where = [];
        $where['b.coach_user_id'] = $userId;
        $where['b.mch_id'] = $mchId;
        $where['a.pay_status'] = self::PAY_STATUS_COMPLETED;
        $count = $this->alias('a')->join('mch_course b', 'a.product_id=b.course_id')->where($where)->count();
        return $count;
    }
    protected function getExpireDay($data) {
        if ($data['active'] == 0) {
            return $data['days'];
        }
        return ceil((strtotime($data['expire_time']) - get_now_time()) / 86400);
    }
    /**赠送金豆
     * @param $data
     * @return array
     */
/*    public function givePaid($data) {
        $shop['mch_id']=1;
        $member['user_id']=4;
                                        
//        Db::startTrans();
//        try{
            $cardModel = new SoldCard();
            $model=new Card();
            $orderModel=new Order();
            $createOrder=$orderModel->where('user_id',$member['user_id'])->where('type',\app\v1\model\Order::TYPE_GIVE_PAID)->order('create_time','desc')->find();
            $result = $cardModel->getDefaultCard($shop['mch_id'], $member['user_id']); //获取可用会员卡
            $card = $result['data'];
            $beanType=$model->where('card_id',$card['card_id'])->value('bean_type');
            if($beanType==1 && date('Y-m-d',strtotime($createOrder['create_time']))!=date('Y-m-d')){//赠送金豆
//                $orderModel=new Order();
                //生成订单2
                $order=$orderModel->data([
                    'mch_id' => $shop['mch_id'],
                    'user_id' => $member['user_id'],
                    'type'=>Order::TYPE_GIVE_PAID,
                    'transaction_id'=>'',
                    'trade_no'=>generate_number_order(),
                    'create_by'=>$member['user_id'],
                    'pay_status'=>Order::PAY_STATUS_COMPLETED,
                    'pay_time'=>get_now_time('Y-m-d H:i:s'),
                    'origin_price'=>Order::GIVE_PAID,//赠送金豆个数
                    'product_info'=>'赠送 ' . Order::GIVE_PAID.' 个金豆',
                    'price'=>Order::GIVE_PAID,
                    'sale_price'=> Order::GIVE_PAID,
                ])->save();
                if(!$order){
                    Db::rollback();
                    return 2;

                }
                //给会员增加金豆
                $memberModel=new Member();
                $member=Member::get(['user_id'=>$member['user_id']]);
                $prePaid=$member['pre_paid']+Order::GIVE_PAID;
                $row= $memberModel->isUpdate(true)->save([
                    'member_id' => $member['member_id'],
                    'pre_paid' => $prePaid,
                ]);
                if(!$row){
                    Db::rollback();
                    return 3;
                }
                Db::commit();
                return 666;
        }
    }*/
}

<?php

namespace app\manager\model;

use app\common\component\Code;

/**
 * 订单
 */
class Order extends \app\common\model\Order {

    /**
     * @param $mchId
     * @param $params
     * @param $pageNo
     * @param $pageSize
     * @param array $search
     * @return array
     */
    public function getList($mchId, $params, $pageNo, $pageSize, $search = ['order' => 'create_time desc']) {
        $where = [];
        !empty($params['keyword']) && $where['b.real_name|b.phone'] = array('like', "%{$params['keyword']}%");
        !empty($params['pay_type']) && $where['a.pay_type'] = $params['pay_type'];
        isset($params['pay_status']) && $where['a.pay_status'] = $params['pay_status'];
        isset($params['status']) && $where['a.status'] = $params['status'];
        !empty($params['type']) && $where['a.type'] = $params['type'];
        (isset($params['shop_id']) && $params['shop_id'] > 0) && $where['a.shop_id'] = $params['shop_id'];
        if (!empty($params['end_time']) && !empty($params['start_time'])) {
            $where['a.create_time'] = [['egt', $params['start_time']], ['elt', $params['end_time']]];
        }
        $where['mch_id'] = $mchId;
        $totalResults = $this->alias('a')
                        ->join('sys_user b', 'b.user_id=a.user_id', 'left')
                        ->join('sys_user c', ' c.user_id=a.user_id', 'left')
                        ->field('a.*,b.real_name,b.avatar,c.real_name as create_user')
                        ->where($where)->count();
        $totalPages = ceil($totalResults / $pageSize);
        $list = $this->alias('a')
                        ->join('sys_user b', 'b.user_id=a.user_id', 'left')
                        ->join('sys_user c', ' c.user_id=a.user_id', 'left')
                        ->field('a.*,b.real_name,b.phone,b.avatar,c.real_name as create_user')
                        ->where($where)->page($pageNo, $pageSize)->order($search['order'])->select();

        return page_result($list, $pageNo, $pageSize, $totalResults, $totalPages);
    }

    /**
     * @param $approval
     * @return array|bool
     */
    public function disposeApproval($approval) {
        $order = new Order();
        $orderData = [
            'mch_id' => $approval->mch_id,
            'shop_id' => $approval->shop_id,
            'user_id' => $approval->user_id,
            'transaction_id' => '',
            'seller_id' => $approval->seller_id,
            'trade_no' => generate_number_order(),
            'type' => $approval['type'],
            'product_num' => $approval->buy_num,
            'product_id' => $approval->product_id,
            'create_by' => $approval->dispose_user_id,
        ];
        $orderData['price'] = $approval->price;
        $orderData['sale_price'] = $approval->price;
        $orderData['origin_price'] = $approval->origin_price;
        $orderData['discount_price'] = $orderData['sale_price'] - $orderData['price'];
        if ($approval['type'] == self::TYPE_BUY_CARD) { //购卡
            $product = Card::get($approval->product_id);
            if (!$product) {
                return error(Code::UNKNOWN_ORDER_PRODUCT);
            }
            $orderData['product_info'] = '代购 ' . $product['card_name'];
        } elseif ($approval['type'] == self::TYPE_BUY_GROUP_COURSE || $approval['type'] == self::TYPE_BUY_PRIVATE_COURSE) { //购课
            $product = Course::get($approval->product_id);
            if (!$product) {
                return error(Code::UNKNOWN_ORDER_PRODUCT);
            }
            $orderData['product_info'] = '代购 ' . $product['course_name'] . ' ' . $approval->buy_num . ' 节';
        } elseif ($approval['type'] = self::TYPE_BUY_PRE_PAID) { //储值
            $orderData['product_info'] = '代储值 ' . $orderData['origin_price'];
        } else {
            return error(Code::UNKNOWN_ORDER_TYPE);
        }
        $result = $order->data($orderData)->save();
        if ($result === false) {
            return error(Code::SAVE_DATA_ERROR);
        }
        //生成的订单保存到代购记录
        $result = $approval->save(['order_id' => $order->order_id, 'approval_id' => $approval->approval_id]);
        if ($result === false) {
            return error(Code::SAVE_DATA_ERROR);
        }
        //支付订单
        return $this->paySuccess($order, self::CASH);
    }

    /**
     * 销售额
     * @param type $mchId
     * @param type $params
//     */
    public function totalSales($mchId, $params) {
        $where['mch_id'] = $mchId;
        $where['type'] = $params['type'];
        $where['pay_status'] = self::PAY_STATUS_COMPLETED;
        if (isset($params['start_time']) && isset($params['end_time'])) {
            $where['pay_time'] = [['egt', $params['start_time']], ['elt', $params['end_time']]];
        }
        isset($params['seller_id']) && $where['seller_id'] = $params['seller_id'];
        (isset($params['shop_id']) && $params['shop_id'] > 0) && $where['shop_id'] = $params['shop_id'];
        $result = $this->where($where)->sum('price');
        $result || $result = 0;
        return intval($result);
    }

    /**
     * @param $mchId
     * @param $params
     * @param $pageNo
     * @param $pageSize
     * @return array
     */
    public function reportList($mchId, $params, $pageNo, $pageSize) {
        $where = ['a.mch_id' => $mchId];
        $where['a.pay_time'] = [['gt', $params['start_time']], ['lt', $params['end_time']]];
        $where['a.pay_status'] = self::PAY_STATUS_COMPLETED;
        $where['a.type'] = $params['type'];
        $where['a.pay_type'] = array('in', $params['pay_type']);
        (isset($params['shop_id']) && $params['shop_id'] > 0) && $where['a.shop_id'] = $params['shop_id'];
        !empty($params['phone']) && $where['b.phone'] = array('like', "%{$params['phone']}%");
        //var_dump($where);exit;

        if ($params['type'] == Order::TYPE_BUY_CARD) { //购卡
            !empty($params['card_id']) && $where['a.product_id'] = $params['card_id'];
            $this->alias('a')->join('sys_user b', 'b.user_id=a.user_id','left')
                    ->join('sys_card c', ' c.card_id=a.product_id','left')
                    ->field('b.real_name,b.phone,b.avatar,c.card_name,a.price,c.days,a.pay_time,a.product_num')
                    ->where($where);
            $query = clone $this->getQuery();
            $total=clone $this->getQuery();
        } elseif ($params['type'] == Order::TYPE_BUY_PRIVATE_COURSE || $params['type'] == Order::TYPE_BUY_GROUP_COURSE) {//付费课
            $this->alias('a')->join('sys_user b', 'b.user_id=a.user_id', 'left')
                    ->join('mch_course c', ' c.course_id=a.product_id', 'left')
                    ->field('b.real_name,b.phone,b.avatar,c.course_name,a.price,a.pay_time,c.expire_day as days')
                    ->where($where);
            $query = clone $this->getQuery();
            $total=clone $this->getQuery();
        }
        //增加人数
        elseif($params['type'] == Order::TYPE_ADD_CARD_USER)
        {
            !empty($params['card_id']) && $where['a.product_id'] = $params['card_id'];
            //没有过滤免费绑卡的人
            $this->alias('a')
                ->join('mch_sold_card b', 'b.sold_card_id=a.product_id', 'left')
                ->join('mch_sold_card_user c', 'c.sold_card_id=b.sold_card_id', 'left')
                //->distinct(true)
                ->join('sys_user d', ' d.user_id=c.user_id', 'left')
                ->field('a.product_id,a.price,a.pay_time,a.product_num,a.user_id,b.card_id,b.price as prices,b.expire_time,b.card_name,b.days,c.user_id as uid,d.real_name,d.phone,d.avatar')
                ->group('c.user_id,c.sold_card_id')
                ->where('d.user_id != a.user_id') //排除主持卡人
                ->where('c.free = 1') //收费的副卡人
                ->where($where);
            $query = clone $this->getQuery();
            $total = clone $this->getQuery();
            $totalPrice = array_sum($total->column('a.price'));
            $totalResults = $this->count();
            $totalPages = ceil($totalResults / $pageSize);
            $list = $query->page($pageNo, $pageSize)->order($params['order'])->select();
            if(!empty($list))
            {
                $User = new User();
                //将被绑定的人 添加在主卡人数组的子数组中
                foreach ($list as $key=>&$items){
                    $temp = ($items->data);
                    //查询主卡人的信息
                    $condition = ['user_id' => $temp['user_id']];
                    $userInfo = $User->getUserInfo($condition);
                    $items->owmer_name = $userInfo->real_name;
                    if($temp['uid'] == $temp['user_id']){
                        $items->owner = 1;
                    }
                    else{
                        $items->owner = 0;
                    }
                }
            }

            return success([
                'list' => $list,
                'page_no' => $pageNo,
                'page_size' => $pageSize,
                'total_results' => $totalResults,
                'total_pages' => $totalPages,
                'totalPrice'=>$totalPrice
            ]);
        }
        //取消/旷课
        elseif($params['type'] == Order::TYPE_CANCEL_APPOINTMENT){
            $this->alias('a')->join('sys_user b', 'b.user_id=a.user_id', 'left')
                ->join('mch_appointment c', ' c.appointment_id=a.product_id', 'left')
                ->join('mch_class_plan d', ' d.plan_id=c.plan_id', 'left')
                ->field('b.real_name,b.phone,b.avatar,d.course_name,a.price,a.pay_time,a.create_time as days,a.price')
                ->where($where);
            $query = clone $this->getQuery();
            $total=clone $this->getQuery();
        }

        $totalResults = $this->count();
        $totalPages = ceil($totalResults / $pageSize);
        $list = $query->page($pageNo, $pageSize)->order($params['order'])->select();
        $totalPrice = $total->sum('a.price');
        return success([
            'list' => $list,
            'page_no' => $pageNo,
            'page_size' => $pageSize,
            'total_results' => $totalResults,
            'total_pages' => $totalPages,
            'totalPrice'=>$totalPrice
        ]);
    }

    /**总销售
     * @param $mchId
     * @param $params
     */
    public function statiStics($mchId, $params){
        $where['mch_id'] = $mchId;
        !empty($params['type'])&&$where['type'] = $params['type'];
        !empty($params['shop_id'])&& $where['shop_id'] = $params['shop_id'];
        $where['pay_status'] = self::PAY_STATUS_COMPLETED;
        $result = $this->where($where)->sum('price');
        $result || $result = 0;
        return success(intval($result));

    }
    /**
     *
     */
    public function report($mchId,$params,$users){
        $classPlanModel=new ClassPlan();
        $cardRate = Merchant::where(['mch_id' => $mchId])->value('card_rate');
        $sort = [];
        foreach ($users as $key => &$value) {
            //会员卡提成
            $value['sales_card'] = $this
                ->totalSales($mchId, ['start_time' => $params['start_time'], 'end_time' => $params['end_time'], 'shop_id' => $params['shop_id'], 'type' => self::TYPE_BUY_CARD, 'seller_id' => $value['user_id']]);
            $value['sales_card'] *= $cardRate;
            $value['card_rate'] = $cardRate;
            //售课提成
            $value['sales_course'] = 0;
            $shop = Shop::get(['manager_user_id' => $value['user_id']]);
            if ($shop) {
                $value['sales_course'] = $this
                    ->totalSales($mchId, ['start_time' => $params['start_time'], 'end_time' => $params['end_time'], 'shop_id' => $params['shop_id'], 'type' => self::TYPE_BUY_PRIVATE_COURSE, 'seller_id' => $value['user_id']]);
                $value['sales_course'] *= $value['sale_rate'];
            }
            //耗课提成
            $value['used_course'] = 0;
            $soldCourseList = $classPlanModel->getUsedSoldCourse($params['shop_id'], $value['user_id']);
            foreach ($soldCourseList as $soldCourse) {
                $value['used_course'] += $soldCourse['price'] / $soldCourse['buy_num'];
            }
            $value['used_course'] *= $value['course_rate'];
            $value['total_value'] = $value['used_course'] + $value['sales_course'] + $value['sales_card'];

            $sort[$key] = $value['total_value'];
        }
        array_multisort($sort, SORT_DESC, $users);
        return success($users);
    }

    /**
     * 财务统计详情
     * @param $mchId
     * @param $params
     * @param $users
     * @param $startTime
     * @param $endTime
     * @param $shopId
     * @return mixed
     */
    public function getListReport($mchId,$params,$startTime,$endTime,$shopId){
        $userModel=new User();
        $sort = [];
        $cardRate =Merchant::where(['mch_id' => $mchId])->value('card_rate');
        $data=$params;
        foreach ($data['list'] as $key => &$value) {
            //会员卡提成
            $where = [
                'mch_id' => $mchId,
                'seller_id' => $value['user_id'],
                'pay_status' => self::PAY_STATUS_COMPLETED,
                'pay_time' => [['egt', $startTime], ['elt', $endTime]],
                'type' => self::TYPE_BUY_CARD,
            ];
            $shopId > 0 && $where['shop_id'] = $shopId;
            $value['sales_card_list'] = $this->where($where)
                ->join('sys_user', 'sys_user.user_id=sys_order.user_id', 'left')
                ->field('sys_order.*,sys_user.real_name,sys_user.phone,sys_user.avatar')
                ->select();
            $value['sales_card_value'] = 0;
            $value['card_rate'] = $cardRate;
            foreach ($value['sales_card_list'] as $order) {
                $value['sales_card_value'] += $order['price'];
            }
            $value['sales_card'] = $value['sales_card_value'] * $value['card_rate'];
            //售课提成
            $value['sales_course_list'] = [];
            $value['sales_course_value'] = 0;
            $value['sales_course'] = 0;
            $shop = Shop::get(['manager_user_id' => $value['user_id']]);
            if ($shop) {
                $where = [
                    'mch_id' => $mchId,
                    'seller_id' => $value['user_id'],
                    'pay_status' => self::PAY_STATUS_COMPLETED,
                    'pay_time' => [['egt', $startTime], ['elt', $endTime]],
                    'type' => self::TYPE_BUY_PRIVATE_COURSE,

                ];
                $shopId > 0 && $where['shop_id'] = $shopId;
                $value['sales_course_list'] = $this->where($where)
                    ->join('sys_user', 'sys_user.user_id=sys_order.user_id', 'left')
                    ->field('sys_order.*,sys_user.real_name,sys_user.phone,sys_user.avatar')
                    ->select();
                foreach ($value['sales_course_list'] as $order) {
                    $value['sales_course_value'] += $order['price'];
                }
                $value['sales_course'] = $value['sales_course_value'] * $value['sale_rate'];
            }
            //耗课提成

            $value['used_course_list'] = $userModel->getUsedSoldCourse($shopId, $value['user_id']);
            $value['used_course_value'] = 0;
            $soldCourseList = [];
            foreach ($value['used_course_list'] as $soldCourse) {
                $value['used_course_value'] += $soldCourse['price'] / $soldCourse['buy_num'];
                if (isset($soldCourseList[$soldCourse['sold_course_id']])) {
                    $soldCourseList[$soldCourse['sold_course_id']]['count'] += 1;
                    $soldCourseList[$soldCourse['sold_course_id']]['price'] += $soldCourse['price'] / $soldCourse['buy_num'];
                } else {
                    $user =User::get($soldCourse['user_id']);
                    $user['count'] = 1;
                    $user['price'] = $soldCourse['price'] / $soldCourse['buy_num'];
                    $user['course_name'] = $soldCourse['course_name'];
                    $soldCourseList[$soldCourse['sold_course_id']] = $user;
                }
            }
            $value['used_course_list'] = $soldCourseList;
            $value['used_course'] = $value['used_course_value'] * $value['course_rate'];
            $value['total_value'] = $value['used_course'] + $value['sales_course'] + $value['sales_card'];
            $sort[$key] = $value['total_value'];
            //角色
            if ($shop) {
                $value['user_type'] = '健康管家';
            } else {
                if ($value['course_rate']) {
                    $value['user_type'] = '教练';
                }
                if ($value['title']) {
                    $value['user_type'] = '会籍';
                }
            }
        }
        array_multisort($sort, SORT_DESC, $data['list']);
        return $data;
    }
}

<?php

namespace app\manager\model;

use app\common\component\Code;

/**
 * 用户与商户关联
 */
class Member extends \app\common\model\Member {

    /**
     * 会员数量
     * @param type $mchId
     * @param type $params
     * @return type
     */
    public function totalCount($mchId, $params) {
        $this->alias('a')->where(['a.mch_id' => $mchId]);
        if ($params['card_status'] == 1) { //有卡,查询购卡时间
            $this->join('mch_sold_card_user b', 'b.user_id=a.user_id')
                    ->join('mch_sold_card c', 'c.sold_card_id=b.sold_card_id')
                    ->where(['c.create_time' => [['gt', $params['start_time']], ['lt', $params['end_time']]]])
                    ->where('c.price > 0'); //排除送的卡
        } elseif ($params['card_status'] == 2) { //即将过期
            $params['start_time'] = date('Y-m-d H:i:s', strtotime($params['start_time']) + 30 * 86400);
            $params['end_time'] = date('Y-m-d H:i:s', strtotime($params['end_time']) + 30 * 86400);
            $this->join('mch_sold_card_user b', 'b.user_id=a.user_id')
                    ->join('mch_sold_card c', 'c.sold_card_id=b.sold_card_id')
                    ->where(['c.active' => SoldCard::ACTIVE_ENABLE]) //已激活
                    ->where('c.price > 0'); //排除送的卡
            $this->where("(c.expire_time>'{$params['start_time']}' and c.expire_time<'{$params['end_time']}' )
                    or (c.type =" . Card::TYPE_COUNT . " and (c.times-c.use_times)<=2 and (c.times-c.use_times)>0)");
        } else { //查询注册时间
            $this->where(['a.create_time' => [['gt', $params['start_time']], ['lt', $params['end_time']]]]);

        }
        return $this->group('a.member_id')->count();
    }

    /*
     * 会员统计
     */
    public function reportList($mchId, $params, $pageNo, $pageSize,$type = 1) {
        $soldCard=new SoldCard();
        $this->alias('a')->where(['a.mch_id' => $mchId]);
        $this->join('mch_sold_card_user b', 'b.user_id=a.user_id', 'left')
                ->join('mch_sold_card c', 'c.sold_card_id=b.sold_card_id', 'left')
                ->join('sys_user d', 'd.user_id=a.user_id', 'left');
        !empty($params['phone']) && $this->where(['d.phone' => ['like', "%{$params['phone']}%"]]);
        if ($params['card_status'] == 1) { //有卡,查询购卡时间
            $this->where('c.price > 0'); //排除送的卡
            if (!empty($params['start_time']) && !empty($params['end_time'])) {
                $this->where(['c.create_time' => [['gt', $params['start_time']], ['lt', $params['end_time']]]]);
            }

        } elseif ($params['card_status'] == 2) { //即将过期
            $params['start_time'] = get_now_time('Y-m-d H:i:s');
            $params['end_time'] = date('Y-m-d H:i:s', get_now_time() + 30 * 86400);
            $this->where(['c.active' => SoldCard::ACTIVE_ENABLE]); //已激活
            $this->where('c.price > 0'); //排除送的卡
            $this->where("(c.expire_time>'{$params['start_time']}' and c.expire_time<'{$params['end_time']}' )
                    or (c.type=" . Card::TYPE_COUNT . " and (c.times-c.use_times)<=2 and (c.times-c.use_times)>0)");
        } else { //查询注册时间
            if (!empty($params['start_time']) && !empty($params['end_time'])) {
                $this->where(['a.create_time' => [['gt', $params['start_time']], ['lt', $params['end_time']]]]);
            }
        }
        $this->field('a.member_id,d.real_name,d.phone,d.avatar,a.create_time,a.user_id');
        $query = clone $this->getQuery();

        //如果是导出，到这里就结束并返回了
        if($type == 2){
            $list = $query
                ->group('a.member_id')
                ->order('a.create_time desc')
                ->select();
            $result = [];
            foreach ($list as $val){
                $data = [];
                $data['会员名']   = $val['real_name'];
                $data['电话']     = $val['phone'];
                $data['注册日期'] = $val['create_time'];
                $result[] = $data;
            }
            return $result;
        }

        $totalResults = $this->group('a.member_id')->count();
        $totalPages = ceil($totalResults / $pageSize);
        $list = $query->page($pageNo, $pageSize)->group('a.member_id')->order('a.create_time desc')->select();
        if($params['card_status']!=0 && $list){
            if($params['card_status']==1){
                $order='create_time desc';
            }elseif ($params['card_status']==2){
                $order='expire_time desc';
            }
            foreach ($list as $key=>&$value){
                $value['card']=$soldCard->where('user_id',$value['user_id'])->field('sold_card_id,type,create_time,expire_time,card_name')->order($order)->select();
            }
        }
        return page_result($list, $pageNo, $pageSize, $totalResults, $totalPages);
    }

    /*
     * 购卡会员统计
     */
    public function buyCardUser($mchId,$params,$pageNo,$pageSize,$type = 1){
        $where = [
            'a.mch_id'      => $mchId,
            'a.status'      => self::STATUS_ENABLE,
            'a.pay_status'  => Order::PAY_STATUS_COMPLETED,
            'a.type'        => Order::TYPE_BUY_CARD
        ];
        $field = [
             'a.product_info','a.pay_time','a.price',
             'b.user_id','b.real_name','b.phone','b.avatar'
        ];

        !empty($params['phone']) && $where['b.phone']  = ['LIKE',"%{$params['phone']}%"];
        if (!empty($params['start_time']) && !empty($params['end_time'])) {
            $where['a.pay_time'] = [['EGT', $params['start_time']], ['ELT', $params['end_time']],'AND'];
        }

        $order = new Order();
        $order->alias('a')
            ->join('sys_user b','b.user_id = a.user_id')
            ->where($where);
        $query = clone $order->getQuery();
        //如果是导出，到这里就结束并返回了
        if($type == 2){
            $list = $query
                ->order("a.pay_time desc")
                ->field($field)
                ->select();
            $result = [];
            foreach ($list as $val){
                $data = [];
                $data['会员名']   = $val['real_name'];
                $data['电话']     = $val['phone'];
                $data['购卡名称'] = $val['product_info'];
                $data['购卡金额'] = $val['price'];
                $data['购卡日期'] = $val['pay_time'];
                $result[] = $data;
            }
            return $result;
        }

        $totalResults = $order->count();
        $totalPages = ceil($totalResults / $pageSize);
        $list = $query->page($pageNo,$pageSize)
                    ->order("a.pay_time desc")
                    ->field($field)
                    ->select();
        return page_result($list, $pageNo, $pageSize, $totalResults, $totalPages);
    }

}

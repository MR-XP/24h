<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2018/5/17
 * Time: 13:51
 */

namespace app\v2\model;

class SalemanAchv extends \app\common\model\SalemanAchv
{

    /**
     * 查看销售下面的会员
     */
    public function getUsers($mchId,$userId,$params){

        //条件
        $where = [];
        !empty($params['keyword']) && $where['b.real_name|b.phone'] = ['like',"%{$params['keyword']}%"];
        $where['a.mch_id']      = $mchId;
        $salemanId              = Saleman::where(['user_id' => $userId,'mch_id' => $mchId])->value('saleman_id');
        $where['a.saleman_id']  = $salemanId;
        $where['a.user_id']     = ['NEQ',$userId];
        $list=[];

        //注册会员
        $list['regList'] = $this->alias('a')
            ->join('sys_user b','b.user_id = a.user_id')
            ->where($where)
            ->where(['a.user_type' => self::USERTYPE_REG])
            ->field('b.real_name,b.phone,b.create_time,b.avatar')
            ->order(['b.create_time'=>'desc'])->select();

        //购卡会员
        $where['c.mch_id']      = $mchId;
        $where['c.type']        = \app\common\model\Order::TYPE_BUY_CARD;
        $where['c.seller_id']   = $salemanId;
        //筛选
        $field = [
            'b.real_name','b.phone','b.create_time','b.avatar','b.user_id',
            'c.pay_time',
            'd.card_name','d.active','d.start_time','d.expire_time','sold_card_id',
            "(select sign_time from log_sign where log_sign.user_id = a.user_id and log_sign.relation_id = d.sold_card_id order by log_sign.sign_time desc limit 0,1) as sign_time"
        ];
        $list['buyList'] = $this->alias('a')
            ->join('sys_user b','b.user_id = a.user_id')
            ->join('sys_order c','c.order_id = a.order_id')
            ->join('mch_sold_card d','d.order_id = a.order_id')
            ->where($where)
            ->where(['a.user_type' => self::USERTYPE_BUY])
            ->field($field)
            ->order(['c.pay_time'=>'desc'])->select();

        return $list;
    }
}
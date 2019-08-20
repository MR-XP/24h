<?php

namespace app\common\model;

/**
 * 已出售的卡与用户关联
 */
class SoldCardUser extends Base {

    protected $table = 'mch_sold_card_user';

    protected $insert = ['create_time'];

    /*
     * 锁定
     */
    const STATUS_LOCK = 1;

    /*
     * 正常
     */
    const STATUS_NORMAL = 0;

    /*
     * 默认使用
     */
    const USER_IS_DEFAULT = 1;

    public function setCreateTimeAttr($val){
        return get_now_time('Y-m-d H:i:s');
    }

    //查询成员有效会员卡
    public function searchCard($mchId, $member, $params = []){

        $cardList=self::where(['user_id' => $member['user_id'],'mch_id' => $mchId])->select();
        $where = [
            'status'        =>  ["EQ",self::STATUS_ENABLE],
            'expire_time'   =>  [['GT',get_now_time('Y-m-d H:i:s')],['EQ','0000-00-00 00:00:00'],'or']
        ];
        foreach ($cardList as $val){
            $where['sold_card_id']=$val->sold_card_id;
            $soldCard = SoldCard::get($where);
            if(isset($soldCard)){
                if(
                    ($soldCard['type'] == Card::TYPE_TIME) ||
                    ($soldCard['type'] == Card::TYPE_COUNT && $soldCard['use_times'] < $soldCard['times'])
                ){
                    //没有激活，默认激活
                    if($soldCard['active']==self::STATUS_DISABLE){
                        $soldCard->active       =   self::STATUS_ENABLE;
                        $soldCard->start_time   =   get_now_time('Y-m-d H:i:s');
                        $soldCard->expire_time  =   date('Y-m-d H:i:s', get_now_time() + 86400 * $soldCard->days);
                        $soldCard->save();
                    }
                    return true;
                }

            }
            unset($soldCard);
        }
        return false;

    }

    //查询会员卡所包含的成员
    public function getMember($params,$search = ['type' => 1]){

        $field=[
            "a.user_id","a.sold_card_id","a.status",
            "b.real_name","b.sex","b.phone","b.avatar","b.create_time",
            '(select count(*) from log_sign where log_sign.relation_id=' . $params['sold_card_id'] . ' and log_sign.user_id=a.user_id) as count',
        ];
        $where=[
            'b.status'      =>  ['neq',self::STATUS_DELETED],
            'a.sold_card_id'  =>  $params['sold_card_id']
        ];
        //签到次数降序排列
        $order=["count" =>  "desc"];

        //查询除了主卡人之外的成员
        if($search['type'] == 2)
            $where['b.user_id']=['neq',$params['user_id']];

        $list = $this->alias('a')
            ->join('sys_user b','b.user_id=a.user_id')
            ->where($where)
            ->field($field)
            ->order($order)
            ->select();

        if($search['type'] == 2)
            return $list;

        return success($list);

    }

}

<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2018/7/23
 * Time: 14:33
 */

namespace app\common\model;


class Prize extends Base
{
    protected $table  = "mch_prize";
    protected $insert = ['create_time','status' => self::STATUS_ENABLE];
    protected $update = ['update_time'];

    const TYPE_CARD         =   1;      //会员卡
    const TYPE_GROUP_COURSE =   2;      //小团课
    const TYPE_COACH_COURSE =   3;      //私教课
    const TYPE_GOLD_BEAN    =   4;      //金豆
    const TYPE_CARD_DELAY   =   5;      //续卡奖
    const TYPE_ENTITY       =   6;      //实体奖

    public function setCreateTimeAttr($val){
        return date('Y-m-d H:i:s');
    }

    public function setUpdateTimeAttr($val){
        return date('Y-m-d H:i:s');
    }

}
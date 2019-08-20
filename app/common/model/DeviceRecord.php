<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2018/4/10
 * Time: 16:48
 */

namespace app\common\model;


class DeviceRecord extends Base
{
    protected $table    = "mch_device_record";
    protected $insert   = ["create_time","status" => 1];

    const DEVICE_RUN        = 2;     //跑步机
    const DEVICE_BODYFAT    = 1;     //体脂称

    public function setCreateTimeAttr($val){
        return get_now_time('Y-m-d H:i:s');
    }

    public function getUserIdAttr($val){
        if (empty($val)) {
            return '';
        } else {
            $where = [
                'status'    => User::STATUS_ENABLE,
                'user_id'   => $val,
            ];
            return User::where($where)->field('user_id,nick_name,real_name,sex,phone,avatar,create_time')->find();
        }
    }
}
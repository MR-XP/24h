<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2018/4/26
 * Time: 16:53
 */

namespace app\common\model;


class Reply extends Base
{
    protected $table    =   "mch_reply";
    protected $insert   =   ['create_time','update_time' => '0000-00-00 00:00:00','status' => self::STATUS_ENABLE];
    protected $update   =   ['update_time'];

    public function setCreateTimeAttr($val){
        return get_now_time('Y-m-d H:i:s');
    }

    public function setUpdateTimeAttr($val){
        if(empty($val)){
            return get_now_time('Y-m-d H:i:s');
        }else{
            return "0000-00-00 00:00:00";
        }
    }

}
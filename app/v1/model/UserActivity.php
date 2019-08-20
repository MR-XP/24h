<?php

namespace app\v1\model;

use app\common\component\Code;

class UserActivity extends \app\common\model\UserActivity {

    
    public function getList($mchId, $shopId, $userId)
    {
        $where = ['mch_id' => $mchId, 'status' => self::STATUS_ENABLE, 'user_id' => $userId];
        $list = $this->where($where)->order('create_time','desc')->select();
        return $list;
    }

    //检查用户的活动
    public function checkUserActivity($type, $user_id)
    {
        $item = $this->where(['user_id'=>$user_id, 'values'=>$type, 'status'=>1])->select();
        return $item;
    }
}

<?php

namespace app\common\model;

/**
 * 会员卡
 */
class ActivityTeam extends Base {
    //系统活动数据表
    protected $table = 'sys_activity_team';
    protected $insert = ['create_time', 'update_time' => '0000-00-00 00:00:00'];
    protected $update = ['update_time'];


    public function setCreateTimeAttr($value) {
        return get_now_time('Y-m-d H:i:s');
    }

    public function setUpdateTimeAttr($value) {
        return get_now_time('Y-m-d H:i:s');
    }

    public function setGroupsAttr($value) {
        return implode(",", $value);
    }

    public function getGroupsAttr($value) {
        if (empty($value)) {
            return [];
        } else {
            return explode(",", $value);
        }
    }

}

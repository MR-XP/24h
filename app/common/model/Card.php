<?php

namespace app\common\model;

/**
 * 会员卡
 */
class Card extends Base {

    protected $table = 'sys_card';
    protected $insert = ['create_time', 'update_time' => '0000-00-00 00:00:00'];
    protected $update = ['update_time'];

    /**
     * 时间卡
     */
    const TYPE_TIME = 1;

    /**
     * 次数卡
     */
    const TYPE_COUNT = 2;
    /**
     * 是否参与活动 1 是世界杯
     */
    const IS_ACTIVITY = 1; //世界杯

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

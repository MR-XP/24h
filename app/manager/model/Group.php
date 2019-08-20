<?php

namespace app\manager\model;

use app\common\component\Code;

/**
 * 用户组
 */
class Group extends \app\common\model\Group {

    /**
     * 获取用户的所有商户所有用户组
     * @param type $userId
     */
    public function getAllGroupMchId($userId) {
        $data = $this->alias('a')
                        ->join('auth_group_access b', 'b.group_id = a.id')
                        ->where("b.user_id=$userId and a.status=" . self::STATUS_ENABLE)
                        ->group('a.mch_id')->field('a.mch_id')->select();
        $result = [];
        foreach ($data as $value) {
            $result[] = $value['mch_id'];
        }
        ksort($result);
        return $result;
    }

}

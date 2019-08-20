<?php

namespace app\manager\model;

use app\common\component\Code;

/**
 * 用户组与用户关联
 */
class GroupAccess extends \app\common\model\GroupAccess {

    //删除所有关联
    public function delAllGroup($mchId, $userId) {
        $where['user_id'] = $userId;
        $where['group_id'] = array('in', function($query) use($mchId) {
                $query->table('auth_group')->where('mch_id', $mchId)->field('id');
            });
        $this->where($where)->delete();
    }

    //用户添加进用户组
    public function assignGroup($userId, $groupIds) {
        if (count($groupIds) > 0) {
            $data = [];
            foreach ($groupIds as $value) {
                $data[] = [
                    'group_id' => $value,
                    'user_id' => $userId
                ];
            }
            $this->saveAll($data);
        }
    }

}

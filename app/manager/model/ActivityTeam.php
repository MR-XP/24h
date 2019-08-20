<?php

namespace app\manager\model;

use app\common\component\Code;

class ActivityTeam extends \app\common\model\ActivityTeam {

    
    public function getList($mchId, $shopId) {
        $where = ['status' => self::STATUS_ENABLE, 'mch_id' => $mchId];
        $list = $this->where($where)->order('create_time','desc')->select();

        return $list;
    }

    //球队信息
    public function getTeamInfo($id)
    {
        $item = $this->where(['id' => $id, 'status' => 1])->select();
        return $item;
    }

}

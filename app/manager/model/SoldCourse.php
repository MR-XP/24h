<?php

namespace app\manager\model;

/**
 * 已出售的课程
 */
class SoldCourse extends \app\common\model\SoldCourse {

    public function getList($mchId, $params, $pageNo, $pageSize) {
        $this->alias('a')->where(['a.mch_id' => $mchId]);
        $this->join('mch_coach b', 'b.user_id = a.coach_user_id', 'left')
                ->join('sys_user c', 'c.user_id=a.coach_user_id', 'left');
        !empty($params['user_id']) && $this->where(['a.user_id' => $params['user_id']]);
        !empty($params['type']) && $this->where(['a.type' => $params['type']]);
        $this->field('a.*,b.shops,c.real_name as coach_real_name');
        $query = clone $this->getQuery();
        $totalResults = $this->count();
        $totalPages = ceil($totalResults / $pageSize);
        $list = $query->page($pageNo, $pageSize)->order('a.create_time desc')->select();
        foreach ($list as &$value) {
            if (empty($value['shops'])) {
                $value['shops'] = [];
            } else {
                $value['shops'] = Shop::where("shop_id in ({$value['shops']}) and status = " . Shop::STATUS_ENABLE)->select();
            }
        }
        return page_result($list, $pageNo, $pageSize, $totalResults, $totalPages);
    }

}

<?php

namespace app\v1\model;

use app\common\component\Code;

class Activity extends \app\common\model\Activity {

    //列表
    public function getList($mchId, $params, $pageNo, $pageSize, $search = ['order' => 'create_time desc'])
    {
        //!empty($params['name']) && $this->where('name like "%'.$params['name'].'%"');
        isset($params['status']) && $this->where("status={$params['status']}");
        $this->where("mch_id=$mchId");

        $query = clone $this->getQuery();
        $totalResults = $this->count();
        $totalPages = ceil($totalResults / $pageSize);
        $list = $query->page($pageNo, $pageSize)->order($search['order'])->select();

        return page_result($list, $pageNo, $pageSize, $totalResults, $totalPages);
    }

    //获取当前时间段活动
    public function getCurrentTimeActivity($time)
    {
        $items = $this->where("start_time","<=",$time)
                    ->where("end_time", ">=", "$time")
                    ->where(['status' => 1])
                    //->order("create_time")
                    ->select();
        return $items;
    }
}

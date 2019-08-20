<?php

namespace app\manager\model;

use app\common\component\Code;

class Activity extends \app\common\model\Activity {


    public function getList($mchId, $params, $pageNo, $pageSize, $search = ['order' => 'create_time desc'])
    {
        !empty($params['name']) && $this->where('name like "%'.$params['name'].'%"');
        isset($params['status']) && $this->where("status={$params['status']}");
        $this->where("mch_id=$mchId");

        $query = clone $this->getQuery();
        $totalResults = $this->count();
        $totalPages = ceil($totalResults / $pageSize);
        $list = $query->page($pageNo, $pageSize)->order($search['order'])->select();

        return page_result($list, $pageNo, $pageSize, $totalResults, $totalPages);
    }
}

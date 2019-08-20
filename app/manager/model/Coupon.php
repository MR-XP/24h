<?php

namespace app\manager\model;

class Coupon extends \app\common\model\Coupon {

    public function getList($mchId, $params, $pageNo, $pageSize, $search = ['order' => 'create_time desc']) {
        $where = [];
        !empty($params['coupon_name']) && $where['coupon_name'] = array('like', "%{$params['coupon_name']}%");
        !empty($params['type']) && $where['type']=$params['type'];
        (isset($params['status']) && $params['status'] != '') && $where['status'] = $params['status'];
        $where['mch_id'] = $mchId;
        $totalResults = $this->where($where)->count();
        $totalPages = ceil($totalResults / $pageSize);
        $list = $this->where($where)->page($pageNo, $pageSize)->order($search['order'])->select();
        return page_result($list, $pageNo, $pageSize, $totalResults, $totalPages);
    }

}

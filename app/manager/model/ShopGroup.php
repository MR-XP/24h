<?php

namespace app\manager\model;

/**
 * 店铺分组
 */
class ShopGroup extends \app\common\model\ShopGroup {

    //查询
    public function search($mchId, $params, $limit) {
        $where = [];
        isset($params['status']) && $where['status'] = $params['status'];
        $where['mch_id'] = $mchId;
        $this->where($where);
        $limit > 0 && $this->limit($limit);
        $result = $this->column('group_id,title');
        return $result;
    }

}

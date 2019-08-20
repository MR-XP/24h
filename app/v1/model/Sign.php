<?php

namespace app\v1\model;

class Sign extends \app\common\model\Sign {

    public function getList($mchId, $params, $pageNo, $pageSize, $search = ['order' => 'a.sign_time desc']) {
        $where = [];
        !empty($params['type']) && $where['a.type'] = $params['type'];
        !empty($params['user_id']) && $where['a.user_id'] = $params['user_id'];
        !empty($params['shop_id']) && $where['a.shop_id'] = $params['shop_id'];
        !empty($params['sold_card_id']) && $where['a.relation_id'] = $params['sold_card_id'];
        !empty($params['phone']) && $where['b.phone'] = array('like', "%{$params['phone']}%");

        if (isset($params['start_time']) && isset($params['end_time'])) {
            $where['a.sign_time'] = array(
                ['egt', $params['start_time']],
                ['elt', $params['end_time'].' 23:59:59']
            );
        }
        if (!empty($params['order']) && $params['order'] == 1) {
            $search = ['order' => 'a.sign_time asc'];
        }

        $where['a.mch_id'] = $mchId;
        $this->alias('a');
        $this->where($where);
        $query = clone $this->getQuery();
        $totalResults = $this->count();
        $totalPages = ceil($totalResults / $pageSize);
        $list = $query->page($pageNo, $pageSize)->order($search['order'])->select();

        foreach ($list as &$value) {
            $value->append(['type_text', 'status_text']);
            $value['long_time'] = (strtotime($value->out_time) - strtotime($value->sign_time)) / 3600;
        }
        return page_result($list, $pageNo, $pageSize, $totalResults, $totalPages);
    }

}

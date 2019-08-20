<?php

namespace app\manager\model;

use app\common\component\Code;

/**
 * 会员卡模型
 */
class Card extends \app\common\model\Card {

    public function getList($mchId, $params, $pageNo, $pageSize, $search = ['order' => 'create_time desc']) {
        !empty($params['card_name']) && $this->where('card_name like "%'.$params['card_name'].'%"');
        isset($params['status']) && $this->where("status={$params['status']}");
        $this->where("mch_id=$mchId");
        if(isset($params['group_id'])&&!empty($params['group_id'])){
           $this->where("find_in_set({$params['group_id']},groups)");
        }
        $query = clone $this->getQuery();
        $totalResults = $this->count();
        $totalPages = ceil($totalResults / $pageSize);
        $list = $query->page($pageNo, $pageSize)->order($search['order'])->select();
        if($list){
            foreach ($list as $key=>&$value) {
                $value['sales'] = SoldCard::where('card_id='.$value['card_id'])->count();//会员卡销量
            }
        }
        return page_result($list, $pageNo, $pageSize, $totalResults, $totalPages);
    }

    //查询
    public function search($mchId, $params, $limit) {
        $where = [];
        !empty($params['card_name']) && $where['card_name'] = array('like', "%{$params['card_name']}%");
        isset($params['status']) && $where['status'] = $params['status'];
        if(!empty($params['group_id'])){
            $this->where("find_in_set({$params['group_id']},groups)");
        }
        $where['mch_id'] = $mchId;
        $this->where($where);
        $limit > 0 && $this->limit($limit);
        $result = $this->select();
        return $result;
    }

}

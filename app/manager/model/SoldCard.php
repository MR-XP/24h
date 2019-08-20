<?php

namespace app\manager\model;

use app\common\component\Code;

/**
 * 已售出的卡
 */
class SoldCard extends \app\common\model\SoldCard {

    /**
     * 获取由用户购买的卡
     * @param type $mchId
     * @param type $userId
     * @param type $params
     */
    public function getUserByCard($mchId, $userId, $params = []) {
        $where = "mch_id=$mchId and user_id=$userId and (
                       (active = 0)
                       or (type=" . Card::TYPE_TIME . " and expire_time>'" . get_now_time() . "')
                       or (type=" . Card::TYPE_COUNT . " and times>use_times)
                    )";
        $result = $this->where($where)->find();
        return $result;
    }

    //列表
    public function getList($mchId, $params, $pageNo, $pageSize) {
        $where['a.mch_id'] = $mchId;
        if (isset($params['start_time']) && isset($params['end_time'])) {
            $where['a.start_time'] = [['gt', $params['start_time']], ['lt', $params['end_time']]];
        }
        isset($params['active']) && $where['a.active'] = $params['active'];
        !empty($params['shop_id']) && $where['a.active_shop_id'] = $params['shop_id'];
        $this->alias('a')->join('sys_user b', 'b.user_id=a.user_id', 'left');
        $this->where($where);
        $query = clone $this->getQuery();
        $totalResults = $this->count();
        $totalPages = ceil($totalResults / $pageSize);
        $list = $query->page($pageNo, $pageSize)->field('b.avatar,b.real_name,b.phone,a.start_time')->order($params['order'])->select();
        return page_result($list, $pageNo, $pageSize, $totalResults, $totalPages);
    }

    //统计总数
    public function totalCount($mchId, $params) {
        $where['mch_id'] = $mchId;
        if (isset($params['start_time']) && isset($params['end_time'])) {
            $where['start_time'] = [['gt', $params['start_time']], ['lt', $params['end_time']]];
        }
        isset($params['active']) && $where['active'] = $params['active'];
        !empty($params['shop_id']) && $where['active_shop_id'] = $params['shop_id'];
        $result = $this->where($where)->count();
        return $result;
    }

    //根据card_id获取user
    public function getUserByCardId($mchId,$cardId,$params = []){
        if($cardId>0) {
            $where = [
                'card_id'       =>  $cardId,
                'mch_id'        =>  $mchId
            ];
            $userIds = $this->where($where)->group('user_id')->column('user_id');
            $str = '';
            if($userIds){
                foreach ($userIds as $val) {
                    $str .= $val['user_id'] . ',';
                }
                $str = substr($str, 0, strlen($str) - 1);
            }

            return $str;
        }
    }
}

<?php

namespace app\manager\model;

/**
 * 签到记录
 */
class Sign extends \app\common\model\Sign {

    public function getList($mchId, $params, $pageNo, $pageSize, $search = ['order' => 'a.sign_time desc']) {
        $where = [];
        !empty($params['type']) && $where['a.type'] = $params['type'];
        !empty($params['user_id']) && $where['a.user_id'] = $params['user_id'];
        !empty($params['shop_id'])&& $where['a.shop_id']=$params['shop_id'];
        !empty($params['phone'])&& $where['b.phone'] = array('like', "%{$params['phone']}%");

        if (isset($params['start_time']) && isset($params['end_time'])) {
            $where['a.sign_time'] = array(
                    ['egt', $params['start_time']],
                    ['elt', $params['end_time']]
            );
        }
        if(!empty($params['order'])&& $params['order']==1){
            $search = ['order' => 'a.sign_time asc'];
        }

        $where['a.mch_id'] = $mchId;
        $this->alias('a')->join('sys_user b','a.user_id=b.user_id');
        $this->where($where);
        $query = clone $this->getQuery();
        $totalResults = $this->count();
        $totalPages = ceil($totalResults / $pageSize);
        $list = $query->page($pageNo, $pageSize)->order($search['order'])->select();
        foreach ($list as &$value) {
            $value->append(['type_text', 'status_text']);
            $value['long_time']=(strtotime($value->out_time)-strtotime($value->sign_time))/3600;
        }
        return page_result($list, $pageNo, $pageSize, $totalResults, $totalPages);
    }

    public function getSignCount($mchId, $shopId, $userId, $params = []) {
        $where = [];
        if ($mchId == 0) {
            return 0;
        }
        $shopId > 0 && $where['shop_id'] = $shopId;
        $where['mch_id'] = $mchId;
        $where['user_id'] = $userId;
        return $this->where($where)->count();
    }

    public function getsignStatistics($mchId, $userId, $startTime, $endTime, $pageNo, $pageSize, $order) {
        $where = [];
        $where['sign_time'] = array(
                ['egt', $startTime],
                ['elt', $endTime]
        );
        $field = "a.sign_time,a.out_time,b.avatar,b.username,b.phone";
        $where['user_id'] = $userId;
        $where['mch_id'] = $mchId;
        $total = $this->where($where)->count();
        $list = $this->alias('a')->join('sys_user b', 'a.user_id=b.user_id')->where($where)->field($field)->page($pageNo, $pageSize)->order($order)->select();
        if (!$list) {
            return error('0', '不好意思哦，未查询到签到数据');
        }
        return success($list, $total);
    }
    /**
     * 签到次数
     * @param type $mchId
     * @param type $params
     * @return type
     */
    public function totalCount($mchId, $params) {
        $where = ['mch_id' => $mchId];
        !empty($params['shop_id']) && $where['shop_id'] = $params['shop_id'];
        $where['sign_time'] = [['gt', $params['start_time']], ['lt', $params['end_time']]];
        return $this->where($where)->count();
    }

}

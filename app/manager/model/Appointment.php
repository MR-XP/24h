<?php

namespace app\manager\model;

use app\common\component\Code;

/**
 * 预约
 */
class Appointment extends \app\common\model\Appointment {

    public function getList($mchId, $params, $pageNo, $pageSize, $search = ['order' => '`a`.create_time desc']) {
        $where = [];
        !empty($params['plan_type']) && $where['a.plan_type'] = $params['plan_type'];
        !empty($params['user_id']) && $where['a.user_id'] = $params['user_id'];
        !empty($params['shop_id']) && $where['a.shop_id'] = $params['shop_id'];
        $where['a.status'] = ['NEQ',Appointment::STATUS_DELETED];
        if (isset($params['start_time']) && isset($params['end_time'])) {
            $where['a.create_time'] = array(
                ['egt', $params['start_time']],
                ['elt', $params['end_time']]
            );
        }
        $where['a.mch_id'] = $mchId;
        $this->alias('a')->join('sys_user b', 'a.user_id=b.user_id');
        if (isset($params['course_id'])) {
            $where['a.plan_id'] = array('in', function($query) use($mchId, $params) {
                    $wherePlan = [];
                    $wherePlan['mch_id'] = $mchId;
                    $wherePlan['course_id'] = $params['course_id'];
                    $query->table('mch_class_plan')->where($wherePlan)->field('plan_id');
                });
        }
        $this->where($where);
        $query = clone $this->getQuery();
        $totalResults = $this->count();
        $totalPages = ceil($totalResults / $pageSize);
        $list = $query->page($pageNo, $pageSize)->field('a.*,b.real_name,b.phone,b.avatar')->order($search['order'])->select();
        load_relation($list, ['shop', 'classPlan']);
        return page_result($list, $pageNo, $pageSize, $totalResults, $totalPages);
    }

    public function totalCount($mchId, $params) {
        $where = ['mch_id' => $mchId, 'status' => self::STATUS_ENABLE];
        !empty($params['shop_id']) && $where['shop_id'] = $params['shop_id'];
        !empty($params['type']) && $where['plan_type'] = $params['type'];
        $where['create_time'] = [['gt', $params['start_time']], ['lt', $params['end_time']]];
        return $this->where($where)->count();
    }

}

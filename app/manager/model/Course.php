<?php

namespace app\manager\model;

use app\common\component\Code;

/**
 * 课程模型
 */
class Course extends \app\common\model\Course {
    /**
     * @param $mchId
     * @param $params
     * @param $pageNo
     * @param $pageSize
     * @param array $search
     * @return array
     */
    public function getList($mchId, $params, $pageNo, $pageSize, $search = ['order' => ['sort' => 'desc','create_time' => 'desc']]) {
        $where = [];
        !empty($params['course_name']) && $where['course_name'] = array('like', "%{$params['course_name']}%");
        !empty($params['coach_user_id']) && $where['coach_user_id'] = $params['coach_user_id'];
        !empty($params['type']) && $where['type'] = $params['type'];
        !empty($params['level']) && $where['level'] = $params['level'];
        isset($params['status']) ? $where['status'] = $params['status'] : $where['status'] = ['neq', self::STATUS_DELETED];
        $where['mch_id'] = $mchId;
        $totalResults = $this->where($where)->count();
        $totalPages = ceil($totalResults / $pageSize);
        $list = $this->where($where)->page($pageNo, $pageSize)->order($search['order'])->select();
        return page_result($list, $pageNo, $pageSize, $totalResults, $totalPages);
    }

    /**
     * @param $mchId
     * @param $params
     * @param $limit
     * @return false|\PDOStatement|string|\think\Collection
     */
    public function search($mchId, $params, $limit) {
        $where = [];
        !empty($params['course_name']) && $where['course_name'] = array('like', "%{$params['course_name']}%");
        !empty($params['coach_user_id']) && $where['coach_user_id'] = $params['coach_user_id'];
        !empty($params['type']) && $where['type'] = $params['type'];
        isset($params['status']) && $where['status'] = $params['status'];
        $where['mch_id'] = $mchId;
        $this->where($where);
        $limit > 0 && $this->limit($limit);
        $result = $this->select();
        return $result;
    }

}

<?php

namespace app\common\model;

use think\Db;

/**
 * 课程评价
 */
class CourseComment extends Base {

    protected $table = 'mch_course_comment';
    protected $insert = ['create_time', 'status' => 1];

    /**
     * 课程
     */
    const TYPE_COURSE  = 1;

    /**
     * 教练
     */
    const TYPE_COACH   = 2;

    public function setCreateTimeAttr($val) {
        return get_now_time('Y-m-d H:i:s');
    }

    public function getList($mchId,$params,$pageNo,$pageSize, $search = ['order' => 'a.create_time desc']){

        $where = [];
        $where['a.mch_id'] = $mchId;
        if(!empty($params['id'])){
            if($params['type']== self::TYPE_COURSE){
                $where['a.course_id']       = $params['id'];
            }
            if($params['type']== self::TYPE_COACH){
                $where['a.coach_user_id']   = $params['id'];
            }
        }
        $field = [
            'a.shop_id','a.shop_name','a.rate','a.course_id','a.course_name','a.content','a.create_time',
            'b.nick_name','b.real_name','b.phone','b.avatar','b.age','b.sex','b.user_id'
        ];

        $this->alias('a')
            ->join('sys_user b','b.user_id = a.user_id')
            ->where($where);
        $query = clone $this->getQuery();
        $totalResults = $this->count();
        $totalPages = ceil($totalResults / $pageSize);
        $list = $query
            ->page($pageNo, $pageSize)
            ->field($field)
            ->order($search['order'])
            ->select();
        return page_result($list, $pageNo, $pageSize, $totalResults, $totalPages);

    }

}

<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2018/7/10
 * Time: 19:28
 */

namespace app\v2\model;


class Comment extends \app\common\model\Comment
{
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
            'a.*',
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
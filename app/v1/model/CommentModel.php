<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace app\v1\model;

/**
 * Description of CommentModel
 *
 * @author Administrator
 */
class CommentModel extends \app\common\model\CourseComment {

    protected $sys_user = 'sys_user';

    public function get_coach_comment($mchId, $userId) {
        $where = ["t.coach_user_id" => $userId, 't.status' => 1];
        $field = 'u.real_name,u.avatar,t.rate,t.course_name,t.content,t.create_time';
        $list = $this->alias('t')
                ->join($this->sys_user . ' u', 'u.user_id = t.user_id')
                ->field($field)
                ->where($where)
                ->order('t.create_time desc')
                ->select();
        return $list;
    }

}

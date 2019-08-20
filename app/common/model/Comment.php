<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace app\common\model;

/**
 * Description of Comment
 *
 * @author Administrator
 */
class Comment extends Base {

    protected $table = "mch_comment";
    protected $insert = ['create_time','update_time' => '0000-00-00 00:00:00','status' => 1];
    protected $type = [
      'coach_label'     =>  'array',
      'course_label'    =>  'array'
    ];

    //正常状态
    const STATUS_NORMAL = 1;

    //删除状态
    const STATUS_DELETE = 2;

    //私教
    const TYPE_COACH = 2;

    //课程
    const TYPE_COURSE = 1;

    public function setCreateTimeAttr($val){
        return date('Y-m-d H:i:s');
    }

    public function setUpdateTimeAttr($val){
        if(!empty($val)){
            return "0000-00-00 00:00:00";
        }else{
            return date('Y-m-d H:i:s');
        }
    }

}

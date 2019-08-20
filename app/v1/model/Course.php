<?php

namespace app\v1\model;

use app\common\component\Code;


class Course extends \app\common\model\Course {
    //获得教练的课程
    public function getCoachCourse($mchId,$userId){
        $where=[];
        $where['coach_user_id']=$userId;
        $where['mch_id']=$mchId;
        $where['type']=3;
        $course=$this->where($where)->select();
        return success($course);
    }
    /**
     * 获得课程详情
     */
    public function getCourseDetail($mchId,$courseId,$planId,$latitude='',$longitude=''){
        $shopModel=new Shop();
        $where=[];
        $where['a.mch_id']=$mchId;
        $where['a.course_id']=$courseId;
        $where['b.plan_id']=$planId;
        $field=[
            'a.cover','a.course_name','a.min_buy','a.expire_day','a.price','a.intro','a.time',
            'b.plan_id','b.start_time','b.end_time',
            'c.real_name',
            'd.shops'
        ];
        $courseDetail=$this->alias('a')
            ->where($where)
            ->join('mch_class_plan b','b.course_id=a.course_id')
            ->join('sys_user c','c.user_id=a.coach_user_id')
            ->join('mch_coach d','d.user_id=a.coach_user_id')
            ->field($field)
            ->find();
        if(!$courseDetail){
            return error('0','没查到该课程详情');
        }
        else{
            $courseDetail['shop']=$shopModel->getShopAddress($courseDetail['shops'],$latitude,$longitude);
            $courseDetail['serviceNum']=count(explode(',',$courseDetail['shops']));
        }
        return success($courseDetail);
    }
    public function getCourseSign($courseId){
        $where=[];
        $where['course_id']=$courseId;
        $fields=[
            'a.*',
            'b.shops'
        ];
        $result=$this->alias('a')
            ->join('mch_coach b','b.user_id=a.coach_user_id')
            ->where($where)->field($fields)->find();
        $result['shops']=count( explode(',',$result['shops']));
        return success($result);
    }
}

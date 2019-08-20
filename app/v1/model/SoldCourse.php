<?php

namespace app\v1\model;

class SoldCourse extends \app\common\model\SoldCourse {
    
        //查询购课    
        public function searchSold($mchId,$userId,$courseId){

            $data = [];

            //初始化
            $where=[];
            $where['mch_id']=$mchId;
            $where['user_id']=$userId;
            $where['status']=Course::STATUS_NORMAL;
            
            //查询正常购课
            $list=$this->where($where)
            ->where('expire_time','GT',get_now_time('Y-m-d H:i:s'))         //未过期
            ->where('use_num < buy_num')                                        //未用完
            ->order('create_time asc')                                          //最先购买时间
            ->lock(true)
            ->select();
            
            if(count($list) > 0){
                
                //查询普通购买课程
                foreach($list as $val){
                    if($val['course_id']==$courseId){
                        $data['code']=self::TYPE_ORDINARY;
                        $data['sold_course_id']=$val['sold_course_id'];
                        return $data;
                    }
                }
                
                //查询高级购买课程，大约小功能
                foreach ($list as $val){                    
                    if(!empty($val['groups'])){
                        foreach($val['groups'] as $sub){
                            if($sub == $courseId){
                                $data['code']=self::TYPE_SENIOR;
                                $data['sold_course_id']=$val['sold_course_id'];
                                $data['course_name']=$val['course_name'];
                                $data['num']=$val['buy_num'] - $val['use_num'];
                                return $data;
                            }
                        }
                        unset($groups);
                    }
                }
        
            //没有有效课程
            }else{
                //查询过期课程
                $exList=$this->where($where)
                        ->where('course_id','EQ',$courseId)                     
                        ->whereOr('expire_time','ELT',get_now_time('Y-m-d H:i:s'))      //已过期
                        ->whereOr('use_num = buy_num')                                      //已用完
                        ->order('create_time desc')                                         //最后购买时间
                        ->lock(true)
                        ->select();

                if(count($exList) > 0){
                    $data['code']=self::TYPE_EXPIRE;
                    $data['sold_course_id']=$exList[0]['sold_course_id'];
                }else{
                    $data['code']=0;            //没有购买信息
                    $data['sold_course_id']=0;
                }
                return $data;              
            }
        }
        
    
}

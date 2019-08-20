<?php

namespace app\v1\validate;

use think\Validate;
use app\v1\model;

class Order extends Validate {

    protected $rule = [
        'user_id' => 'require',
        'mch_id' => 'require',
        'type' => 'require|in:1,2,3,4,5,6',
        'origin_price' => 'checkOriginPrice',
        'product_num' => 'checkProductNum',
        'product_id' => 'checkProductId|checkAppointmentId|checkAbsenteeismId',
    ];
    protected $message = [
        'type.require' => '请选择订单类型',
        'origin_price.checkOriginPrice' => '该值必须大于0',
        'product_num.checkProductNum' => '产品数量属于大于0',
        'product_id.checkProductId' => '未找到该商品',
        'product_id.checkAppointmentId'=>'未找到该旷课记录',
        'product_id.checkAbsenteeismId'=>'该旷课记录已被取消'
    ];

    protected function checkOriginPrice($value, $rule, $data) {
        if ($data['type'] == model\Order::TYPE_BUY_PRE_PAID && $value <= 0) {
            return false;
        }
        return true;
    }

    protected function checkProductNum($value, $rule, $data) {
        if ($data['type'] != model\Order::TYPE_BUY_PRE_PAID && $value <= 0) {
            return false;
        }
        return true;
    }

    protected function checkProductId($value, $rule, $data) {
        if ($data['type'] == model\Order::TYPE_BUY_CARD) { //购卡
            return model\Card::where(['card_id' => $value, 'status' => model\Card::STATUS_ENABLE])->count() > 0;
        } elseif ($data['type'] == model\Order::TYPE_BUY_GROUP_COURSE || $data['type'] == model\Order::TYPE_BUY_PRIVATE_COURSE) { //购课
            return model\Course::where(['course_id' => $value, 'status' => model\Course::STATUS_ENABLE])->count() > 0;
        }
        return true;
    }
    //检测旷课记录
    protected function checkAppointmentId($value,$rule,$data){
        if($data['type']==\app\common\model\Order::TYPE_CANCEL_APPOINTMENT){//取消旷课
            $where=[];
            $where['appointment_id']=$value;
//            $where['sign']=0;
            $where['end_time']=array('lt',get_now_time('Y-m-d H:i:s'));
            $where['status']=1;
////            $where['plan_type']=2;
            $where['cancel_type']=0;
            return \app\common\model\Appointment::where($where)->count()===1;
        }
        return true;
    }
    protected function checkAbsenteeismId($value,$rule,$data){
        if($data['type']==\app\common\model\Order::TYPE_CANCEL_APPOINTMENT){//取消旷课
            $where=[];
            $where['product_id']=$value;
            $where['status']=model\Order::STATUS_ENABLE;
            $where['type']=\app\common\model\Order::TYPE_CANCEL_APPOINTMENT;
            return \app\common\model\Order::where($where)->count()===0;
        }
        return true;
    }
}

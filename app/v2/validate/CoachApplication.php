<?php

namespace app\v2\validate;

use think\Validate;
use app\v2\model;

class CoachApplication extends Validate {

    protected $rule = [
        'user_id'=>'checkStatus|chackUserId',
        'id_card' => 'require|checkIdCard',
        'type' => 'require|in:1,2',
        'birthday' => 'require',
        'address' => 'require',
        'certs' => 'require|array',
        'channel' => 'require',
        'seniority' => 'require',
        'intro' => 'require',
        'speciality' => 'require',
    ];
    protected $message = [
        'id_card.require' => '身份证号不能为空',
        'id_card.checkIdCard' => '该身份证号已被申请',
        'user_id.checkStatus'=>'你正在审核中,请勿重复操作',
        'user_id.chackUserId'=>'你已成为教练,请勿重复操作',
        'type.require' => '请选择工作性质',
        'birthday.require' => '生日不能为空',
        'address.require' => '地址不能为空',
        'certs.require' => '请上传证书',
        'certs.array' => '证书为数组形式',
        'channel.require' => '请选择渠道',
        'seniority.require' => '请选择教龄',
        'intro.require' => '请填写简介',
        'speciality.require' => '请选择擅长',
    ];

    // 验证唯一性
    protected function checkIdCard($value, $rule, $data) {
        $where = [];
        $where['id_card'] = $value;
        $where['mch_id'] = $data['mch_id'];
        if (isset($data['application_id']) && $data['application_id'] > 0) {
            $where['application_id'] = array('neq', $data['application_id']);
        }
        return model\CoachApplication::where($where)->count() === 0;
    }
    //判断是否已为教练
    public function chackUserId($value,$rule,$data){

        $where=[];
        $where['mch_id']=$data['mch_id'];
        $where['user_id']=$value;
        $where['status']=1;
        return model\Coach::where($where)->count()===0;
//        return model\Coach::where($where)->count()===0;
    }
    //判断是否已经为教练
    public function checkStatus($value,$rule,$data){
        $where=[];
        $where['mch_id']=$data['mch_id'];
        $where['user_id']=$value;
        $where['status']=model\CoachApplication::STATUS_WAITING;
        return model\CoachApplication::where($where)->count()===0;
    }



}

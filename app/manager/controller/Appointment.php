<?php

namespace app\manager\controller;

use app\manager\model;
use app\manager\validate;
use app\common\component\Code;

/*
 * 预约
 */

class Appointment extends Base {

    //获取列表
    public function getList() {
        $model = new model\Appointment();
        $data = input('');
        $pageNo = input('page_no', 1);
        $pageSize = input('page_size', $this->pageSize);
        return $model->getList($this->mchId, $data, $pageNo, $pageSize);
    }
    //代预约
    public function make() {
        //$user = new model\User();
        //$aa = $user->where('user_id=1')->lock(true)->fetchSql(true)->value('phone');
        //$aa = model\User::where('user_id=1')->lock(true)->fetchSql(true)->value('phone');
//        $aa = model\User::where('user_id=1')->fetchSql(true)->update(['age'=>'aaa']);
//        dump($aa);
        $model = new model\Appointment();
        $validate = new validate\Appointment();
        $data = input('');
        if (!$validate->scene('make')->check($data)) {
            return error(Code::VALIDATE_ERROR, $validate->getError());
        }
        $isExper = 0;
        $createType = 1;
        $validate = ['card', 'exper', 'sold_course', 'shop_rule'];
        return $model->make($this->mchId, $data['shop_id'], $data['plan_id'], $data['sold_course_id'], $data['user_id'], $isExper, $createType, $validate);
    }

//取消预约
    public function cancel() {
        $model = new model\Appointment();
        $validate = new validate\Appointment();
        $data = input('');
        if (!$validate->scene('cancel')->check($data)) {
            return error(Code::VALIDATE_ERROR, $validate->getError());
        }
        return $model->cannel($this->mchId, $data['appointment_id'], model\Appointment::CANCEL_BY_MASTER, model\Appointment::CANCEL_TYPE_NORMAL);
    }

}

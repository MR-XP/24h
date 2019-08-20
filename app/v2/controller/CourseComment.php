<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace app\v2\controller;

use app\common\component\Code;
use app\v2\model\Appointment;
use app\v2\model;
use think\Db;

class CourseComment extends Base {

    public function courseComment() {

        $appointmentId = $this->request->param('appointment_id');
        $rate = $this->request->param('rate', 0);
        $content = $this->request->param('content');
        $appointment = Appointment::get(['appointment_id' => $appointmentId, 'user_id' => $this->user['user_id'], 'sign' => [['gt', 1], ['lt', 4]]]);
        if ($appointment) {
            Db::startTrans();
            try {
                $appointment['sign'] = 4;
                $result = $appointment->save();
                if ($result === false) {
                    Db::rollback();
                    return error(Code::SAVE_DATA_ERROR);
                }
                $data = [
                    'mch_id'        => $this->merchant['mch_id'],
                    'rate'          => $rate,
                    'content'       => $content,
                    'user_id'       => $this->user['user_id'],
                    'appointment_id'=> $appointment['appointment_id'],
                    'coach_user_id' => $appointment->classPlan->coach_user_id,
                    'course_id'     => $appointment->classPlan->course_id,
                    'course_name'   => $appointment->classPlan->course_name,
                    'type'          => $appointment->classPlan->type,
                    'shop_id'       => $appointment->shop->shop_id,
                    'shop_name'     => $appointment->shop->shop_name
                ];
                $validate = new \app\v2\validate\Comment();
                if (!$validate->check($data)) {
                    return error(Code::VALIDATE_ERROR, $validate->getError());
                }
                $result = \app\v2\model\CourseComment::create($data);
                if (!$result) {
                    Db::rollback();
                    return error(Code::SAVE_DATA_ERROR);
                } else {
                    Db::commit();
                    return success('评价成功');
                }
            } catch (\Exception $e) {
                Db::rollback();
                return error(Code::SAVE_DATA_ERROR);
            }
        } else {
            return error(Code::VALIDATE_ERROR, '参数错误!');
        }
    }

    public function getList(){
        $model      = new model\CourseComment();
        $data       = input('');
        if(empty($data)){
            return error(Code::VALIDATE_ERROR, '参数错误!');
        }
        $pageNo     = input('page_no',1);
        $pageSize   = input('page_size',$this->pageSize);
        return $model->getList($this->merchant['mch_id'],$data,$pageNo,$pageSize);
    }
}


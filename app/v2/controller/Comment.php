<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2018/7/10
 * Time: 19:22
 */

namespace app\v2\controller;

use app\common\component\Code;
use app\v2\model;
use think\Db;

class Comment extends Base
{
    public function Comment() {

        $appointmentId = $this->request->param('appointment_id');
        $appointment = model\Appointment::get(['appointment_id' => $appointmentId, 'user_id' => $this->user['user_id'], 'sign' => [['gt', 1], ['lt', 4]]]);
        if ($appointment) {
            Db::startTrans();
            try {
                //更新预约状态
                $appointment['sign'] = 4;
                $result = $appointment->save();
                if ($result === false) {
                    Db::rollback();
                    return error(Code::SAVE_DATA_ERROR);
                }
                
                //记录评论
                $data = $this->request->param();
                $data['mch_id']         =$this->merchant['mch_id'];
                $data['user_id']        =$this->user['user_id'];
                $data['appointment_id'] =$appointment['appointment_id'];
                $data['coach_user_id']  =$appointment->classPlan->coach_user_id;
                $data['course_id']      =$appointment->classPlan->course_id;
                $data['course_name']    =$appointment->classPlan->course_name;
                $data['course_type']    =$appointment->classPlan->type;
                $data['shop_id']        =$appointment->shop->shop_id;
                $data['shop_name']      =$appointment->shop->shop_name;
                $comment = new model\Comment();
                $result = $comment->allowField(true)->data($data)->save();
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
            return error(Code::VALIDATE_ERROR, '没有找到该课程!');
        }
    }

    public function getList(){
        $model      = new model\Comment();
        $data       = input('');
        if(empty($data)){
            return error(Code::VALIDATE_ERROR, '参数错误!');
        }
        $pageNo     = input('page_no',1);
        $pageSize   = input('page_size',$this->pageSize);
        return $model->getList($this->merchant['mch_id'],$data,$pageNo,$pageSize);
    }
}
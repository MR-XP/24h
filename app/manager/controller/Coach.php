<?php

namespace app\manager\controller;

use app\manager\model;
use app\manager\validate;
use app\common\component\Code;

/**
 * 教练
 */
class Coach extends Base {

    public function getList() {
        $model = new model\Coach();
        $data = input('');
        $pageNo = input('page_no', 1);
        $pageSize = input('page_size', $this->pageSize);
        return $model->getList($this->mchId, $data, $pageNo, $pageSize);
    }

    public function search() {
        $model = new model\Coach();
        $data = input('');
        $limit = input('limit', 0);
        return success($model->search($this->mchId, $data, $limit));
    }

    public function save() {
        $coachModel = new model\Coach();
        $coachValidate = new validate\Coach();
        $userModel = new model\User();
        $memberValidate = new validate\Member();
        $data = $this->request->except(['credit', 'pre_paid', 'last_login_time', 'create_time', 'update_time']);
        $data['mch_id'] = $this->mchId;
        $user = model\User::get(['phone' => $data['phone']]);
        if ($user) {
            $data['user_id'] = $user['user_id'];
        }
        if (!$memberValidate->check($data)) {
            return error(Code::VALIDATE_ERROR, $memberValidate->getError());
        }
        $result = $userModel->addMember($this->mchId, [
            'phone'     => $data['phone'],
            'user_id'   => $data["user_id"],
            'real_name' => $data['real_name'],
            'sex'       => $data['sex'],
            'avatar'    => $data['avatar']
        ]);
        //先添加会员
        if ($result['code'] != Code::SUCCESS) {
            return $result;
        }
        $data['user_id'] = $result['data']['user_id'];
        $coachId = model\Coach::where(['user_id' => $data['user_id']])->value('coach_id');
        !$coachId && $coachId = 0;
        $data['coach_id'] = $coachId;
        if (!$coachValidate->check($data)) {
            return error(Code::VALIDATE_ERROR, $coachValidate->getError());
        }
        $data['coach_id'] > 0 && $coachModel->isUpdate(true);
        $coachModel->allowField(true)->data($data, true);
        $result = $coachModel->save();
        if ($result === false) {
            return error(Code::SAVE_DATA_ERROR);
        }
        return success($coachModel);
    }
    /**
     * 入驻申请列表
     * @return type
     */
    public function applicationList() {
        $model = new model\CoachApplication();
        $data = $this->request->param();
        $pageNo = input('page_no', 1);
        $pageSize = input('page_size', $this->pageSize);
        return $model->getList($this->mchId, $data, $pageNo, $pageSize);
    }
    
    /**
     * @return array
     */
    public function dispose() {
        $model = new model\CoachApplication();
        $id = $this->request->param('application_id');
        $status = $this->request->param('status');
        $data = $model->where(['mch_id' => $this->mchId, 'application_id' => $id, 'status' => model\CoachApplication::STATUS_WAITING])->find();
        if ($data && in_array($status, [model\CoachApplication::STATUS_ACCEPT, model\CoachApplication::STATUS_REFUSE])) {
            $data['status'] = $status;
            $data->save();
            if ($status == model\CoachApplication::STATUS_ACCEPT) {
                return $model->dispose($data);
            }
            return success('保存成功');
        } else {
            return error(Code::VALIDATE_ERROR, '参数错误');
        }
    }
    /**
     * 统计各个私教耗课情况
     */

}

<?php

namespace app\manager\controller;

use app\manager\model;
use app\manager\validate;
use app\common\component\Code;

/**
 * 权限管理
 */
class Auth extends Base {

    //节点列表
    public function ruleList() {
        return error(Code::VALIDATE_ERROR, '该功能暂时禁用');
        $model = new model\Rule();
        return success($model->getList(-1));
    }

    //保存节点
    public function ruleSave() {
        return error(Code::VALIDATE_ERROR, '该功能暂时禁用');
        $model = new model\Rule();
        $validate = new validate\Rule();
        $data = input('post.');
        if (!$validate->check($data)) {
            return error(Code::VALIDATE_ERROR, $validate->getError());
        }
        $data[$model->getPk()] > 0 && $model->isUpdate(true);
        $result = $model->data($data)->save();
        if ($result === false) {
            return error(Code::VALIDATE_ERROR, $model->getError());
        } else {
            return success($result);
        }
    }

    //用户组列表
    public function groupList() {
        $model = new model\Group();
        $ruleModel = new model\Rule();
        $result = $model->where('mch_id', $this->mchId)->select();
        foreach ($result as &$value) {
            $value['user_count'] = model\GroupAccess::where(['group_id' => $value['id']])->count();
        }
        $superRule = $this->mchId == 0 ? 1 : 0;
        return success(['group' => $result, 'rule' => $ruleModel->getList($superRule)]);
    }

    //保存用户组
    public function groupSave() {
        $model = new model\Group();
        $validate = new validate\Group();
        $data = input('post.');
        $data['mch_id'] = $this->mchId;
        if (!$validate->check($data)) {
            return error(Code::VALIDATE_ERROR, $validate->getError());
        }
        if (isset($data['id']) && $data['id'] > 0) {
            $model = $model->where('id', $data['id'])->find();
            if ($model->title == '管理员') { //管理员不允许修改
                unset($data['title']);
                $data['rules'] = array_merge($data['rules'], $model->rules);
                $data['rules'] = array_unique($data['rules']);
            }
        }
        $result = $model->data($data, true)->save();
        if ($result === false) {
            return error(Code::VALIDATE_ERROR, $model->getError());
        } else {
            return success($result);
        }
    }

    //用户列表
    public function userList() {
        $model = new model\User();
        $data = input('');
        $pageNo = input('page_no', 1);
        $pageSize = input('page_size', $this->pageSize);
        return $model->getAuthList($this->mchId, $data, $pageNo, $pageSize);
    }

    //用户管理
    public function userSave() {
        $model = new model\User();
        $validate = new validate\User();
        $exceptField = ['credit', 'pre_paid', 'last_login_time', 'create_time', 'update_time']; //排除字段
        $data = $this->request->except($exceptField);
        $group = $this->request->param('group/a'); //用户组id
        isset($data['user_id']) || $data['user_id'] = 0;
        isset($data['password']) || $data['password'] = '';
        if (empty($data['password'])) {
            unset($data['password']);
        }
        if ($data['user_id'] > 0) {
            $validate->scene('edit');
            $model->isUpdate(true);
        }
        if (!$validate->check($data)) {
            return error(Code::VALIDATE_ERROR, $validate->getError());
        }
        $model->allowField(true)->data($data, true);
        $result = $model->save();
        if ($result === false) {
            return error(Code::VALIDATE_ERROR, $model->getError());
        } else {
            //更新用户组
            $accessModel = new model\GroupAccess();
            $accessModel->delAllGroup($this->mchId, $model->user_id); //删除关联
            $accessModel->assignGroup($model->user_id, $group); //添加关联
            if ($this->mchId > 0) {
                $member = model\Member::get(['mch_id' => $this->mchId, 'user_id' => $model->user_id]);
                if (!$member) {
                    $member = model\Member::create([
                                'user_id' => $model->user_id,
                                'mch_id' => $this->mchId,
                                'phone' => $model->phone
                    ]);
                }
            }
            return success($result);
        }
    }

//更改密码
    public function changePassword() {
        $validate = new validate\User();
        $data = $this->request->only(['old_password', 'password', 'repassword']);
        $validate->scene('change');
        $user = session('admin');
        if (!$validate->check($data)) {
            return error(Code::VALIDATE_ERROR, $validate->getError());
        }
        $user = model\User::get($user['user_id']);
        $user->password = $data['password'];
        return success($user->save());
    }

}

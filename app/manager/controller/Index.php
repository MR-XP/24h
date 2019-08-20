<?php

namespace app\manager\controller;

use app\manager\model;
use app\manager\validate;
use app\common\component\Code;

class Index extends \think\Controller {

    public function index() {
        config('default_return_type', 'html');
        $user = session('admin');
        $nodes = $nodeIds = $rules = [];
        if ($user && isset($user['curr_mch_id'])) { //判断$user['curr_mch_id']，避免前台登录没有
            $auth = new \app\common\auth\Auth();
            $nodes = $auth->getAuthList($user['user_id'], $user['curr_mch_id'], 1);
            $groups = $auth->getGroups($user['curr_mch_id'], $user['user_id']);
            foreach ($groups as $value) {
                $arr = explode(',', $value['rules']);
                $nodeIds = array_merge($nodeIds, $arr);
            }
            array_unique($nodeIds);
            //列出节点
            $ruleModel = new model\Rule();
            $rules = $ruleModel->getList($user['curr_mch_id'] == 0 ? 1 : 0);
        }
        $this->assign('node_ids', json_encode($nodeIds));
        $this->assign('nodes', json_encode($nodes));
        $this->assign('rules', json_encode($rules));
        $this->assign('user', json_encode($user));
        $this->assign('base_url', 'http://' . config('url_domain_root'));
        $this->assign('static_domain', config('upload.static_domain'));
        return $this->fetch(ROOT_PATH . 'public/manager.html');
    }

    //用户登录
    public function login() {
        $data = \think\Request::instance()->param();
        $validate = new validate\UserLogin();
        $model = new model\User();
        if (!$validate->check($data)) {
            return error(Code::VALIDATE_ERROR, $validate->getError());
        } else {
            return $model->login($data['username']);
        }
    }

}

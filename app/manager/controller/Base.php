<?php

namespace app\manager\controller;

use think\Controller;
use app\common\component\Code;
use app\common\model\Group;
use think\Request;
use think\Response;
use think\exception\HttpResponseException;

abstract class Base extends Controller {

    protected $mchId = 0;
    protected $pageSize = 15;
    protected $user;

    public function __construct(Request $request = null) {
        if (is_null($request)) {
            $request = Request::instance();
        }
        $this->request = $request;
        $user = session('admin');

        //判断session是否过期
        if (empty($user)) {
            $result = error(Code::EMPTY_LOGIN_USER);
        } else {
            $this->mchId = $user['curr_mch_id'];
            $this->user = $user;
            $name = '/' . $this->request->module() . '/' . $this->request->controller() . '/' . $this->request->action();
            $group = new Group();
            //权限验证
            $result = $group->check($this->mchId, $user['user_id'], $name);
        }
        if ($result['code'] !== Code::SUCCESS) {
            $response = Response::create($result, 'json');
            throw new HttpResponseException($response);
        }
    }

}

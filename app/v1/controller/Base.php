<?php

namespace app\v1\controller;

use think\Controller;
use app\common\component\Code;
use think\Response;
use think\exception\HttpResponseException;

abstract class Base extends Controller {

    protected $merchant;
    protected $user;
    protected $member;
    protected $wxUser;
    protected $pageSize = 10;

    public function _initialize() {
        parent::_initialize();
        $domain = get_sub_domain();
        if (empty($domain)) {
            $this->returnError(error(Code::VALIDATE_ERROR, '错误的链接'));
        }
        if($domain =='192' || $domain == '127'){
            $domain = 'qcyd';
        }
        $merchant = \app\common\model\Merchant::get(['sub_domain' => $domain]);
        if (!$merchant) {
            $this->returnError(error(Code::VALIDATE_ERROR, '未知商户！'));
        }
        $this->merchant = $merchant;
        $this->user = session('user');
        $this->member = session('member');
        $this->wxUser = session('wx_user');
        if (!$this->user || !$this->member || !$this->wxUser) {
            $this->returnError(error(Code::EMPTY_LOGIN_USER));
        }
    }

    protected function returnError($json) {
        $response = Response::create($json, 'json');
        throw new HttpResponseException($response);
    }

}

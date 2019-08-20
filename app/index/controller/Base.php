<?php

namespace app\index\controller;

use think\Controller;
use app\common\component\Code;

abstract class Base extends Controller {

    protected $merchant;

    public function _initialize() {
        parent::_initialize();
        $domain = get_sub_domain();

        if($domain =='192' || $domain == '127'){
            $domain = 'qcyd';
        }
        if (empty($domain)) {
            $this->error('错误的链接！');
        }
        $merchant = \app\common\model\Merchant::get(['sub_domain' => $domain]);
        if (!$merchant && !in_array($_SERVER['SERVER_NAME'],Code::$webUrl) && !in_array($_SERVER['SERVER_NAME'],Code::$mobileUrl)) {
            $this->error('未知商户！');
        }
        $this->merchant = $merchant;
    }
    
}

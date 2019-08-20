<?php

namespace app\web\controller;

use app\common\model\Join;

class Index extends \think\Controller{

    public function index(){
        config('default_return_type', 'html');
        //$this->assign('base_url',config('url_domain_root'));
        return $this->fetch(ROOT_PATH.'public/static/pc/dist/web.html',[
            'base_url'  =>  config('url_domain_root')
        ]);
    }

    //加盟
    public function join(){
        $data = $this->request->param();
        $join = new join();
        return $join->add($data);
    }

}

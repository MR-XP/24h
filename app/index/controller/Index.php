<?php

namespace app\index\controller;

use app\index\controller\Base;
use app\common\component;
use app\common\model;
use app\common\component\Code;
use app\web\controller\Index as webIndex;
class Index extends Base {

    public function index() {

        //如果是PC端，加载官网
        if (in_array($_SERVER['SERVER_NAME'],Code::$webUrl)) {
            $webIndex = new webIndex();
            return $webIndex->index();
        }
        $baseUrl = 'http://' . $this->merchant->sub_domain . '.' . config('url_domain_root');
        //本地调试,指定夏培账号
        if (\think\Env::get('app_status') == 'local') {
            $member = model\Member::get(['user_id' => 4, 'mch_id' => $this->merchant->mch_id]);
            $user = model\User::get(4);
            session('user', $user->toArray());
            session('member', $member->toArray());
            session('wx_user', [
                'openid' => 'oaPJpv91bP9nPSHCpKWZA5kizexE',
                'unionid' => '',
            ]);
        }
        $user = session('user');
        $member = session('member');
        if (!$user) { //没有登录用户
            $wxUser = session('wx_user');
            if (!$wxUser) { //去ouah授权
                $url = component\WeChat::instance($this->merchant)->createOauthUrl("$baseUrl/index/open/wxauth");
                $this->redirect($url);
            }
            $member = model\Member::get(['open_id' => $wxUser['openid'], 'mch_id' => $this->merchant->mch_id]);
            if ($member) {
                $member = $member->toArray();
                session('member', $member);
                $user = model\User::get($member['user_id']);
                if ($user) {
                    unset($user['password']);
                    unset($user['username']);
                    $user = $user->toArray();
                    session('user', $user);
                }
            }
        }

        //权限节点
        $nodes = [];
        //用户组
        $groups = [];
        if ($user) {
            $auth = new \app\common\auth\Auth();
            $allNodes = $auth->getAuthList($user['user_id'], $this->merchant->mch_id, 1);
            $coach = model\Coach::get(['user_id' => $user['user_id'], 'mch_id' => $this->merchant->mch_id, 'status' => model\Coach::STATUS_ENABLE]);
            $coach && $groups[] = '教练';
            $saleman = model\Saleman::get(['user_id' => $user['user_id'],'mch_id' => $this->merchant->mch_id, 'status' => model\Saleman::STATUS_ENABLE]);
            $saleman && $groups[] = '销售';

            if (in_array('/v1/opendoor/open', $allNodes)) {
                $nodes[] = '/v1/opendoor/open';
            }
        }
        $this->assign('nodes', json_encode($nodes));
        $this->assign('groups', json_encode($groups));
        $this->assign('member', json_encode($member));
        $this->assign('user', json_encode($user));
        $this->assign('base_url', $baseUrl);
        $this->assign('static_domain', config('upload.static_domain'));

        $nowUrl = explode('.',$_SERVER['HTTP_HOST']);
        if($nowUrl[1] != '24h' && $nowUrl[1] != 'test24h'){
            return $this->fetch(ROOT_PATH . "public/mobile{$nowUrl[1]}.html");
        }
        return $this->fetch(ROOT_PATH . 'public/mobile.html');
    }


    //扫码开门
    public function openDoor() {
        $shopId = input('shop_id');
        $openType = strtoupper(input('open_type'));
        $alias = input('alias');
        $request = \think\Request::instance();
        if ($request->isAjax()) {
            $device = model\ShopDevice::get(['shop_id'=>$shopId,'device_alias'=>$alias]);
            if(!$device){
                return json(error(component\Code::DEVICE_NOT_FOUND));
            }
            if (!in_array($openType, ['SIGN', 'SIGNOUT'])) {
                return json(error(component\Code::PARAM_ERROR));
            }
            $model = new model\Qrcode();
            $result = $model->getOpenDoorQrcode($this->merchant, $device, $openType);
            if ($result['code'] == component\Code::SUCCESS) {
                $url = $result['data']['url'];
                $imgUrl = "https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=" . urlencode($result['data']['ticket']);
                return json(success(['url' => $url, 'image' => $imgUrl]));
            } else {
                return json($result);
            }
        } else {
            $this->assign('base_url', $request->domain());
            return $this->fetch(ROOT_PATH . 'public/qrcode.html');
        }
    }

    public function redirectUrl($id) {
        $url = model\RedirectUrl::where('id=' . $id)->value('url');
        if ($url) {
            $wxUser = session('wx_user');
            if ($wxUser) {
                $this->redirect($url);
            } else {
                session('return_url', $url);
                $this->redirect(\think\Request::instance()->domain());
            }
        } else {
            die('未知URL');
        }
    }

}

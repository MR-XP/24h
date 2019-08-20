<?php

namespace app\index\controller;

use app\common\component\sms\Sender;
use app\common\component\upload\Uploader;
use app\v1\model\UserModel;
use app\v1\model\CodeModel;
use app\v1\validate;
use app\common\component\Code;

class User extends Base {

    protected $wxUser;

    public function _initialize() {
        parent::_initialize();
        $this->wxUser = session('wx_user');
        if (!$this->wxUser) {
            return error(Code::EMPTY_LOGIN_USER);
        }
    }

    public function sign() {
        //数据
//        $data = input('post.');
//        //用户数据
//        $validate = new validate\UserSign();
//        $validate->check($data);
//        if (!$validate->check($data)) {
//            return error(Code::VALIDATE_ERROR, $validate->getError());
//        }
//        $this->checkCode($phone, $code);
//        $user['phone'] = $data['phone'];
//        $user['real_name'] = $data['real_name'];
//        $user['password'] = password($data['password']);
//        $model = new UserModel();
//        //判断用户是否添加
//        $is_user = $model->check_user(['phone' => $phone]);
//
//        if (!$is_user) {
//            //返回 user_id
//            $is_user['user_id'] = $model->add_user($user);
//        }
//        $user_id = $is_user['user_id'];
//        if ($user_id && empty($is_user['union_id'])) {
//            $user['create_time'] = date('Y-m-d H:i:s', time());
////            $user['nick_name'] = $this->wxUser['nickname'];
//            $user['city'] = $this->wxUser['city'];
//            $user['province'] = $this->wxUser['province'];
//            $user['country'] = $this->wxUser['country'];
//            $user['union_id'] = $this->wxUser['unionid'];
//            $user['avatar'] = $this->wxUser['headimgurl'];
//            // 更新数据
//            $model->update_user($user_id, $user);
//            unset($user);
//        }
//        $user = $this->getUserInfo();
//        session('user', $user);
//        $member = \app\common\model\Member::get(['user_id' => $user_id]);
//        if (!$member) {
//            $member['union_id'] = $this->wxUser['unionid'];
//            $member['open_id'] = $this->wxUser['unionid'];
//            $member['phone'] = $data['phone'];
//            $member['mch_id'] = $this->merchant['mch_id'];
//            $member['status'] = 1;
//            $member_id = \app\common\model\Member::create($member);
//        }
//        session('member', $member);
//        return success('注册成功');
    }
    /*
     * 获取验证码
     */

    public function sendCode() {
        $Sender = new Sender();
        $phone = input('get.phone');
        if (!preg_match("/1[34578]{1}\d{9}$/", $phone)) {
            return error(0, '手机号码错误');
        }
        $code = rand(100000, 999999);

        $model = new CodeModel();
        $check = $model->check_code($where);
        if (!$check) {
            $data = ['phone' => $phone, 'code' => $code, 'create_time' => date('Y-m-d H:i:s')];
            $res = $model->send_code($data);
            if ($res) {
                return $Sender->sendSms($phone, $code);
            }
        }
        if (time() - strtotime($check['create_time']) < 60) {
            return error(0, '两次发送时间过短');
        }
        $data = ['code' => $code];
        $res = $model->update_code($phone, $data);
        return $Sender->sendSms($phone, [$code]);
    }

    /*
     * 检验验证码
     */

    public function checkCode($phone, $code) {
        if (!preg_match("/1[34578]{1}\d{9}$/", $phone)) {
            return error(0, '手机号码错误');
        }
        $where = ['phone' => $phone, 'code' => $code];
        $model = new CodeModel();
        $check = $model->check_code($where);
        if (!$check) {
            return error(0, '验证码错误');
        }
        if (time() - strtotime($check['create_time']) > 60 * 3) {
            return error(0, '验证码已过期');
        }
    }

    /*
     * 获取用户详细资料
     */

    public function getUserInfo() {
        $User = new UserModel();
        $UserCard = new \app\v1\model\MemberCardModel();
        //用户信息
        $userinfo = $User->get_user_info($this->user['userid']);
        $userinfo['hope'] = explode(',', $userinfo['hope']);
        //用户卡
        $cards = $UserCard->get_cards($this->merchant['mch_id'], $this->user['userid']);

        if ($cards) {
            $userinfo['sold_card_id'] = $cards[0]['sold_card_id'];
            $userinfo['card_name'] = $cards[0]['card_name'];
        }
        if ($userinfo) {
            return success($userinfo);
        } else {
            return error(0, '参数错误');
        }
    }

    /*
     * 编辑用户详细资料
     */

    public function editUserInfo() {
        $sold_card_id = input('post.sold_card_id');
        $data = $this->data();
        $User = new UserModel();
        $UserCard = new \app\v1\model\MemberCardModel();
        $res = $User->update_user($this->user['userid'], $data);
        //设置默认会员卡
        if ($res) {
            $UserCard->set_card_default($this->user['userid'], $sold_card_id);
            $user_info = $this->getUserInfo();
            session('user', $user_info);
            return success('保存成功');
        } else {
            return error(0, '保存失败');
        }
    }

    public function data() {
        $userinfo['sex'] = input('post.sex') == '男' ? 1 : 2;
        $userinfo['height'] = input('post.height');
        $userinfo['weight'] = input('post.weight');
        $userinfo['birthday'] = input('post.birthday');
        $userinfo['update_time'] = date('Y-m-d H:i:s', time());
        $userinfo['hope'] = input('post.hope');
        $avatar = request()->file('avatar');
        if ($avatar) {
            $Upload = new Uploader();
            $info = $Upload->save($avatar);
            if ($info) {
                $userinfo['avatar'] = $info['data'];
            }
        }
        return $userinfo;
    }

}

<?php

namespace app\v1\controller;

use app\common\component\sms\Sender;
use app\common\component\upload\Uploader;
use app\v1\model\UserModel;
use app\v1\model\MemberModel;
use app\v1\model\CodeModel;
use app\v1\model\SalemanAchv;
use app\v1\validate;
use app\common\component\Code;
use think\Db;

class User extends \think\Controller {
    /*
     * 注册
     */

    protected $wxUser;
    protected $merchant;

    protected function _initialize() {
        parent::_initialize();
        $domain = get_sub_domain();
        if (empty($domain)) {
            return error(Code::VALIDATE_ERROR, '错误的链接');
        }
        $merchant = \app\common\model\Merchant::get(['sub_domain' => $domain]);
        if (!$merchant) {
            return error(Code::VALIDATE_ERROR, '未知商户！');
        }
        $this->merchant = $merchant;
        $this->wxUser = session('wx_user');
        $this->user = session('user');
    }

    //用户注册
    public function sign() {

        //验证是否关注
        if (empty($this->wxUser) || empty($this->wxUser['unionid'])){
            session('wx_user',null);
            session('user',null);
            return error(Code::VALIDATE_ERROR, '您还未关注公众号，请先关注后再注册。');
        }
        //数据
        $data = input('');
        //用户数据验证
        $validate = new validate\UserSign();
        if (!$validate->check($data)) {
            return error(Code::VALIDATE_ERROR, $validate->getError());
        }
        $checkCode = $this->checkCode($data['phone'], $data['code']);
        if($checkCode['code'] != 200){
            return $checkCode;
        }
        $user = UserModel::get(['phone' => $data['phone']]);
        if ($user && !empty($user->union_id) && $user->union_id != $this->wxUser['unionid']) {
            return error(Code::VALIDATE_ERROR, '手机号已被注册');
        }
        //是否为第一次注册,true为是
        $isRegister = false;

        Db::startTrans();
        try{
            //保存user表
            if (!$user) {
                $user = UserModel::create([
                    'real_name' => $data['real_name'],
                    'phone'     => $data['phone']
                ]);
                if ($user === false) {
                    Db::rollback();
                    return error(Code::SAVE_DATA_ERROR);
                }
            }

            //保存member表
            $member = MemberModel::get(['user_id' => $user->user_id, 'mch_id' => $this->merchant->mch_id]);
            if (!$member) {
                $isRegister = true;
                $member = MemberModel::create([
                    'user_id' => $user->user_id,
                    'mch_id' => $this->merchant->mch_id,
                    'phone' => $user->phone,
                ]);
                if($member === false){
                    Db::rollback();
                    return error(Code::SAVE_DATA_ERROR);
                }
            }

            //保存销售人员业绩表
            if(!empty($data['saleman_id'])){
                $saleData = SalemanAchv::create([
                    'mch_id'          =>  $this->merchant['mch_id'],
                    'saleman_id'      =>  $data['saleman_id'],
                    'user_id'         =>  $user->user_id,
                    'user_type'       =>  SalemanAchv::USERTYPE_REG
                ]);
                if($saleData === false){
                    Db::rollback();
                    return error(Code::SAVE_DATA_ERROR);
                }
            }

            //保存小细节
            if (empty($member->open_id) || empty($member->union_id)) {
                $member->open_id = $this->wxUser['openid'];
                $member->union_id = $this->wxUser['unionid'];
                $member->save();
                if($member === false){
                    Db::rollback();
                    return error(Code::SAVE_DATA_ERROR);
                }
            }
            if (empty($user->union_id)) {
                empty($user->nick_name) && $user->nick_name = $this->wxUser['nickname'];
                empty($user->avatar) && $user->avatar = $this->getImage($this->wxUser['headimgurl']);
                $user->union_id = $this->wxUser['unionid'];
                $user->real_name = $data['real_name'];
                $user->save();
                if($user === false){
                    Db::rollback();
                    return error(Code::SAVE_DATA_ERROR);
                }
            }

            Db::commit();
        }catch(\Exception $e){
            Db::rollback();
            return error(Code::VALIDATE_ERROR,'网络出错啦，请等一下再试试.');
        }

        $user = UserModel::get($user->user_id);
        if ($isRegister) {
            \think\Hook::listen('register', $member);
        }
        session('user', $user->toArray());
        session('member', $member->toArray());
        return success(['user' => $user, 'member' => $member, 'register' => $isRegister]);
    }

    /*
     * 获取验证码
     */

    public function sendCode() {
        $Sender = new Sender();
        $phone = input('post.phone');
        if (!preg_match("/1[23456789]{1}\d{9}$/", $phone)) {
            return error(0, '手机号码错误');
        }
        $code = rand(100000, 999999);

        $model = new CodeModel();
        //检验次数
        $count = $model->get_time_count($phone);
        if ($count >= 5) {
            return error(0, '今日验证码次数已用完啦');
        }
        // 保存数据
        $res = $model->add_code($phone, $code);
        if ($res) {
            // 发送验证码
            $result = $Sender->sendSms($phone, [$code]);
            if ($result['code'] == 200) {
                return success('发送成功');
            } else {
                return error(0, '今日验证码次数已用完啦');
            }
        }
    }

    /*
     * 检验验证码
     */

    public function checkCode($phone, $code) {
        if (!preg_match("/1[23456789]{1}\d{9}$/", $phone)) {
            return error(0, '手机号码错误');
        }
        $model = new CodeModel();
        $check = $model->check_code($phone);
        if (!$check || $check['code'] != $code) {
            return error(0, '验证码错误');
        }
        if (time() - strtotime($check['create_time']) > 60 * 3) {
            return error(0, '验证码已过期');
        }
        return success('');
    }

    /*
     * 获取用户详细资料
     */

    public function getUserInfo() {

        $User = new UserModel();
        $UserCard = new \app\v1\model\MemberCardModel();
        //用户信息
        $userinfo = $User->get_user_info($this->user['user_id']);
        if (!$userinfo) {
            return error(0, '参数错误');
        }

        $userinfo['hope'] = explode(',', $userinfo['hope']);
        // 用户卡
        $cards = $UserCard->get_cards($this->merchant['mch_id'], $this->user['user_id']);
        $userinfo['cards'] = $cards;
        //豆豆
        $member = \app\common\model\Member::get(['user_id' => $this->user['user_id']]);
        $userinfo['pre_paid'] = $member['pre_paid'];
        //签到次数
        $Sign = new \app\v1\model\SignModel();
        $userinfo['sign_count'] = $Sign->get_sign_count($this->user['user_id']);
        //加入倾城运动时间
        $userinfo['joinDay'] = ceil((time() - strtotime($userinfo['create_time'])) / 86400);

        return success($userinfo);
    }

    /*
     * 编辑用户详细资料
     */

    public function editUserInfo() {
        $sold_card_id = input('post.sold_card_id');
        $data = $this->data();
        $User = new UserModel();
        $UserCard = new \app\v1\model\MemberCardModel();
        $res = $User->update_user($this->user['user_id'], $data);
        //设置默认会员卡
        if ($res) {
            if ($sold_card_id) {
                $UserCard->set_card_default($this->user['user_id'], $sold_card_id);
            }
            $user_info = $this->getUserInfo();
            return success('保存成功');
        } else {
            return error(0, '保存失败');
        }
    }

    public function data() {
        $userinfo['sex'] = input('post.sex');
        $userinfo['height'] = input('post.height');
        $userinfo['weight'] = input('post.weight');
        $userinfo['birthday'] = input('post.birthday');
        $userinfo['update_time'] = date('Y-m-d H:i:s', time());
        $userinfo['hope'] = input('post.hope');
        $userinfo['avatar'] = input('post.avatar');
//        if (!empty($avatar)) {
//            $info = $this->base64_upload($avatar);
//            $userinfo['avatar'] = $info;
//        }
        return $userinfo;
    }

    /**
     * 获取远程图片
     * @param type $url
     * @return type
     */
    function getImage($url, $filename = '', $type = 1) {
        $ext = ".jpg"; //以jpg的格式结尾  
        $save_dir = ROOT_PATH . "/public/uploads/" . get_now_time('Ymd');
        if (trim($url) == '') {
            return array('file_name' => '', 'save_path' => '', 'error' => 0);
        }
        if (trim($save_dir) == '') {
            $save_dir = './';
        }
        if (trim($filename) == '') {//保存文件名 
            $filename = uniqid() . $ext;
        }
        if (0 !== strrpos($save_dir, '/')) {
            $save_dir .= '/';
        }
        //创建保存目录 
        if (!file_exists($save_dir) && !mkdir($save_dir, 0777, true)) {
            return error(0, '文件目录不存在');
        }
        //获取远程文件所采用的方法  
        if ($type) {
            $ch = curl_init();
            $timeout = 5;
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
            $img = curl_exec($ch);
            curl_close($ch);
        } else {
            ob_start();
            readfile($url);
            $img = ob_get_contents();
            ob_end_clean();
        }
        //$size=strlen($img); 
        //文件大小  
        $fp2 = @fopen($save_dir . $filename, 'a');
        fwrite($fp2, $img);
        fclose($fp2);
        unset($img, $url);
        return get_now_time('Ymd') . '/' . $filename;
    }

    /**
     * 头像上传
     */
    function base64_upload($upload) {
        $time = get_now_time('Ymd');
        $save_dir = ROOT_PATH . "/public/uploads/" . $time;
        $upload_image = str_replace(' ', '+', $upload);
        //post的数据里面，加号会被替换为空格，需要重新替换回来，如果不是post的数据，则注释掉这一行
        if (preg_match('/^(data:\s*image\/(\w+);base64,)/', $upload_image, $result)) {
            //匹配成功
            $ext = $result[2];
            if ($ext != 'gif' && $ext != 'jpg' && $ext != 'png' && $ext != 'jpeg') {
                return error(0, '图片格式不支持');
            }
            //文件名
            $image_name = uniqid() . '.' . $ext;

            $image_file = $save_dir . '/' . $image_name;
            //服务器文件存储路径
            if (file_put_contents($image_file, base64_decode(str_replace($result[1], '', $upload_image)))) {
                return $time . '/' . $image_name;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

}

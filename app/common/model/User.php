<?php

namespace app\common\model;

use app\common\component\Code;
use app\common\component\WeChat;

/**
 * 用户模型
 */
class User extends Base {

    protected $table = 'sys_user';
    protected $insert = ['create_time', 'update_time' => '0000-00-00 00:00:00'];
    protected $update = ['update_time'];
    protected $append = ['sex_text'];

    public function getSexTextAttr($value, $data) {
        return $data['sex'] == 0 ? '' : ($data['sex'] == 1 ? '男' : '女');
    }

    public function setCreateTimeAttr($value) {
        return get_now_time('Y-m-d H:i:s');
    }

    public function setUpdateTimeAttr($value) {
        return get_now_time('Y-m-d H:i:s');
    }

    public function setPasswordAttr($value) {
        return password($value);
    }

    //关注推送
    public function follow($merchant, $data){
        $wechat = WeChat::instance($merchant);
        return $wechat->buildReplyXml($data['ToUserName'], $data['FromUserName'], $this->pushText($merchant));
    }

    //推送内容
    public function pushText($merchant){
        $baseUrl    = 'http://' . $merchant->sub_domain . '.' . config('url_domain_root');
        $regUrl     = $baseUrl . '/#/users/index';
        $guideUrl   = "http://mp.weixin.qq.com/mp/homepage?__biz=MzI2NDAzNTY2Ng==&hid=3&sn=8d966a1446c633efaf5fd746171479a4&scene=18#wechat_redirect";

        $fastText   = "Hello,真高兴遇见你!\n\n倾城运动·家 24h智能健身房\n\n一人办卡,全家共享!\n\n快带家人一起来锻炼,享受美好健身时光\n";
        $reg        = "\n[1]新人免费锻炼<a href='" . $regUrl . "'>猛戳这里！</a>";
        $guide      = "\n[2]<a href='" . $guideUrl . "'>新人指南</a>";

        $lastText   = "\n\n如有任何问题,欢迎留言,也可以致电我们的客服热线:<a href='tel:15223161996'>15223161996</a>,我们会在第一时间为您解答。";

        return  $fastText.$reg.$guide.$lastText;
    }

}

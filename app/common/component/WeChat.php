<?php

namespace app\common\component;

use app\common\model\Qrcode;

/**
 * 微信组件
 */
class WeChat {

    use \traits\think\Instance;

    protected $appId;
    protected $appSecret;
    protected $appToken;
    protected $appAesKey;
    protected $accessToken;
    protected $accessExpireTime;
    protected $refreshToken;
    protected $jsTicket;
    protected $jsTicketExpireTime;
    protected $config;

    protected function __construct($config) {
        $this->config = $config;
        $this->appId = $config['app_id'];
        $this->appSecret = $config['app_secret'];
        $this->appToken = $config['app_token'];
        $this->appAesKey = $config['app_aes_key'];
        $this->accessToken = $config['access_token'];
        $this->accessExpireTime = $config['access_expire_time'];
        $this->refreshToken = $config['refresh_token'];
        $this->jsTicket = $config['js_ticket'];
        $this->jsTicketExpireTime = $config['js_ticket_expire_time'];
    }

    /**
     * 群发消息
     * https://mp.weixin.qq.com/wiki?action=doc&id=mp1481187827_i0l21&t=0.4271618307439706#4
     * @param array $toUser [openid,openid]
     * @param type $content 根据消息的类型不同，数据结构不同，参见微信文档
     * @param type $messageType  图文消息为mpnews，文本消息为text，语音为voice，音乐为music，图片为image，视频为video，卡券为wxcard
     * @return type
     */
    public function send($toUser, $content, $messageType = 'text') {
        $url = "https://api.weixin.qq.com/cgi-bin/message/mass/send?access_token={accessToken}";
        $data = [
            'touser' => $toUser,
            'msgtype' => $messageType,
            $messageType => $content,
        ];
        $data = json_encode($data, JSON_UNESCAPED_UNICODE);
        return $this->execute($url, 'post', $data);
    }

    /**
     * 生成授权URL
     * @param type $state
     * @return type
     */
    public function createOauthUrl($returnUrl, $scope = 'snsapi_base', $state = 123) {
        $backUrl = urlencode($returnUrl);
        $url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid={$this->appId}&redirect_uri=$backUrl&response_type=code&scope=$scope&state=$state#wechat_redirect";
        return $url;
    }

    /**
     * 获取用户accesstoken
     * @param type $code  授权回调的code
     * @return type
     */
    public function getUserAccessToken($code) {
        $url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid={$this->appId}&secret={$this->appSecret}&code=$code&grant_type=authorization_code";
        return $this->execute($url);
    }

    /**
     * 获取用户信息,通用
     * @param type $accessToken 用户的access token
     * @param type $openId
     * @return type
     */
    public function getUserInfo($accessToken, $openId) {
        $url = "https://api.weixin.qq.com/sns/userinfo?access_token=$accessToken&openid=$openId&lang=zh_CN";
        return $this->execute($url);
    }

    /**
     * 获取用户信息,公众号。与上面数据结构不一样
     * @param type $accessToken
     * @param type $openId
     * @return type
     */
    public function getMpUserInfo($openId) {
        $url = "https://api.weixin.qq.com/cgi-bin/user/info?access_token={accessToken}&openid=$openId&lang=zh_CN";
        return $this->execute($url);
    }

    /**
     * 被动回复 https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140543
     * @param type $from fromuser
     * @param type $to touser
     * @param type $params 附加参数，随回复类型变化
     * @param type $type 回复类型，见微信开发文档
     * @return string
     */
    public function buildReplyXml($from, $to, $params, $type = 'text') {
        $time = get_now_time();
        switch ($type) {
            case 'news'://图文消息
                break;
            default://默认文本消息
                $xml = "<xml>
                        <ToUserName><![CDATA[$to]]></ToUserName>
                        <FromUserName><![CDATA[$from]]></FromUserName>
                        <CreateTime>$time</CreateTime>
                        <MsgType><![CDATA[text]]></MsgType>
                        <Content><![CDATA[$params]]></Content>
                     </xml>";
                return $xml;
                break;
        }
    }

    /**
     * 生成二维码
     * @param type $mchId
     * @param type $type 1 永久，2临时
     * @return type
     */
    public function createQrcode($mchId, $type) {
        $sceneId = $this->createSceneId($mchId, $type);
        $url = "https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token={accessToken}";
        if ($type == Qrcode::TYPE_PERMANENT) { //永久
            $req = [
                'action_name' => 'QR_LIMIT_SCENE',
                'action_info' => ['scene' => ['scene_id' => $sceneId]]
            ];
        } else { //临时
            $req = [
                'expire_seconds' => 604800,
                'action_name' => 'QR_SCENE',
                'action_info' => ['scene' => ['scene_id' => $sceneId]]
            ];
        }
        $req = json_encode($req, JSON_UNESCAPED_UNICODE);
        $result = $this->execute($url, 'post', $req);
        if ($result['code'] == Code::SUCCESS) {
            $data = $result['data'];
            $data['scene_id'] = $sceneId;
            return success($data);
        } else {
            return $result;
        }
    }

    public function createSceneId($mchId, $type) {
        $model = new Qrcode();
        $maxId = $model->where(['mch_id' => $mchId, 'type' => $type])->order('create_time desc')->value('scene_id');
        if (!$maxId) {
            $maxId = $type == Qrcode::TYPE_PERMANENT ? 0 : 100000;
        }
        return $maxId + 1;
    }

    public function getAccessToken() {
        return \app\common\model\Merchant::where('mch_id', $this->config['mch_id'])->value('access_token');
    }

    public function getJsTicket() {
        return \app\common\model\Merchant::where('mch_id', $this->config['mch_id'])->value('js_ticket');
    }

    /**
     * 获取自定义菜单 
     * @return type
     */
    public function getMenu() {
        $url = 'https://api.weixin.qq.com/cgi-bin/menu/get?access_token={accessToken}';
        $result = $this->execute($url);
        if ($result['code'] == Code::SUCCESS) {
            return success($result['data']['menu']);
        } else {
            return $result;
        }
    }

    /**
     * 设置自定义菜单
     * @param json $data
     */
    public function setMenu($data) {
        $url = 'https://api.weixin.qq.com/cgi-bin/menu/create?access_token={accessToken}';
        return $this->execute($url, 'post', $data);
    }

    /**
     * 执行交互
     * @param type $url
     * @param type $method
     * @param type $data
     */
    public function execute($url, $method = 'get', $data = []) {
        $accessToken = $this->getAccessToken();
        $url = str_replace('{accessToken}', $accessToken, $url);
        try {
            $count = 0;
            while ($count < 2) {
                if ($method == 'get') {
                    $result = Http::instance()->get($url);
                } else {
                    $result = Http::instance()->post($url, $data);
                }
                $data = json_decode($result, true);
                if ($data) {
                    break;
                }
                $count++;
            }
            if (isset($data['errcode']) && $data['errcode'] != 0) {
                return error(Code::VALIDATE_ERROR, $data['errmsg']);
            }
            return success($data);
        } catch (\Exception $e) {
            return error(Code::VALIDATE_ERROR, $e->getCode() . $e->getMessage());
        }
    }

    /**
     * 验证推送消息
     * @param type $signature
     * @param type $timestamp
     * @param type $nonce
     * @return boolean
     */
    public function checkSignature($signature, $timestamp, $nonce) {
        $tmpArr = array($this->appToken, $timestamp, $nonce);
        sort($tmpArr, SORT_STRING);
        $tmpStr = implode($tmpArr);
        $tmpStr = sha1($tmpStr);
        if ($tmpStr == $signature) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * 获取签名包
     */
    public function getSignPackage() {
        $time = get_now_time();
        $data = [
            'noncestr' => generate_string(16),
            'jsapi_ticket' => $this->getJsTicket(),
            'timestamp' => $time,
            'url' => \think\Request::instance()->domain() . '/'
        ];
        $result = array_merge($data, ['signature' => $this->createJsapiSignature($data), 'appid' => $this->appId]);
        return success($result);
    }

    private function createJsapiSignature($data) {
        ksort($data);
        $temp = [];
        foreach ($data as $key => $value) {
            $temp[] = $key . '=' . $value;
        }
        $string = implode('&', $temp);
        return sha1($string);
    }

}

<?php

namespace app\common\component;

/**
 * 微信硬件组件
 */
class WeLot {

    use \traits\think\Instance;

    protected $config;

    protected function __construct($config) {
        $this->config = $config;
    }

    /**
     * 控制设备
     * @param type $req
     * @return type
     */
    public function ctrlDevice($req) {
        $url = "https://api.weixin.qq.com/hardware/mydevice/platform/ctrl_device?access_token={accessToken}";
        $req = json_encode($req, JSON_UNESCAPED_UNICODE);
        $result = $this->execute($url, 'post', $req);
        if ($result['code'] == Code::SUCCESS) {
            $data = $result['data'];
            return success($data);
        } else {
            return $result;
        }
    }

    public function getAccessToken() {
        return \app\common\model\Merchant::where('mch_id', $this->config['mch_id'])->value('access_token');
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
            if (isset($data['error_code']) && $data['error_code'] != 0) {
                return error(Code::VALIDATE_ERROR, $data['error_msg']);
            }
            return success($data);
        } catch (\Exception $e) {
            return error(Code::VALIDATE_ERROR, $e->getCode() . $e->getMessage());
        }
    }

}

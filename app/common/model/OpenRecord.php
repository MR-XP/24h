<?php

namespace app\common\model;

use think\Log;

/**
 * 开门记录
 */
class OpenRecord extends Base {

    protected $table = 'log_open_record';
    protected $insert = ['create_time'];

    const TYPE_IN = 1; //进门
    const TYPE_OUT = 2; //出门
    const OPEN_TYPE_MEMBER = 1; //会员开门
    const OPEN_TYPE_COACH = 2; //教练开门
    const OPEN_TYPE_MASTER = 3; //工作人员开门

    //北京EAD 门禁的 apiid 和 apikey
    const API_ID = "bl1889b17c057c381f"; //登录EAD 后台获取
    const API_KEY = "0e6502f6db40af88d9af185c45f4f463";

    //北京EAD 门禁的 token 获取api
    const GET_TOKEN_API = "https://api.parkline.cc/api/token";
    //北京EAD 锁继电器延迟设置
    const DOOR_DELAY_SET = "https://api.parkline.cc/api/devicecgi";

    protected $_type = [
        1 => '进门',
        2 => '出门',
    ];
    protected $_openType = [
        1 => '会员开门',
        2 => '教练开门',
        3 => '工作人员开门',
    ];

    public function setCreateTimeAttr($value) {
        return get_now_time('Y-m-d H:i:s');
    }

    public function getTypeTextAttr($value, $data) {
        return get_format_state($data['type'], $this->_type);
    }

    public function getOpenTypeTextAttr($value, $data) {
        return get_format_state($data['open_type'], $this->_openType);
    }

    /**
     * 开门
     * @param type $merchant 商户
     * @param type $shop 店铺
     * @param type $userId 用户id
     * @param type $type 进门出门 1进场，2出场
     * @param type $openType 开门方式 1会员开门，2教练开门，3工作人员开门
     * @param type $device 设备数据
     * @param type $signId 关联的签到记录
     */
    public function open($shop, $userId, $type, $openType, $device, $signId = 0) {
        $result = $this->save([
            'mch_id' => $shop['mch_id'],
            'shop_id' => $shop['shop_id'],
            'user_id' => $userId,
            'type' => $type,
            'open_type' => $openType,
            'sign_id' => $signId,
        ]);
        if (!$result) {
            return false;
        }
        return $this->openDoor($device);
    }

    public function openDoor($device) {
        if (\think\App::$debug || $device['auto_sign'] == 0) {
            return true;
        }
        switch ($device['device_from']){
            case 'self':            //自已的服务器
                $url = 'http://genhao.qcydj.com/?op=main';
                $data = [
                    'deviceid'      =>   $device['device_id'],
                    'cmd'           =>   'opendoor',
                ];
            break;
            case 'genhao':          //恒好接口
                $url = 'http://apis.igenhao.cn/api/Key/RemoteOpenDoor';
                $data = [
                    'DeviceId'      => $device['device_id'],
                    'PhoneNumber'   => $device['device_attach'],
                ];
            break;
        }
        try {
            $result = \app\common\component\Http::instance()->post($url, $data, null, null, 3);
            $result = json_decode($result, true);

            if ((isset($result['ErrorCode']) && $result['ErrorCode'] == 0) || (isset($result['status']) && $result['status'] == 1)) {
                return true;
            } else {
                Log::record(json_encode($data) . ' result:' . json_encode($result), 'door');
                return false;
            }

        } catch (\Exception $e) {
            Log::record(json_encode($data) . ' result:' . $e->getMessage(), 'door');
            return false;
        }
    }

    /**
     * @author lihongqiang
     * @desc EAD 门禁开门
     * @param $device
     * @return bool
     */
    public function openEadDoor($device = [])
    {
        /* if (\think\App::$debug || $device['auto_sign'] == 0) {
             return true;
         }*/
        $data = [];
        $tokenInfo = $this->getAccessToken();
        var_dump($tokenInfo);
        var_dump($tokenInfo["access_token"]);
        var_dump($tokenInfo["expires_in"]);
        //过期时间处理
        //if($tokenInfo["expires_in"]) {
            $data["token"] = $tokenInfo["access_token"];
            $data["devid"] = "110860"; //设备ID
            $data["typeid"] = "01"; //命令编号（取值01）
            $data["lockid"] = "01"; //锁编号（01-10）JSON返回示例

            try {
                $res = $this->curlRequest($data, self::DOOR_DELAY_SET);
                $result = json_decode($res, true);
                var_dump($result);exit('open_door');

                //错误代码处理
                if (isset($result['code']))
                {
                    Log::record(json_encode($data) . ' result:' . json_encode($result), 'ead_door');
                }
                return $result;
            }
            catch (\Exception $e)
            {
                Log::record(json_encode($data) . ' result:' . $e->getMessage(), 'ead_door');
                return [];
            }
        //}
        //else{
        //    return false;
        //}
    }

    /**
     * @desc 北京EAD 门禁CURL请求
     * @param $data
     * @param $apiurl
     * @param $acsurl
     * @return mixed|string
     */
    public function curlRequest($data, $apiurl)
    {
        header("Content-type: text/html; charset=utf-8");
        $ch = curl_init();
        $acsurl = "http://".$_SERVER['HTTP_HOST']; //动态获取请求地址
        $data = http_build_query($data);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0 );
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_URL, $apiurl);
        curl_setopt($ch, CURLOPT_REFERER,$acsurl);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        $data = curl_exec($ch);
        return $data;
    }

    /**
     * @author lihongqiang
     * @desc 获取 EAD Token
     */
    public function getAccessToken()
    {
        $data['apiid'] = self::API_ID;
        $data['apikey'] = self::API_KEY;
        try{
            $res = $this->curlRequest($data, self::GET_TOKEN_API);
            $result = json_decode($res, true);
            //$result = (array)$result;
            if(isset($result['code']))
            {
                Log::record(json_encode($data) . ' result:' . json_encode($result), 'ead_door');
            }
            return $result;
        }
        catch (\Exception $e)
        {
            Log::record(json_encode($data) . ' result:' . $e->getMessage(), 'ead_door');
            return [];
        }
    }

}

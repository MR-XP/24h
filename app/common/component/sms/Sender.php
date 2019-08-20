<?php

namespace app\common\component\sms;

class Sender {

    use \traits\think\Instance;

    public function sendSms($phone, $datas, $tplId = 0) {
        $sender = config('sms.sender');
        $config = config('sms.' . $sender);
        $sender = empty($config) ? new $sender() : new $sender($config);
        return $sender->sendSms($phone, $datas, $tplId);
    }
    
}

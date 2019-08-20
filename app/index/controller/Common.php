<?php

namespace app\index\controller;

use app\index\controller\Base;
use app\common\component\upload\Uploader;
use think\Request;
use app\common\component\Code;

class Common extends \think\Controller {

    public function upload() {
        $file = request()->file('file');
        if ($file) {
            return json(Uploader::instance()->save($file));
        } else {
            return json(error(\app\common\component\Code::EMPTY_UPLOAD_FILE));
        }
    }

    public function uploadByString() {
        $request = Request::instance();
        if (!empty($request->param('data')) && !empty($request->param('filename'))) {
            $tempFile = tempnam(sys_get_temp_dir(), uniqid());
            $fp = @fopen($tempFile, "w");
            @fwrite($fp, base64_decode($request->param('data')));
            fclose($fp);
            $fileArray = [
                'name' => $request->param('filename'),
                'type' => get_mime_type(pathinfo($request->param('filename'), PATHINFO_EXTENSION)),
                'tmp_name' => $tempFile,
                'size' => abs(filesize($tempFile)),
                'base64' => true, //指定是base64传回来的文件
            ];
            $file = (new \think\File($fileArray['tmp_name']))->setUploadInfo($fileArray);
            if ($file) {
                return json(Uploader::instance()->save($file));
            } else {
                return json(error(\app\common\component\Code::EMPTY_UPLOAD_FILE));
            }
        } else {
            return json(error(Code::PARAM_ERROR));
        }
    }

    public function captcha() {
        $captcha = new \think\captcha\Captcha();
        $captcha->length = 4;
        $captcha->useCurve = false;
        return $captcha->entry();
    }

}

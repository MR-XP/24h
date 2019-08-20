<?php

namespace app\common\component\upload;

class Uploader {

    use \traits\think\Instance;

    //保存文件,返回相对路径
    public function save($file) {
        $uploader = config('upload.uploader');
        $uploader = new $uploader();
        return $uploader->save($file);
    }

}

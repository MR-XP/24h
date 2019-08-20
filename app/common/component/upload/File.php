<?php

namespace app\common\component\upload;

use app\common\component\Code;

class File {

    public function save($file) {
        $config = config('upload.config');
        $filePath = date('Ymd');
        $path = ROOT_PATH . 'public' . DS . 'uploads' . DS . $filePath;
        !is_dir($path) && mkdir($path);
        $file->rule($config['rule'])->validate(['size' => $config['size'], 'ext' => $config['ext']]);
        if ($file->getInfo('base64') == true) { //BASE64生成的文件不能用move方法
            if ($file->check()) {
                $fileName = uniqid() . '.' . pathinfo($file->getInfo('name'), PATHINFO_EXTENSION);
                $path = $path . DS . $fileName;
                if (copy($file->getInfo('tmp_name'), $path)) {
                    return success($filePath . '/' . $fileName);
                } else {
                    return error(Code::VALIDATE_ERROR, '保存文件失败！');
                }
            } else {
                return error(Code::VALIDATE_ERROR, $file->getError());
            }
        } else {
            $info = $file->move($path);
            if ($info) {
                return success($filePath . '/' . $info->getSaveName());
            } else {
                return error(Code::VALIDATE_ERROR, $file->getError());
            }
        }
    }

}

<?php

namespace app\manager\controller;

use app\manager\model;
use app\manager\validate;
use app\common\component\Code;

/**
 * 会员
 */
class User extends Base {

    //获取会员列表
    public function getList() {
        $model = new model\User();
        $data = input('');
        $pageNo = input('page_no', 1);
        $pageSize = input('page_size', $this->pageSize);
        return $model->getList($this->mchId, $data, $pageNo, $pageSize);
    }

    //获取会员列表第二版
    public function getListTwo() {
        $model = new model\User();
        $data = input('');
        $pageNo = input('page_no', 1);
        $pageSize = input('page_size', $this->pageSize);
        return $model->getListTwo($this->mchId, $data, $pageNo, $pageSize);
    }

    //过期会员查询
    public function expireMember(){
        $data = input('');
        $model = new model\User();
        $pageNo = input('page_no',1);
        $pageSize = input('page_size',$this->pageSize);
        return $model->expireMember($this->mchId, $data, $pageNo, $pageSize);
    }

    //查询会员，可用于auto complete 组件
    public function search() {
        $model = new model\User();
        $data = input('');
        $limit = input('limit', 0);
        return success($model->search($this->mchId, $data, $limit));
    }

    //管理会员
    public function save() {
        $model = new model\User();
        $validate = new validate\Member();
        $exceptField = ['credit', 'pre_paid', 'last_login_time', 'create_time', 'update_time']; //排除字段
        $data = $this->request->except($exceptField);
        isset($data['user_id']) || $data['user_id'] = 0;
        if (!$validate->check($data)) {
            return error(Code::VALIDATE_ERROR, $validate->getError());
        }
        return $model->addMember($this->mchId, $data);
    }

    //锁定会员
    public function changeStatus() {
        $data = $this->request->param();
        $member = model\Member::get(['user_id' => $data['user_id']]);
        $member->status = $data['status'];
        return success($member->save());
    }

    //会员详情
    public function info() {
        $userId = $this->request->param('user_id');
        $user = model\User::get(['user_id' => $userId]);
        $member = model\Member::get(['user_id' => $userId, 'mch_id' => $this->mchId]);
        if (!$user || !$member) {
            return error(Code::USER_NOT_FOUND);
        }
        if($user['birthday']=='0000-00-00'){
            $user['age']=0;
        }else{
            $user['age']=date('Y',time())-date('Y',strtotime($user['birthday']));
        }

        $user['detail'] = $member;
        $user['card'] = (new model\SoldCard())->getUserCards($this->mchId, $userId);
        return success($user);
    }

    //备注列表
    public function noteList() {
        $data = $this->request->param();
        $model = new model\MemberNote();
        $data = input('');
        $pageNo = input('page_no', 1);
        $pageSize = input('page_size', $this->pageSize);
        return $model->getList($this->mchId, $data, $pageNo, $pageSize);
    }

    //保存备注
    public function noteSave() {
        $model = new model\MemberNote();
        $validate = new validate\MemberNote();
        $exceptField = ['note_id', 'create_time']; //排除字段
        $data = $this->request->except($exceptField);
        $data['create_by'] = $this->user['user_id'];
        $data['mch_id'] = $this->mchId;
        if (!$validate->check($data)) {
            return error(Code::VALIDATE_ERROR, $validate->getError());
        }
        $result = $model->data($data)->save();
        if ($result === false) {
            return error(Code::SAVE_DATA_ERROR);
        }
        return success($model->toArray());
    }

    //导出会员数据保存
    public function exportUserData() {
        set_time_limit(0);
        $model  = new model\User();
        $data  = input('');

        if($data['address'] == 'getListTwo'){       //会员列表导出
            session('userExcel',$model->getListTwo($this->mchId, $data, 0, 0,null,2));
        }
        if($data['address'] == 'expireMember'){     //过期会员，即将过期会员导出
            session('userExcel',$model->expireMember($this->mchId, $data, 0, 0,2));
        }
        if($data['address'] == 'reportList'){       //注册会员导出
            session('userExcel',(new model\Member())->reportList($this->mchId, $data, 0, 0,2));
        }
        if($data['address'] == 'buyCardUser'){      //购卡会员导出
            session('userExcel',(new model\Member())->buyCardUser($this->mchId, $data, 0, 0,2));
        }
        
        if(session('userExcel')){
            return success('');
        }else{
            return error(0,'导出失败');
        }
    }

    //导出会员数据提取
    public function exportUser(){
        $name = $this->request->get('name');
        export_excel(session('userExcel'), $name);
    }

    //导入会员
    public function importUser() {
        $file = $this->request->file('file');
        if ($file) {
            $info = $file->rule('uniqid')
                    ->validate(['size' => 1024 * 1024 * 5, 'ext' => 'xls,xlsx'])
                    ->move(LOG_PATH);
            if ($info) {
                $saveName = $info->getSaveName();
                $saveName = LOG_PATH . $saveName;
                $userModel = new model\User();
                return $userModel->importUser($this->mchId, $saveName);
            } else {
                return error(Code::VALIDATE_ERROR, $file->getError());
            }
        } else {
            return error(Code::EMPTY_UPLOAD_FILE);
        }
    }

    //统计列表
    public function reportList() {
        $model = new model\Member();
        $data = $this->request->param();
        isset($data['card_status']) || $data['card_status'] = 0;
        if (!empty($data['start_time']) && empty($data['end_time'])) {
            $data['start_time'] = get_now_time('Y-m-d') . ' 00:00:00';
            $data['end_time'] = get_now_time('Y-m-d') . ' 23:59:59';
        }
        $pageNo = input('page_no', 1);
        $pageSize = input('page_size', $this->pageSize);
        return $model->reportList($this->mchId, $data, $pageNo, $pageSize);
    }

    //购卡会员统计
    public function buyCardUser(){
        $model      =   new model\Member();
        $data       =   input('');
        $pageNo     =   input('page_no',1);
        $pageSize   =   input('page_size',$this->pageSize);
        return $model->buyCardUser($this->mchId,$data,$pageNo,$pageSize);
    }

    //直接修改会员卡有效期
    public function changeCardTime() {
        $soldCardId = $this->request->param('sold_card_id');
        $soldCard = model\SoldCard::get(['sold_card_id' => $soldCardId, 'active' => model\SoldCard::ACTIVE_ENABLE]);
        $expireTime = $this->request->param('expire_time');
        $useTimes = $this->request->param('use_times', 0);
        $times = $this->request->param('times',$soldCard['times']);

        if (!$soldCard || empty($expireTime)) {
            return error(Code::VALIDATE_ERROR, '参数错误');
        }
        if (strtotime($expireTime) <= get_now_time()) {
            return error(Code::VALIDATE_ERROR, '结束时间不能小于今天');
        }
        $soldCard['use_times'] = $useTimes;
        $soldCard['times'] = $times;
        $soldCard['expire_time'] = date('Y-m-d H:i:s', strtotime($expireTime));
        $soldCard->save();
        return success($soldCard);
    }

    //激活会员卡
    public function activeCard() {
        $soldCardId = $this->request->param('sold_card_id');
        $shopId = $this->request->param('shop_id');
        $shop = model\Shop::get(['shop_id' => $shopId, 'status' => model\Shop::STATUS_ENABLE]);
        $card = model\SoldCard::get(['sold_card_id' => $soldCardId, 'active' => model\SoldCard::ACTIVE_DISABLE]);
        if (!$shop || !$card) {
            return error(Code::VALIDATE_ERROR, '参数错误');
        }
        $card['active'] = 1;
        $card['active_shop_id'] = $shopId;
        $card['start_time'] = get_now_time('Y-m-d H:i:s');
        $card['expire_time'] = date('Y-m-d H:i:s', get_now_time() + 86400 * $card['days']);
        if ($card->save() !== false) {
            return success($card);
        } else {
            return error(Code::SAVE_DATA_ERROR);
        }
    }

    //购课列表
    public function soldCourseList() {
        $data = $this->request->param();
        $model = new model\SoldCourse();
        $pageNo = input('page_no', 1);
        $pageSize = input('page_size', $this->pageSize);
        return $model->getList($this->mchId, $data, $pageNo, $pageSize);
    }

    public function manageSoldCourse() {
        $soldCourseId = $this->request->param('sold_course_id');
        $expireTime = $this->request->param('expire_time');
        $buyNum = $this->request->param('buy_num');
        $useNum = $this->request->param('use_num');
        $soldCourse = model\SoldCourse::get(['sold_course_id' => $soldCourseId]);
        if (!$soldCourse) {
            return error(Code::VALIDATE_ERROR, '参数错误');
        } else {
            $soldCourse['use_num'] = $useNum;
            $soldCourse['expire_time'] = $expireTime;
            $soldCourse['buy_num']=$buyNum;
            $soldCourse->save();
            return success($soldCourse);
        }
    }

    //子成员查询
    public function getSubMember(){
        $data = input('');
        $model = new model\User();
        if(empty($data['user_id'])){
            return error(Code::VALIDATE_ERROR,'没有提交主卡人的ID');
        }
        if(empty($data['sold_card_id'])){
            return error(Code::VALIDATE_ERROR,'没有提交购卡ID');
        }
        return success($model->getSubMember($data,$this->mchId));
    }

    //添加成员
    public function addMember(){
        $data   = input('');
        if(empty($data['phone'])){
            return error(Code::VALIDATE_ERROR,'电话号码无效');
        }
        if(empty($data['sold_card_id'])){
            return error(Code::VALIDATE_ERROR,'没有提交购卡ID');
        }
        $model  = new model\SoldCardUser();
        return $model->addMember($this->mchId,$data);
    }

    //删除成员
    public function delSoldCardUser(){
        $data   = input('');
        if(empty($data['user_id'])){
            return error(Code::VALIDATE_ERROR,'没有提交会员ID');
        }
        if(empty($data['sold_card_id'])){
            return error(Code::VALIDATE_ERROR,'没有购卡ID');
        }
        $model  = new model\SoldCardUser();
        return $model->delSoldCardUser($this->mchId,$data);
    }

}

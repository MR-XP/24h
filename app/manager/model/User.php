<?php

namespace app\manager\model;

use app\common\model;
use app\common\component\Code;
use think\Db;

/**
 * 用户模型
 */
class User extends model\User {

    public function getList($mchId, $params, $pageNo, $pageSize, $search = ['order' => 'create_time desc']) {
        $cardModel=new SoldCard();
        $where = [];

        //姓名
        !empty($params['username']) && $where['username|real_name'] = array('like', "%{$params['username']}%");
        //电话
        !empty($params['phone']) && $where['phone'] = array('like', "%{$params['phone']}%");
        //状态
        isset($params['status']) ? $where['status'] = $params['status'] : $where['status'] = ['neq', self::STATUS_DELETED];

        //商户只能查询自己的
        if ($mchId > 0) {
            $where['user_id'] = array('in', function($query) use($mchId) {
                    $query->table('mch_member')->where('mch_id', $mchId)->field('user_id');
            });
        }

        //查询购卡会员
        if (isset($params['card_status']) && $params['card_status'] != '') {
            $subQuery = "(select count(*) from mch_sold_card_user where mch_sold_card_user.user_id = sys_user.user_id)";
            if ($params['card_status'] == 1) {
                $where[''] = ['exp', $subQuery . ' > 0 '];
            } else {
                $where[''] = ['exp', $subQuery . ' = 0 '];
            }
        }

        //单独查询会员卡Id
        if(!empty($params['card_id'])){
            $userIds=$cardModel->getUserByCardId($mchId,$params['card_id'],$params);
            if($userIds!=''){
                $where['user_id']=array('in',$userIds);
            }else{
                $list=[];
                return success($list);
            }
        }

        //分页
        $totalResults = $this->where($where)->where(['username' => ['neq', config('app_super_admin')]])->count();
        $totalPages = ceil($totalResults / $pageSize);

        //合成列表
        $list = $this->where($where)->where(['username' => ['neq', config('app_super_admin')]])->page($pageNo, $pageSize)->order($search['order'])->select();

        //所有主卡会员总数
        $soldCard = new model\SoldCard();
        if (isset($params['card_status']) && $params['card_status'] != 0 && empty($params['card_id']))
            $totalMaster = $soldCard->group('user_id')->count();
        else
            $totalMaster = 0;

        //所有购卡会员总数(包括绑卡的子成员)
        $soldCardUser = new \app\v1\model\SoldCardUser();
        if (isset($params['card_status']) && $params['card_status'] != 0 && empty($params['card_id']))
            $totalArr = $soldCardUser->group('user_id')->count();
        else
            $totalArr = 0;

        //附加数据
        $sign = new Sign();
        foreach ($list as $value) {

            //签到次数
            $value['sign_count'] = $sign->getSignCount($mchId, 0, $value['user_id']);
            //年龄
            if($value['birthday']=='0000-00-00'){
                $value['age']=0;
            }else{
                $value['age']=date('Y',time())-date('Y',strtotime($value['birthday']));
            }

            //子成员
            $allCard = SoldCard::all(['user_id' => $value->user_id]);
            $arr = [];
            foreach ($allCard as $val){
                $params = ['sold_card_id' => $val->sold_card_id,'user_id' => $val->user_id];
                $arr[$val->card_name] = $soldCardUser->getMember($params,['type' => 2]);
            }
            $value['subUser'] = $arr;

        }

        return success([
            'list' => $list,
            'page_no' => $pageNo,
            'page_size' => $pageSize,
            'total_pages' => $totalPages,
            'total_results' => $totalResults,
            'total_master' => $totalMaster,
            'total_arr'   => $totalArr
        ]);
    }

    public function getListTwo($mchId, $params, $pageNo, $pageSize, $search = ['order' => 'create_time desc'],$type = 1) {

        $where = [
            'username'    =>  ['NEQ',config('app_super_admin')]   //过滤管理员账号
        ];
        //姓名
        !empty($params['username']) && $where['username|real_name'] = array('like', "%{$params['username']}%");
        //电话
        !empty($params['phone']) && $where['phone'] = array('like', "%{$params['phone']}%");
        //商户下的会员查询
        if ($mchId > 0) {
            $members = Member::where(['mch_id' => $mchId])->column('user_id');
        }

        $users = [];

        //有效会员查询类型
        $orderWhere = [
            'pay_status'    =>  Order::PAY_STATUS_COMPLETED,
            'status'        =>  self::STATUS_ENABLE,
            'mch_id'        =>  $mchId,
            'type'          =>  Order::TYPE_BUY_CARD,            //会员卡
            'user_id'       =>  ['IN',$members]
        ];

        //会员卡查询
        if(!empty($params['card_id'])){
            $orderWhere['product_id'] = $params['card_id'];
        }
        $order = new Order();
        $order->where($orderWhere)
              ->group('user_id');

        //区域查询
        if(!empty($params['group_id'])){
            $orders = $order->field('user_id,shop_id')
                            ->select();
            //查询场馆
            $shops = [];
            $group = ShopGroup::get($params['group_id']);
            foreach ($group['shops'] as $val){
                $shops[] = intval($val);
            }
            //验证场馆
            foreach ($orders as $val){
                if(in_array($val['shop_id'],$shops)){
                    $users[]= $val['user_id'];
                }
            }
        }else{
            $users = $order->column('user_id');
        }

        //会员类型查询
        if(!empty($params['status'])){
            $nowUsers = [];
            $soldcard = new SoldCard();
            $soldcard->alias('a')
                ->join('mch_sold_card_user b','b.sold_card_id = a.sold_card_id')
                ->where([
                    'a.expire_time' =>  [['GT',date('Y-m-d H:i:s')],['EQ','0000-00-00 00:00:00'],'OR'],
                    'a.times'       =>  [['EQ',0],['GT','a.use_times'],'OR'],
                    'a.card_id'     =>  ['NEQ',8]           //过滤赠送会员卡
                ]);

            if(!empty($params['card_id'])){
                $soldcard->where([
                    'a.card_id'     =>  [['NEQ',8],['EQ',$params['card_id']],'AND']
                ]);
            }

            //有效会员
            if($params['status'] == 1){
                $nowUsers = $soldcard
                    ->where([
                        'a.user_id'     =>  ['IN',$users]
                    ])
                    ->group("b.user_id")
                    ->column('b.user_id');
                $where['user_id'] = ['IN',$nowUsers];
            }

            //主卡会员
            if($params['status'] == 2){
                $nowUsers = $soldcard
                    ->where([
                        'a.user_id'     =>  ['IN',$users]
                    ])
                    ->group("a.user_id")
                    ->column('a.user_id');
                $where['user_id'] = ['IN',$nowUsers];
            }

            //无卡会员（包括过期会员)
            if($params['status'] == 3){
                $nowUsers = $soldcard
                    ->where([
                        'a.user_id'     =>  ['IN',$members]
                    ])
                    ->group("b.user_id")
                    ->column('b.user_id');
                $where['user_id'] = ['NOT IN',$nowUsers];
            }

            unset($soldcard);
        }

        //如果是要导出会员，这里就结束并返回了
        if($type == 2){
            $list = $this
                ->where($where)
                ->order($search['order'])
                ->select();

            $result = [];
            foreach ($list as $val){
                $data = [];
                $data['姓名'] = $val['real_name'];
                $data['电话'] = $val['phone'];
                $data['性别'] = $val['sex_text'];
                $data['注册时间'] = $val['create_time'];

                $nowSoldCard = SoldCardUser::alias('a')
                    ->join('mch_sold_card b','b.sold_card_id = a.sold_card_id')
                    ->where([
                        'a.user_id'     =>  $val['user_id'],
                        'a.is_default'  =>  SoldCardUser::USER_IS_DEFAULT
                    ])
                    ->field('b.*')
                    ->find();

                if(!$nowSoldCard){
                    $data['当前默认卡']      = '无';
                    $data['购买时间']        = '无';
                    $data['是否激活']        = '无';
                    $data['会员卡类型']      = '无';
                    $data['总次数']          = '无';
                    $data['使用次数']        = '无';
                    $data['有效开始日期']    = '无';
                    $data['有效结束日期']    = '无';
                }else{
                    $data['当前默认卡']      = $nowSoldCard['card_name'];
                    $data['购买时间']        = $nowSoldCard['create_time'];
                    $data['是否激活']        = $nowSoldCard['active'] == 0?'未激活':'已激活';
                    $data['会员卡类型']      = $nowSoldCard['type'] == 1?'时间卡':'次数卡';
                    $data['总次数']          = $nowSoldCard['times'];
                    $data['使用次数']        = $nowSoldCard['use_times'];
                    $data['有效开始日期']    = $nowSoldCard['start_time'];
                    $data['有效结束日期']    = $nowSoldCard['expire_time'];
                }
                $result[] = $data;
            }
            return $result;
        }

        //列表
        $list = $this
            ->where($where)
            ->page($pageNo, $pageSize)
            ->order($search['order'])
            ->select();

        //分页
        $totalResults = $this->where($where)->count();
        $totalPages = ceil($totalResults / $pageSize);

        //附加数据
        $sign = new Sign();
        $soldCardUser = new \app\v1\model\SoldCardUser();
        foreach ($list as $value) {
            //签到次数
            $value['sign_count'] = $sign->getSignCount($mchId, 0, $value['user_id']);
            //年龄
            if($value['birthday']=='0000-00-00'){
                $value['age']=0;
            }else{
                $value['age']=date('Y',time())-date('Y',strtotime($value['birthday']));
            }
            //子成员
            $allCard = SoldCard::all(['user_id' => $value->user_id]);
            $arr = [];
            foreach ($allCard as $val){
                $params = ['sold_card_id' => $val->sold_card_id,'user_id' => $val->user_id];
                $arr[$val->card_name] = $soldCardUser->getMember($params,['type' => 2]);
            }
            $value['subUser'] = $arr;
        }

        return success([
            'list' => $list,
            'page_no' => $pageNo,
            'page_size' => $pageSize,
            'total_pages' => $totalPages,
            'total_results' => $totalResults,
        ]);
    }

    public function expireMember($mchId,$params,$pageNo,$pageSize,$type = 1){

        $where = [
            'a.mch_id'        =>  $mchId,
            'a.card_id'       =>  ["NEQ",8],        //过滤赠送卡
            'a.active'        =>  SoldCard::ACTIVE_ENABLE,
            'a.status'        =>  self::STATUS_ENABLE,
            'c.pay_status'    =>  Order::PAY_STATUS_COMPLETED,
            'c.status'        =>  Order::STATUS_ENABLE,
        ];
        !empty($params['name']) && $where['b.username|b.real_name'] = ['like',"%{$params['name']}%"];
        !empty($params['phone']) && $where['b.phone'] = ['like',"%{$params['phone']}%"];
        !empty($params['shop_id']) && $where['c.shop_id'] = $params['shop_id'];

        $order = "a.expire_time desc";
        $field = [
            "a.sold_card_id","a.card_id","a.card_name","a.start_time","a.expire_time","a.create_time","a.price","a.times","a.use_times",
            "b.user_id","b.real_name","b.avatar","b.phone","b.sex"
        ];

        if($params['user_type'] == 1){      //过期会员
            $where['a.expire_time'] = ['LT',date('Y-m-d H:i:s')];
        }
        if($params['user_type'] == 2){      //即将过期会员
            $where['a.expire_time'] = [
                ['GT',date('Y-m-d H:i:s')],
                ['ELT',date('Y-m-d H:i:s',time() + 86400 * 30)],
                'AND'
            ];
            $order = "a.expire_time asc";
        }
        if($params['user_type'] == 3){      //用完次卡会员
                $where['a.type']      = Card::TYPE_COUNT;
                $where[''] = ['EXP','a.use_times >= a.times'];
        }
        if($params['user_type'] == 4){      //即将用完次卡会员
            $where['a.type']  = Card::TYPE_COUNT;
            $where[''] = ['EXP','(a.use_times < a.times) and (a.use_times + 3) >= a.times'];
        }

        $soldCard = new SoldCard();
        $soldCard->alias('a')
            ->join('sys_user b','b.user_id = a.user_id')
            ->join('sys_order c','c.user_id = a.user_id')
            ->where($where)
            ->group("a.sold_card_id");
        $query = clone $soldCard->getQuery();

        //如果是导出，到这里就结束并返回了
        if($type == 2){
            $list = $query
                ->order($order)
                ->field($field)
                ->select();
            $result = [];
            foreach ($list as $val){
                $data = [];
                $data['会员名']   = $val['real_name'];
                $data['电话']     = $val['phone'];
                $data['会员卡']   = $val['card_name'];
                $data['价格']     = $val['price'];
                $data['购卡时间(导入时间)'] = $val['create_time'];
                $data['激活时间'] = $val['start_time'];
                if($params['user_type'] == 1 || $params['user_type'] == 2){
                    $data['过期时间'] = $val['expire_time'];
                }
                if($params['user_type'] == 3 || $params['user_type'] == 4){
                    $data['使用次数/总次数'] = $val['use_times'].'/'.$val['times'];
                }
                $result[] = $data;
            }
            return $result;
        }

        $list = $query
            ->page($pageNo, $pageSize)
            ->order($order)
            ->field($field)
            ->select();

        //分页
        $totalResults = $soldCard->count();
        $totalPages = ceil($totalResults / $pageSize);
        return page_result($list, $pageNo, $pageSize, $totalResults, $totalPages);
    }

    public function getAuthList($mchId, $params, $pageNo, $pageSize, $search = ['order' => 'create_time desc']) {
        $where = [];
        !empty($params['username']) && $where['username|real_name'] = array('like', "%{$params['username']}%");
        !empty($params['phone']) && $where['phone'] = array('like', "%{$params['phone']}%");
        $string = '';
        if (count($where) == 0) {
            $string = 'user_id in (select user_id from auth_group_access where group_id in(select id from auth_group where mch_id=' . $mchId . '))';
        }
        isset($params['status']) ? $where['status'] = $params['status'] : $where['status'] = ['neq', self::STATUS_DELETED];
        if ($mchId > 0) { //商户只能查询自己的
            $where['user_id'] = array('in', function($query) use($mchId) {
                $query->table('mch_member')->where('mch_id', $mchId)->field('user_id');
            });
        }
        $totalResults = $this->where($where)
                ->where(['username' => ['neq', config('app_super_admin')]])
                ->where($string)
                ->count();
        $totalPages = ceil($totalResults / $pageSize);
        $list = $this->where($where)
                        ->where(['username' => ['neq', config('app_super_admin')]])
                        ->where($string)
                        ->page($pageNo, $pageSize)->order($search['order'])->select();
        $auth = new \app\common\auth\Auth();
        //附属角色
        foreach ($list as &$value) {
            $value['group'] = $auth->getGroups($mchId, $value['user_id']);
        }
        return page_result($list, $pageNo, $pageSize, $totalResults, $totalPages);
    }

    //查询会员
    public function search($mchId, $params, $limit) {
        $cardModel=new SoldCard();
        $where = [];

        !empty($params['keyword']) && $where['username|real_name|phone'] = array('like', "%{$params['keyword']}%");
        !empty($params['real_name']) && $where['real_name'] = $params['real_name'];
        !empty($params['phone']) && $where['phone'] = $params['phone'];
        isset($params['status']) && $where['status'] = $params['status'];

        $where['user_id'] = array('in', function($query) use($mchId) {
                $query->table('mch_member')->where('mch_id', $mchId)->field('user_id');
            });
        if(!empty($params['card_id'])){
            $userIds=$cardModel->getUserByCardId($mchId,$params['card_id'],$params);
            if($userIds){
                $where['user_id']=array('in',$userIds);
            }
        }
        $this->where($where);
        $limit > 0 && $this->limit($limit);
        $result = $this->select();
        return $result;
    }

    //添加会员
    public function addMember($mchId, $data) {

        if ($mchId == 0) {
            return error(Code::VALIDATE_ERROR, '此接口只能商户调用');
        }

        //根据电话查找用户是否存在
        if(isset($data['phone'])){
            $user = $this->where(['phone' => $data['phone']])->find();
            if ($user) {
                $data['user_id'] = $user['user_id'];
            }else{
                $data['user_id'] = 0;
            }
        }
        \think\Db::startTrans();
        $data[$this->getPk()] > 0 && $this->isUpdate(true);
        $result = $this->allowField(true)->data($data)->save();
        if ($result === false) {
            return error(Code::SAVE_DATA_ERROR);
        }

        //关联用户与商户
        $memberModel = new Member();
        $member = $memberModel->where(['user_id' => $this->user_id, 'mch_id' => $mchId])->find();
        $memberData = [
            'user_id' => $this->user_id,
            'mch_id' => $mchId,
            'phone' => $data['phone'],
            'status' => 1,
        ];
        if ($member) {
            $memberData['member_id'] = $member['member_id'];
        }
        (isset($memberData['member_id']) && $memberData['member_id'] > 0) && $memberModel->isUpdate(true);
        $result = $memberModel->data($memberData)->save();
        if ($result === false) {
            \think\Db::rollback();
            return error(Code::SAVE_DATA_ERROR);
        }
        \think\Db::commit();
        return success($memberModel->getData());
    }

    //用户登录，此处不作验证
    public function login($username) {
        $user = User::get(['username' => $username]);
        //获取用户所属商户的用户组
        $mchIds = (new Group())->getAllGroupMchId($user['user_id']);
        $result = [];
        foreach ($mchIds as $value) {
            $data = [];
            $data['mch_id'] = $value;
            if ($value == 0) {
                $data['mch_name'] = '管理后台';
                $result[] = $data;
            } else {
                $merchant = Merchant::get(['mch_id' => $value, 'status' => self::STATUS_ENABLE]);
                if ($merchant) {
                    $data['mch_name'] = $merchant['mch_name'];
                    $result[] = $data;
                }
            }
        }
        if (count($result) > 0) {
            $user['curr_mch_id'] = $result[0]['mch_id']; //当前操作的商户
            $user['merchant'] = $result;
            session('admin', $user);
            $user = User::get($user['user_id']);
            $user->last_login_time = date('Y-m-d H:i:s');
            $user->save();
            return success($result);
        } else {
            return error(Code::VALIDATE_ERROR, '无权登录');
        }
    }

    /**
     * 查询店铺里的会员
     * @param type $mchId
     * @param type $shopId
     * @param type $status 
     * @param type $params
     * @return type
     */
    public function getUserByShop($mchId, $shopId, $status = 0, $params = ['return' => 'count']) {
        $where = [];
        $where['user_id'] = array('in', function($query) use($mchId, $shopId, $status) {
                $subWhere = ['mch_id' => $mchId, 'shop_id' => $shopId];
                $status > 0 && $subWhere['status'] = $status;
                $query->table('log_sign')->where($subWhere)->group('user_id')->field('user_id');
            });
        $this->where($where);
        if ($params['return'] == 'list') {
            return $this->select();
        } elseif ($params['return'] == 'count') {
            return $this->count();
        }
    }

    /**
     * 导入会员
     * @param type $mchId
     * @param type $file
     */
    public function importUser($mchId, $file) {
        $fileType = \PHPExcel_IOFactory::identify($file);
        $objReader = \PHPExcel_IOFactory::createReader($fileType);
        $objPHPExcel = $objReader->load($file);
        $sheet = $objPHPExcel->getSheet(0);
        $totalRow = $sheet->getHighestRow();
        $totalColumn = \PHPExcel_Cell::columnIndexFromString($sheet->getHighestColumn());
        $error = [];
        $success = []; //成功和失败列表 
        for ($row = 2; $row <= $totalRow; $row++) {
            $realName = trim($sheet->getCellByColumnAndRow(0, $row)->getValue());
            $phone = trim($sheet->getCellByColumnAndRow(1, $row)->getValue());
            $sex = trim($sheet->getCellByColumnAndRow(2, $row)->getValue());
            $createTime = $this->getTimeFromExcel($sheet, 3, $row);
            $cardName = trim($sheet->getCellByColumnAndRow(4, $row)->getValue());
            $useTimes = intval($sheet->getCellByColumnAndRow(5, $row)->getValue());
            $startTime = $this->getTimeFromExcel($sheet, 6, $row);
            $expireTime = $this->getTimeFromExcel($sheet, 7, $row);
            empty($createTime) && $createTime = get_now_time('Y-m-d H:i:s');
            $sex = $sex == '男' ? 1 : ($sex == '女' ? 2 : 0);
            if (!empty($startTime) && !empty($expireTime) && strtotime($startTime) >= strtotime($expireTime)) {
                $error[] = "{$realName},{$phone},不正确的开始时间和结束时间";
                continue;
            }
            if (empty($cardName)) {
                $error[] = "{$realName},{$phone},未填写会员卡";
                continue;
            }
            $card = Card::get(['mch_id' => $mchId, 'card_name' => $cardName, 'status' => Card::STATUS_ENABLE]);
            if (!$card) {
                $error[] = "{$realName},{$phone},会员卡：{$cardName} 未找到";
                continue;
            }
            $user = User::get(['phone' => $phone]);
            if ($user && $user['real_name'] != $realName) {
                $error[] = "{$realName},手机号：{$phone}已被使用！";
                continue;
            }
            if ($user && Member::where(['mch_id' => $mchId, 'user_id' => $user['user_id']])->count() > 0) {
                $error[] = "{$realName},{$phone},会员已存在";
                continue;
            }
            $result = $this->addMemberFromExcel([
                'mch_id' => $mchId,
                'real_name' => $realName,
                'phone' => $phone,
                'sex' => $sex,
                'create_time' => $createTime,
                'card_name' => $cardName,
                'use_times' => $useTimes,
                'start_time' => $startTime,
                'expire_time' => $expireTime,
                'card' => $card,
                'user' => $user,
            ]);
            if ($result['code'] == Code::SUCCESS) {
                $success[] = "{$realName},{$phone},导入成功";
            } else {
                $error[] = "{$realName},{$phone}," . $result['message'];
            }
        }
        return success(['success' => $success, 'error' => $error]);
    }

    //导入会员数据添加
    private function addMemberFromExcel($params) {
        $admin = session('admin');
        Db::startTrans();
        try {
            $card = $params['card'];
            $user = $params['user'];
            if (!$user) { //添加用户
                $user = User::create([
                            'real_name' => $params['real_name'],
                            'phone' => $params['phone'],
                            'sex' => $params['sex'],
                            'create_time' => $params['create_time'],
                ]);
            }
            $member = Member::create([//增加与商户的关联
                        'mch_id' => $params['mch_id'],
                        'user_id' => $user->user_id,
                        'phone' => $user->phone,
            ]);
            //生成订单
            $order = Order::create([
                        'mch_id' => $params['mch_id'],
                        'user_id' => $user->user_id,
                        'type' => Order::TYPE_BUY_CARD,
                        'transaction_id' => '',
                        'trade_no' => generate_number_order(),
                        'product_num' => 1,
                        'product_id' => $card['card_id'],
                        'create_by' => $admin['user_id'],
                        'price' => $card['price'],
                        'sale_price' => $card['price'],
                        'origin_price' => $card['origin_price'],
                        'discount_price' => $card['origin_price'] - $card['price'],
                        'product_info' => '导入会员购卡：' . $card['card_name'],
            ]);
            $result = $order->paySuccess($order, Order::CASH); //直接现金支付成功
            if ($result['code'] != Code::SUCCESS) {
                Db::rollback();
                return $result;
            } else { //保存已使用次数和开始时间结束时间
                Db::commit();
                $soldCard = $result['data'];
                if (!empty($params['start_time']) && !empty($params['expire_time'])) {
                    $soldCard->active = SoldCard::ACTIVE_ENABLE;
                    $soldCard->start_time = $params['start_time'];
                    $soldCard->expire_time = $params['expire_time'];
                }
                if ($card['type'] == Card::TYPE_COUNT && $params['use_times'] > 0) {
                    $soldCard->active = SoldCard::ACTIVE_ENABLE;
                    $soldCard->use_times = $params['use_times'];
                }
                if ($soldCard->save() !== false) {
                    return success($soldCard);
                } else {
                    return error(Code::VALIDATE_ERROR, '购卡成功，但保存使用次数和开始结束时间失败');
                }
            }
        } catch (\Exception $e) {
            Db::rollback();
            return error(Code::VALIDATE_ERROR, $e->getMessage());
        }
    }

    /**
     * 获取excel时间
     * @param type $sheet phpexcel 对象
     * @param type $col 列
     * @param type $row 行
     * @return string
     */
    private function getTimeFromExcel($sheet, $col, $row) {
        $str = trim($sheet->getCellByColumnAndRow($col, $row)->getValue());
        if (empty($str)) {
            return $str;
        }
        if (is_numeric($str)) {
            return date('Y-m-d H:i:s', \PHPExcel_Shared_Date::ExcelToPHP($str) - 3600 * 8);
        } else if (strtotime($str) < strtotime('2000-01-01')) {
            return '';
        } else {
            return $str;
        }
    }

    /**
     * 根据电话查询用户信息
     * @param $phone
     * @return array
     */
    private function getUserByPhone($phone) {
        $fild = 'user_id';
        $where = array([
                'phone' => $phone
        ]);
        $row = $this->where($where)->field($fild)->get();
        if (!$row) {
            return error('0', '未查询到用户数据');
        }
        return success($row);
    }

    /**获取计算提成员工
     * @param $mchId
     * @param $shopId
     */
    public function getStaffing($mchId, $shopId,$user_type,$start_time,$end_time,$pageNo, $pageSize){
        $data = [];
        !empty($shop_id) ?$data['shop_id']=$shopId: $data['shop_id'] = 0;
        !empty($user_type) ?$data['user_type']=$user_type: $data['user_type'] = 0;
        $data['start_time'] = $start_time;
        $data['end_time'] = $end_time;
        $users = $this->getUsers($mchId,$data['shop_id'], $data['user_type'], 0, 0);
        $cardRate = model\Merchant::where(['mch_id' => $mchId])->value('card_rate');
        $orderModel = new Order();
        $sort = [];
        foreach ($users as $key => &$value) {
            //会员卡提成
            $value['sales_card'] = $orderModel
                ->totalSales($mchId, ['start_time' => $data['start_time'], 'end_time' => $data['end_time'], 'shop_id' => $data['shop_id'], 'type' => model\Order::TYPE_BUY_CARD, 'seller_id' => $value['user_id']]);
            $value['sales_card'] *= $cardRate;
            $value['card_rate'] = $cardRate;
            //售课提成
            $value['sales_course'] = 0;
            $shop = model\Shop::get(['manager_user_id' => $value['user_id']]);
            if ($shop) {
                $value['sales_course'] = $orderModel
                    ->totalSales($mchId, ['start_time' => $data['start_time'], 'end_time' => $data['end_time'], 'shop_id' => $shop['shop_id'], 'type' => model\Order::TYPE_BUY_PRIVATE_COURSE, 'seller_id' => $value['user_id']]);
                $value['sales_course'] *= $value['sale_rate'];
            }
            //耗课提成
            $value['used_course'] = 0;
            $soldCourseList = $this->getUsedSoldCourse($data['shop_id'], $value['user_id']);
            foreach ($soldCourseList as $soldCourse) {
                $value['used_course'] += $soldCourse['price'] / $soldCourse['buy_num'];
            }
            $value['used_course'] *= $value['course_rate'];
            $value['total_value'] = $value['used_course'] + $value['sales_course'] + $value['sales_card'];
            $sort[$key] = $value['total_value'];
        }
        array_multisort($sort, SORT_DESC, $users);
        return $users;
    }


    /**获取需要计算的员工
     * @param $shopId
     * @param $userType
     * @param $pageNo
     * @param $pageSize
     * @return array|false|\PDOStatement|string|\think\Collection
     */
    //获取需要计算的用户
    public function getUsers($mchId,$shopId, $userType, $pageNo, $pageSize) {
        $shopModel = new Shop();
        $field = 'a.user_id,a.real_name,a.phone,a.sex,a.avatar,d.course_rate,d.sale_rate,c.title';
        $this->alias('a')
            ->join('auth_group_access b', 'b.user_id=a.user_id', 'left')
            ->join('auth_group c', 'c.id=b.group_id', 'left')
            ->join('mch_coach d', 'd.user_id=a.user_id', 'left')
            ->where('a.status=' . model\User::STATUS_ENABLE);
        if ($userType == 1) { //教练
            $this->where('d.course_rate is not null');
        } elseif ($userType == 2) {//会籍
            $this->where('c.title="会籍"');
        } elseif ($userType == 3) {//管家
            $shopManagers = $shopModel->getManagerIds($mchId, $shopId);
            if(!empty($shopManagers)){
                $this->where('a.user_id in (' . implode(',', $shopManagers) . ')');
            }else{
                return array();
            }

        } elseif($userType==0) {
            $shopManagers = $shopModel->getManagerIds($mchId, $shopId);
            if(!empty($shopManagers)){
                $this->where('(c.title = "会籍" or a.user_id in (' . implode(',', $shopManagers) . ') or (d.course_rate is not null))');
            }else{
                $this->where('(c.title = "会籍"  or (d.course_rate is not null))');
            }
        }
        if ($pageNo > 0 && $pageSize > 0) {
            $query = clone $this->getQuery();
            $query = $query->group('a.user_id')->field($field)->buildSql();
            $totalResults = \think\Db::table($query . ' a')->count();
            $totalPages = ceil($totalResults / $pageSize);
            $users = $this->group('a.user_id')->field($field)->page($pageNo, $pageSize)->select();
            return page_result($users, $pageNo, $pageSize, $totalResults, $totalPages);
        } else {
            $users = $this->group('a.user_id')->field($field)->select();
        }
        return $users;
    }
    public function getUsedSoldCourse($shopId, $userId) {
        $model = new model\ClassPlan();
        $where = ['a.status' => 2, 'a.coach_user_id' => $userId, 'a.type' => model\Course::TYPE_PRIVATE];
        $shopId > 0 && $where['a.shop_id'] = $shopId;
        $list = $model->alias('a')
            ->join('mch_sold_course b', 'b.sold_course_id=a.sold_course_id')
            ->where($where)
            ->field('a.plan_id,b.*')
            ->select();
        return $list;
    }

    public function getUser($mchId,$shopId, $userType, $pageNo, $pageSize) {
        $shopModel = new Shop();
        $field = 'a.user_id,a.real_name,a.phone,a.sex,a.avatar,d.course_rate,d.sale_rate,c.title';
        $this->alias('a')
            ->join('auth_group_access b', 'b.user_id=a.user_id', 'left')
            ->join('auth_group c', 'c.id=b.group_id', 'left')
            ->join('mch_coach d', 'd.user_id=a.user_id', 'left')
            ->where('a.status=' . self::STATUS_ENABLE);
        if ($userType == 1) { //教练
            $this->where('d.course_rate is not null');
        } elseif ($userType == 2) {//会籍
            $this->where('c.title="会籍"');
        } elseif ($userType == 3) {//管家
            $shopManagers = $shopModel->getManagerIds($mchId, $shopId);
            $this->where('a.user_id in (' . implode(',', $shopManagers) . ')');
        } else {
            $shopManagers = $shopModel->getManagerIds($mchId, $shopId);
            if(!empty($shopManagers)){
                $this->where('(c.title = "会籍" or a.user_id in (' . implode(',', $shopManagers) . ') or (d.course_rate is not null))');
            }else{
                $this->where('(c.title = "会籍"  or (d.course_rate is not null))');
            }
        }
        if ($pageNo > 0 && $pageSize > 0) {
            $query = clone $this->getQuery();
            $query = $query->group('a.user_id')->field($field)->buildSql();
            $totalResults = $this->count();
            $totalPages = ceil($totalResults / $pageSize);
            $users = $this->group('a.user_id')->field($field)->page($pageNo, $pageSize)->select();
            return page_result($users, $pageNo, $pageSize, $totalResults, $totalPages);
        } else {
            $users = $this->group('a.user_id')->field($field)->select();
        }

        return $users;
    }

    /**
     * @desc 根据条件查询用户信息
     * @param $condition
     * @return false|\PDOStatement|string|\think\Collection
     */
    public function getUserInfo($condition)
    {
        $response = $this->where($condition)
                        ->find();
        return $response;
    }

    //获取子成员列表
    public function getSubMember($params,$mchId){
        //查询子成员ID
        $users = model\SoldCardUser::where([
                    'mch_id'         => $mchId,
                    'sold_card_id'   => $params['sold_card_id'],
                    'user_id'        => ['NEQ',$params['user_id']]
                ])->column('user_id');

        $list = self::where("user_id","IN",$users)
                    ->field("user_id,real_name,phone,avatar,create_time,sex")
                    ->order("create_time desc")
                    ->select();
        return $list;
    }

}

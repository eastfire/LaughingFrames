define(function(require, exports, module) {
	var words = ["阿里巴巴","阿童木","阿拉伯","艾佛尔铁塔", "奥斯卡金像奖", //a
		"变色龙","暴风雨","博士","板凳","变形金刚","兵马俑","冰山","冰块","保龄球","扳手","比萨斜塔","鼻子", "鼻环", "笔记本", "菠萝",//b
		"草莓","床","储蓄罐","磁铁","瓷器","长城","厕所","厨师","裁判","超人", "草原", "长城", //c
		"哆啦A梦","电影院","电话","电视","大饼","地铁","独角兽","蛋糕","灯泡","稻草人", "袋鼠", //d
		"耳朵","鳄鱼","恶魔","额头","耳环","二郎神",//e
		"肥皂","法官","飞马","伐木工","风铃","风车","飞碟","飞毯","凤凰","饭店", "飞行棋",//f
		"钢琴","股票","锅子","公主","国王","高速公路","高尔夫","观音菩萨","瓜子","鬼魂", "篝火", "故宫",//g
		"护士","火灾","猴子捞月","火龙","汉堡包","琥珀","湖泊","狐狸","画家","火箭","火山", "核弹", "航空母舰",//h
		"计算机","戒指","镜子","橘子","警察","机器人","僵尸","积木","肌肉","奖杯","击剑", "金字塔",//j
		"筷子","可乐","孔雀","矿场","烤肉","空调","裤子","快餐","裤子", //k
		"辣椒","律师","篮球","老人","礼物","猎人","龙卷风","龙舟","蓝鲸","路标","榔头", "螺丝刀", "流星", "榴莲",//l
		"漫画书","木马","麦克风","庙宇","模特","码头","马桶","毛巾","眉毛","梦","蜜蜂","马拉松", "猕猴桃","玫瑰", "蘑菇",//m
		"弩","女巫","女王","农民","内衣","奶牛","奶瓶","南瓜","牛排","奴隶", //n
		"扑克牌","仆人","苹果","泡面","炮弹","排球","葡萄","乒乓球","拍卖会","披萨", "披风",//p
		"清洁工","企鹅","青蛙","骑士","巧克力","钱包","汽车", "裙子","拳击手",//q
		"忍者","人造卫星","热水器","热气球", //r
		"水手","税收","水坝","薯条","沙漠","鼠标","算盘","杀手","手术", "手机", "手电筒","手雷","手枪","手镯","鲨鱼","三明治", "睡袋", "树袋熊","树根", "闪电",//s
		"天鹅","鸵鸟","铁钉","天使","台球","跳舞","太阳","头发","铁路","田野", "拖鞋", "土豆",//t
		"乌贼","无线网络","王子","王后","舞厅","温度计","乌龟","网球","武士","蚊子", "挖土机", "望远镜",//w
		"熊猫","星座","香蕉","芯片","小偷","修理工","象棋","心脏","犀牛","蜥蜴", "洗衣机", "小丑", "项链", "仙人掌",//x
		"医生","异形","鸭子","音乐","阳台","易筋经","压力锅","燕子","鱼鳞","月饼", "砚台", "烟斗", "药片", "银河", "眼镜蛇","鼹鼠",//y
		"足球","战士","粽子","钻头","灾难","蜘蛛","沼泽","指南针","作业","战斗机", "侦探", "锥光灯" ,"啄木鸟"//z
		];

	exports.randomWord = function(){
		return words[ Math.floor(Math.random()*words.length) ];
	};
});
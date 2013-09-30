define(function(require, exports, module) {
	var gameTemplate = $("#game-template").html();
	var words = ["阿里巴巴","阿童木","阿拉伯", //a
		"变色龙","暴风雨","博士","板凳","变形金刚","兵马俑","冰山","冰块","保龄球","扳手","比萨斜塔","鼻子", //b
		"草莓","床","储蓄罐","磁铁","瓷器","长城","厕所","厨师","裁判","超人", //c
		"哆啦A梦","电影院","电话","电视","大饼","地铁","独角兽","蛋糕","灯泡","稻草人", //d
		"耳朵","鳄鱼","恶魔","额头","耳环",//e
		"肥皂","法官","飞马","伐木工","风铃","风车","飞碟","飞毯","凤凰","饭店", //f
		"钢琴","股票","锅子","公主","国王","高速公路","高尔夫","观音","瓜子","鬼魂", //g
		"护士","火堆","猴子","火龙","汉堡包","琥珀","湖泊","狐狸","画家","火箭","火山", //h
		"计算机","戒指","镜子","橘子","警察","机器人","僵尸","积木","肌肉","奖杯","击剑", //j
		"筷子","可乐","孔雀","矿场","烤肉","空调","卡坦岛","卡卡松","裤子","快餐", //k
		"辣椒","律师","篮球","老人","礼物","猎人","龙卷风","蓝鲸","路标","榔头", //l
		"漫画书","木马","麦克风","庙宇","模特","码头","马桶","毛巾","眉毛","梦","蜜蜂","马拉松", "猕猴桃","玫瑰", //m
		"弩","女巫","女王","农民","内衣","奶牛","奶瓶","南瓜","牛排","奴隶", //n
		"扑克牌","仆人","苹果","泡面","炮弹","排球","葡萄","乒乓球","拍卖会","披萨", //p
		"清洁工","企鹅","青蛙","骑士","巧克力","钱包","汽车", //q
		"忍者","人造卫星","热水器","热气球",//r
		"水手","税收","水坝","薯条","沙漠","鼠标","手雷","算盘","杀手","手枪","鲨鱼","三明治", //s
		"天鹅","鸵鸟","铁钉","天使","台球","跳舞","太阳","头发","铁路","田野", //t
		"乌贼","无线网络","王子","王后","舞厅","温度计","乌龟","网球","武士","蚊子", //w
		"熊猫","星座","香蕉","芯片","小偷","修理工","象棋","心脏","犀牛","蜥蜴", "洗澡", "小丑",//x
		"医生","异型","鸭子","音乐","阳台","易筋经","压力锅","燕子","鱼鳞","月饼", //y
		"足球","战士","粽子","钻头","灾难","蜘蛛","沼泽","指南针","作业","战斗机", "侦探" //z
		];

	exports.GameView = Backbone.View.extend({
		template: _.template(gameTemplate),

		events: {
			"click #pen1": "onAdjustPen",
			"click #pen3": "onAdjustPen",
			"click #pen5": "onAdjustPen",
			"click #rubber5": "onSelectRubber",
			"click #ok-draw":"onCompleteDraw",
			"click #ok-guess":"onCompleteGuess",
			"mousedown #drawing-canvas.enabled":"onDraw",
			"mousemove #drawing-canvas.enabled":"onDraw",
			"mouseup #drawing-canvas.enabled":"onDraw",
			"click #ok-guess":"onCompleteGuess",
			"click #back-to-room":"backToRoom"
		},

		initialize:function(){
			this.$el.html( this.template({game:this.model.toJSON()}) );

			this.drawings = this.model.getDrawings();
			this.drawings.on("add",this.onAddDrawing, this);
			this.drawings.on("reset",this.onAddAllDrawing, this);

			if ( this.model.get("status") == "open" ){
				//list last frame
				//if no frame , new a question
				if ( this.drawings.length == 0 ){
					this.drawings.add({
						ownerId: currentUserId,
						timestamp : this.model.get("timestamp"),
						word: this.randomWord(),
						question: true
					});
				}

				var lastDrawing = this.drawings.last();
				var word = lastDrawing.get("word");
				var user = users.get( lastDrawing.get("ownerId") );
				this.canvas = this.$("#drawing-canvas");
				this.$(".user").html(user.get("name"));
				if ( word != null )	{					
					this.$(".drawing-title").html(word);

					this.cxt=this.canvas[0].getContext("2d");
					//can draw
					this.$("#canvas-bar").show();
					this.$("#tools").button();
					
					this.canvas.addClass("enabled");
					
					this.cxt.strokeStyle="#000000";
					this.cxt.lineWidth = 3;
					this.mode = "pen";
				} else {
					//guess
					console.log("on show canvas");
					var imgData = lastDrawing.get("pic");
					var myImage = new Image();
					myImage.src = imgData;
					this.$("#drawing-to-guess").show().append(myImage);
					this.canvas.hide();
					this.$("#drawing-guess").show();
				}
			} else {
			}
		},
		
		randomWord:function(){
			return words[ Math.floor(Math.random()*words.length) ];
		},

		onAddDrawing:function(drawing){
			console.log("on add drawing");
		},
		
		onAddAllDrawing:function(drawing){
			console.log("on add all drawing");
		},

		onAdjustPen:function(event){
			this.mode = "pen";
			this.cxt.lineWidth = $(event.currentTarget).attr("pen");
		},

		onSelectRubber:function(event){
			this.mode = "rubber";
		},
		
		onCompleteDraw:function(event){
			var b = $(event.currentTarget);
			b.attr("disabled","disabled").addClass("loading");
			var self = this;
			this.drawings.create({ ownerId: currentUserId, timestamp: (new Date()).getTime(), pic: this.canvas[0].toDataURL() },
				{ 
					success: function(){
						var status = "open"
						var userLimit = self.options.room.model.get("userLimit");
						if ( userLimit == 0 && self.drawings.length - 1>= _.size(self.options.room.model.get("userIds")) ) {
							if ( self.drawings.length > 4 )	{
								status = "close";
							}
						} else if ( self.drawings.length - 1 >= userLimit ){
							status = "close";
						}
						b.removeAttr("disabled").removeClass("loading");
						self.model.set({ currentUserId: 0, status : status, updateTime: (new Date()).getTime() });
						self.backToRoom();
					},
					error:function(){
						b.removeAttr("disabled").removeClass("loading");
					}
				} );

		},

		backToRoom: function(){
			history.back();
		},
		
		onCompleteGuess:function(event){
			var self = this;
			var name = this.$("#drawing-name").val().trim();
			if ( name == "" )
				return;

			var b = $(event.currentTarget);
			b.attr("disabled","disabled").addClass("loading");
			var self = this;
			this.drawings.create({ ownerId: currentUserId, timestamp: (new Date()).getTime(), word: name },
				{ 
					success: function(){
						var status = "open"
						var userLimit = self.options.room.model.get("userLimit");
						if ( userLimit == 0 && self.drawings.length - 1>= _.size(self.options.room.model.get("userIds")) ) {
							if ( self.drawings.length > 4 )	{
								status = "close";
							}
						} else if ( self.drawings.length - 1 >= userLimit ){
							status = "close";
						}
						b.removeAttr("disabled").removeClass("loading");
						self.model.set({ currentUserId: 0, status : status, updateTime: (new Date()).getTime() });
						self.backToRoom();
					},
					error:function(){
						b.removeAttr("disabled").removeClass("loading");
					}
				} );
		},
		
		onDraw:function(e){			
			var event = e.originalEvent;
			if ( e.type == "mouseup" ){
				this.cxt.closePath();
				return;
			}
			if ( !(event.buttons & 1) )
				return;
			var x = event.pageX - this.canvas.position().left;
			var y = event.pageY - this.canvas.position().top;
			if ( this.mode == "pen" ) {
				if ( e.type == "mousedown" ){
					this.cxt.beginPath();
					this.cxt.moveTo(x,y);
				} else if ( e.type == "mousemove" ){
					this.cxt.lineTo(x,y);
				}
				this.cxt.stroke();
				
//				this.cxt.stroke();
			} else if ( this.mode == "rubber" ) {
				this.cxt.clearRect(x-5,y-5,11,11);
			}
		},
	});
});

define(function(require, exports, module) {
	var gameTemplate = $("#game-template").html();
	var words = ["阿里巴巴","阿童木","阿拉伯","","","","","","","","",
		"变色龙","暴风雨","博士","","","","","","","扳手",
		"草莓","","","","","","","","","",
		"哆啦A梦","电影院","电话","电视","大饼","地铁","独角兽","蛋糕","灯泡","稻草人", //d
		"耳朵","鳄鱼","恶魔","","","","","","","", //e
		"肥皂","法官","","","","","","","","", //f
		"钢琴","股票","锅子","公主","国王","高速公路","","","","鬼魂", //g
		"护士","火堆","猴子","","","","","","","", //h
		"计算机","戒指","镜子","橘子","警察","机器人","僵尸","积木","","", //j
		"筷子","可乐","孔雀","矿场","烤肉","空调","卡坦岛","卡卡松","裤子","快餐", //k
		"辣椒","律师","篮球","老人","礼物","猎人","龙卷风","","","榔头", //l
		"漫画书","木马","麦克风","庙宇","模特","码头","马桶","毛巾","眉毛","梦", //m
		"弩","女巫","女王","","","","","","","", //n
		"扑克牌","仆人","苹果","","","","","","拍卖","披萨", //p
		"清洁工","企鹅","青蛙","","","","","","","", //q
		"忍者","人造卫星","热水器","","","","","","","", //r
		"水手","税收","水坝","","","","","","杀手","手枪", //s
		"天鹅","鸵鸟","铁钉","天使","","","","","铁路","田野", //t
		"乌贼","无线网络","王子","王后","舞厅","","","","","", //w
		"熊猫","星座","香蕉","芯片","小偷","修理工","象棋","心脏","犀牛","蜥蜴", //x
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
			"mouseup #drawing-canvas.enabled":"onDraw"
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
						ownerId: currentUser.get("id"),
						timestamp : this.model.get("timestamp"),
						word: "题目："+this.randomWord(),
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
			this.drawings.create({ ownerId: currentUser.get("id"), timestamp: (new Date()).getTime(), pic: this.canvas[0].toDataURL() },
				{ 
					success: function(){
						var status = "open"
						var userLimit = self.options.room.model.get("userLimit");
						if ( userLimit == 0 && self.drawings.length - 1>= self.options.room.model.get("userIds").length ) {
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
			this.options.room.refreshRoom();
			$("#room").show();
			this.remove();
		},
		
		onCompleteGuess:function(event){
			var self = this;
			var name = this.$("#drawing-name").val().trim();
			if ( name == "" )
				return;

			var b = $(event.currentTarget);
			b.attr("disabled","disabled").addClass("loading");
			var self = this;
			this.drawings.create({ ownerId: currentUser.get("id"), timestamp: (new Date()).getTime(), word: name },
				{ 
					success: function(){
						var status = "open"
						var userLimit = self.options.room.model.get("userLimit");
						if ( userLimit == 0 && self.drawings.length - 1>= self.options.room.model.get("userIds").length ) {
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
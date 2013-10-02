define(function(require, exports, module) {
	var gameTemplate = $("#game-template").html();
	var randomWord = require("../model/words").randomWord;

	exports.GameView = Backbone.View.extend({
		template: _.template(gameTemplate),

		events: {
			"click #pen1": "onAdjustPen",
			"click #pen3": "onAdjustPen",
			"click #pen5": "onAdjustPen",
			"click #rubber5": "onSelectRubber",
			"click #clear-all": "onClearAll",
			"click #ok-draw":"onCompleteDraw",
			"click #ok-guess":"onCompleteGuess",
			//"mousedown #drawing-canvas.enabled":"onDraw",
			//"mousemove #drawing-canvas.enabled":"onDraw",
			//"mouseup #drawing-canvas.enabled":"onDraw",
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
						word: "题目："+randomWord(),
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
					if ( this.model.get("currentUserId") != currentUserId && this.model.hasUser(currentUserId ) ){
						return;
					}
					this.cxt=this.canvas[0].getContext("2d");
					//can draw
					this.$("#canvas-bar").show();
					this.$("#tools").button();
					
					this.cxt.strokeStyle="#000000";
					this.cxt.lineWidth = 3;
					this.mode = "pen";
					
					this.canvas.height( this.canvas.width() );
					this.ratio = 500/this.canvas.width();

					this.enableCanvas();
				} else {
					//guess
					var imgData = lastDrawing.get("pic");
					var myImage = new Image();
					myImage.src = imgData;
					this.$("#drawing-to-guess").show().append(myImage);
					this.canvas.hide();

					if ( this.model.get("currentUserId") != currentUserId && this.model.hasUser(currentUserId ) ){
						return;
					}
					
					this.$("#drawing-guess").show();
				}
			} else {
			}
		},

		enableCanvas:function(){
			this.canvas.addClass("enabled");
			var self = this;
			this.canvas.hammer({prevent_default: true})
				.bind('tap', function(e) { // And mousedown
					var x = (e.gesture.center.pageX - self.canvas.position().left)*self.ratio;
					var y = (e.gesture.center.pageY - self.canvas.position().top)*self.ratio;
					
					if ( self.mode === "rubber" ){
						self.cxt.clearRect(x-10,y-10,21,21);
					} else if ( self.mode === "pen" ){
						self.cxt.beginPath();
						self.cxt.arc(x, y, self.cxt.lineWidth/1.5, 0, Math.PI*2, true); 
						self.cxt.closePath();
						self.cxt.fill();
					}
				})
				.bind('dragstart', function(e) { // And mousedown
					var x = (e.gesture.center.pageX - self.canvas.position().left)*self.ratio;
					var y = (e.gesture.center.pageY - self.canvas.position().top)*self.ratio;
					
					if ( self.mode === "rubber" ){
						self.cxt.clearRect(x-10,y-10,21,21);
					} else if ( self.mode === "pen" ){
						self.cxt.beginPath();
						self.cxt.moveTo(x,y);
						self.cxt.stroke();
					}
				})
				.bind('drag', function(e) { // And mousemove when mousedown
					var x = (e.gesture.center.pageX - self.canvas.position().left)*self.ratio;
					var y = (e.gesture.center.pageY - self.canvas.position().top)*self.ratio;

					if ( self.mode === "rubber" ){
						self.cxt.clearRect(x-7,y-7,15,15);
					} else if ( self.mode === "pen" ){
						self.cxt.lineTo(x,y);
						self.cxt.stroke();
					}
				})
				.bind('dragend', function(e) { // And mouseup
					if ( self.mode === "pen" ){
						self.cxt.closePath();
					}
				});
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

			var status = "open"
			var room = $("#room div").data("view").model;
			
			if ( self.drawings.length + 1 >= room.getUserLimit() ) {
					status = "close";
			}
			var timestamp = (new Date()).getTime();
			
			this.drawings.create({ ownerId: currentUserId, timestamp: timestamp, pic: this.canvas[0].toDataURL() },
				{ 
					success: function(){
						setTimeout(function(){
							self.model.collection.firebase.child(self.model.get("id")).update({ currentUserId: "", status : status, updateTime: timestamp });
							self.backToRoom();
							b.removeAttr("disabled").removeClass("loading");
						},1000);
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

			var status = "open"
			var room = $("#room div").data("view").model;
			if ( self.drawings.length + 1 >= room.getUserLimit() ) {
					status = "close";
			}
			var timestamp = (new Date()).getTime();
			
			this.drawings.create({ ownerId: currentUserId, timestamp: timestamp, word: "我猜是“"+name+"”" },
				{ 
					success: function(){
						setTimeout(function(){
							//self.model.set({ currentUserId: "", status : status, updateTime: timestamp });
							self.model.collection.firebase.child(self.model.get("id")).update({ currentUserId: "", status : status, updateTime: timestamp });
							self.backToRoom();
							b.removeAttr("disabled").removeClass("loading");
						},1000);
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
				this.mouseDown = false;
				return;
			}
			
			var x = event.pageX - this.canvas.position().left;
			var y = event.pageY - this.canvas.position().top;
			if ( e.type == "mousedown" )
				this.mouseDown = true;

			if ( this.mode == "pen" ) {
				if ( e.type == "mousedown" ){					
					this.cxt.beginPath();
					this.cxt.moveTo(x,y);
					this.cxt.stroke();
				} else if ( e.type == "mousemove" ){
					if ( this.mouseDown ) {
						this.cxt.lineTo(x,y);
						this.cxt.stroke();
					}
				}
				
			} else if ( this.mode == "rubber" ) {
				if ( this.mouseDown )
					this.cxt.clearRect(x-10,y-10,21,21);
			}
		},

		onClearAll:function(e){
			this.cxt.clearRect(0,0,500,500);
		}
	});
});

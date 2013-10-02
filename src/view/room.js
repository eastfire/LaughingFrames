define(function(require, exports, module) {
	window.CREATE_GAME_LIMIT = 3;
	window.ACTIVE_GAME_LIMIT = 3;

	var roomTemplate = $("#room-template").html();
	var gameItemTemplate = $("#game-item-template").html();
	var GameView = require("./game").GameView;
	var CompletedGameView = require("./completed-game").CompletedGameView;

	var GameItemView = Backbone.View.extend({
		template: _.template(gameItemTemplate),

		events: {
			"click": "onEnter"
		},

		initialize:function(){
			this.room = this.options.roomView;
			
			this.$el.addClass("col-sm-3 game-item").attr("id", this.model.get("id") );
			
			this.model.on("change:currentUserId change:status", this.updateGameItem, this);
			this.model.on("change", this.render, this);

			this.updateGameItem();
			this.$el.data("view",this);
		},

		render:function(){
			this.$el.html( this.template(this.model.toJSON()) );
			if ( this.model.get("status")=='close' ) {
				var drawings = this.model.getDrawings();
				if ( drawings.length>0)
					this.$(".game-title").html( drawings.at(0).get("word") );
				var total = 0;
				drawings.each(function(d){
					total+=_.size(d.get("comments"));
				});
				this.$(".total-comments").html(total);
			}
		},
		
		onEnter:function(){
			this.room.enterGame(this.model);
		},
		
		updateGameItem: function(){
			console.log("on update gameItem: "+this.model.get("status")+" , "+this.model.get("currentUserId")+" , "+this.model.hasUser(currentUserId));
			if ( this.model.get("status") === 'open' ){
				if ( this.model.get("currentUserId") === currentUserId )	{
					this.room.$("#my-game-list").prepend(this.$el);
				} else if ( this.model.get("currentUserId") === "" && !this.model.hasUser(currentUserId) ){
					this.room.$("#game-list").prepend(this.$el);
				} else {
					this.$el.detach();
				}
			} else {
				this.room.$("#completed-game-list").prepend(this.$el);
			}
		}
	});

	exports.RoomView = Backbone.View.extend({
		template: _.template(roomTemplate),
		events :{
			"click #join-room":"onJoinRoom",
			"click #leave-room":"onLeaveRoom",
			"click #close-room":"onCloseRoom",
			"change #user-limit":"onSetPlayerNumber",
			"change #time-limit":"onSetDrawingTime",
			"click #to-lobby":"onBackToLobby",
			"click #create-game":"onCreateGame",
		},
		initialize:function(){
			var id = this.model.get("ownerId");
			var owner = window.users.get(id);
			this.$el.html( this.template({room:this.model.toJSON(), owner: owner.toJSON() }) );
			this.$el.data("view",this);
			
			this.views = {};

			this.$("#user-limit").prop("selectedIndex", this.$("#user-limit option[value="+this.model.get("userLimit")+"]").index() );
			this.$("#time-limit").prop("selectedIndex", this.$("#time-limit option[value="+this.model.get("timeLimit")+"]").index() );
			var isVisitor = false;
			if ( currentUserId == this.model.get("ownerId") )	{
				this.$("#join-room").hide();
				this.$("#leave-room").hide();
				this.$("#close-room").show();
			} else if ( this.model.hasUser(currentUserId) )	{
				this.$("#join-room").hide();
				this.$("#leave-room").show();
				this.$("#close-room").hide();
				this.$("#user-limit").attr("disabled","disabled");
				this.$("#time-limit").attr("disabled","disabled");
			} else {
				this.$("#join-room").show();
				this.$("#leave-room").hide();
				this.$("#close-room").hide();
				this.$("#user-limit").attr("disabled","disabled");
				this.$("#time-limit").attr("disabled","disabled");
				this.$("#create-game").hide();
				isVisitor = true;
			}

			this.games = this.model.getGames();
			this.games.on('add', this.onAddGame, this);
			this.games.on('reset', this.onResetGames, this);
			this.games.on("remove",this.onRemoveGame, this);
			
			this.userIds = this.model.collection.firebase.child(this.model.get("id")+"/userIds");
			
			this.renderUsers();
			
			this.onResetGames();

			this.calcCount();

			if ( isVisitor ){
				this.$("#game-tabs li:first").hide();
				this.$("#game-tabs li:nth-child(2)").hide();
				$('#game-tabs li:nth-child(3) a').tab('show')
			} else {
				if ( this.activeOpenCount )
					$('#game-tabs li:nth-child(2) a').tab('show')
				else
					$('#game-tabs li:nth-child(1) a').tab('show')
			}
		},
		
		calcCount : function(){
			this.ownOpenCount = 0;
			this.activeOpenCount = 0;

			this.games.each(function(game){
				if ( game.get("status") === "open" ) {
					if ( game.get("ownerId") === currentUserId )
						this.ownOpenCount ++;
					else if ( game.get("currentUserId") === currentUserId )
						this.activeOpenCount ++;
				}
				
			},this);
		},
		
		renderUsers : function(){
			this.$("#user-list").empty();
			for ( var id in this.model.get("userIds") ){
				var user = window.users.get(id);
				if ( user )
					this.$("#user-list").append("<div class='user-item'><label>"+user.get("name")+"</label></div>");
			}
		},

		onJoinRoom:function(){
			this.userIds.child(currentUserId).set(true);
			this.initialize();
		},

		onLeaveRoom:function(){
			this.userIds.child(currentUserId).remove();
			this.initialize();
		},
		
		onCloseRoom:function(){
		},
		
		onSetPlayerNumber:function(event){
			var limit = $(event.currentTarget).val();
			this.model.set({ userLimit : limit	});
		},

		onSetDrawingTime:function(event){
			var limit = $(event.currentTarget).val();
			this.model.set({ timeLimit : limit	});
		},

		onCreateGame: function(event){
			var self = this;
			var b = $(event.currentTarget);
			this.calcCount();
			if ( this.ownOpenCount >= CREATE_GAME_LIMIT ){
				b.popover({
					content: "由于资源有限，每个玩家创建且未完成的游戏只能有"+CREATE_GAME_LIMIT+"个。请耐心等待其他玩家接力完成或接力其他玩家创建的游戏。",
				}).popover("show");
				setTimeout(function(){
					b.popover("hide");
					b.popover("destroy");
				},3000);
				return;
			}
			
			b.attr("disabled","disabled").addClass("loading");
			$('#game-tabs li:nth-child(2) a').tab('show')

			this.games.create({ownerId: currentUserId, timestamp: (new Date()).getTime(), currentUserId : currentUserId },{
				success:function(model){
					b.removeAttr("disabled").removeClass("loading");
					self.enterGame(self.games.get(this.id));
				},
				error:function(){
					b.removeAttr("disabled").removeClass("loading");
				}
			});
		},
		
		enterGame: function(game){
			if ( game.get("status") === "open" ) {
				if ( !this.model.hasUser(currentUserId) ) { //only user in group can join game
					return;
				}
				this.calcCount();
				if ( game.get("currentUserId") != currentUserId && this.activeOpenCount >= ACTIVE_GAME_LIMIT ){
					var el = this.$("#"+game.get("id"));
					el.popover({
						content: "您还有接力没完成，请到“我在接力的游戏”中完成您的接力，其他玩家正等着呢。",
					}).popover("show");
					setTimeout(function(){
						el.popover("hide");
						el.popover("destroy");
					},3000);
					return;
				}
				var self = this;
				if ( game.get("currentUserId") === currentUserId ) {
					this.realEnterGame(game);
				} else if ( game.get("currentUserId") === "") {
					if ( game.hasUser(currentUserId) ){
						return;
					}
					game.collection.firebase.child(game.get("id")+"/currentUserId").transaction(function( id ) {
						console.log("old id:"+id);
						if ( id === "" ){
							return currentUserId;
						}
						return;
					}, function(error, committed, snapshot) {
						if ( error ){
							console.log('Transaction failed abnormally!', error);
							//try again
							setTimeout(function(){
								console.log("try again");
								self.enterGame(game);
							},100);
						} else if ( !committed ){
							console.log('We aborted the transaction (because other player is occupy).');
						} else
							self.realEnterGame(game);
					});
				}
			} else if ( game.get("status") === "close" ){
				this.realEnterGame(game);
			}	
		},

		realEnterGame: function(game){
			history.pushState({status:"game",modelId:game.get("id")}, "游戏","?game="+game.get("id"));
			Main.showGame(game.get("id"));
			history.go(1);
		},

		refresh: function(){
			//this.onResetGames();
		},

		onBackToLobby:function(){
			history.back();
		},

		onAddGame:function(game){
			console.log("on add game "+game.get("id"));
			if ( this.views[game.get("id")] ){
				return;
			}
			this.views[game.get("id")] = new GameItemView({model:game, roomView:this});
			this.views[game.get("id")].render();
		},
		
		onRemoveGame:function(game){
			console.log("on remove game "+game.get("id"));
			if ( this.views[game.get("id")] ){
				this.views[game.get("id")].remove();
				delete this.views[game.get("id")];
			}
		},
		
		onResetGames:function(){
			console.log("on reset games");
			this.$("#my-game-list").empty();
			this.$("#game-list").empty();
			this.$("#completed-game-list").empty();
			this.games.each( this.onAddGame, this);
		}
	});
});

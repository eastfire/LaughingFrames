define(function(require, exports, module) {
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
			this.$el.html( this.template(this.model.toJSON()) );
		},
		
		onEnter:function(){
			this.options.roomView.enterGame(this.model);
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
			this.$("#user-limit").prop("selectedIndex", this.$("#user-limit option[value="+this.model.get("userLimit")+"]").index() );
			this.$("#time-limit").prop("selectedIndex", this.$("#time-limit option[value="+this.model.get("timeLimit")+"]").index() );
			var currentUserId = currentUser.get("id");
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
			}

			this.ownOpenCount = 0;
			this.games = this.model.getGames();
			this.games.on('add', this.onAddGame, this);
			this.games.on('reset', this.onResetGames);
			
			this.userIds = this.model.collection.firebase.child(this.model.get("id")+"/userIds");
			
			this.renderUsers();
			
			this.games.each(function(game){
				if ( game.get("ownerId") === currentUserId && game.get("status") === "open" )
					this.ownOpenCount ++;
			},this);

			this.onResetGames();

			$('#myTab a').click(function (e) {
				e.preventDefault()
				$(this).tab('show')
			})

			
			this.$("#game-tabs a:first").tab('show');
		},
		
		renderUsers : function(){
			this.$("#user-list").empty();
			for ( var id in this.model.get("userIds") ){
				var user = window.users.get(id);
				this.$("#user-list").append("<div class='user-item'><label>"+user.get("name")+"</label></div>");
			}
		},

		onJoinRoom:function(){
			this.userIds.child(currentUser.get("id")).set(true);
			this.initialize();
		},

		onLeaveRoom:function(){
			this.userIds.child(currentUser.get("id")).remove();
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
			if ( this.ownOpenCount >= 0 ){
				$(event.currentTarget).popover({
					content: "由于资源有限，每个玩家创建且未完成的游戏只能有3个。请耐心等待其他玩家接力完成。",
					delay: { show: 3000, hide: 100 },
				});
				return;
			}
			var self = this;
			var b = $(event.currentTarget);
			b.attr("disabled","disabled").addClass("loading");

			this.games.create({ownerId: currentUser.get("id"), timestamp: (new Date()).getTime(), currentUserId : currentUser.get("id") },{
				success:function(game){
					//enter game
					self.enterGame( game );
					b.removeAttr("disabled").removeClass("loading");
				},
				error:function(){
					b.removeAttr("disabled").removeClass("loading");
				}
			});
		},
		
		enterGame: function(game){
			if ( game.get("status") == "open" && !this.model.hasUser(currentUser.get("id")) ){
				return;
			}
			var self = this;
			game.collection.firebase.child(game.get("id")+"/currentUserId").transaction(function( id ) {
				if ( id != 0 ){
					return id
				}
				if ( game.hasUser(currentUser.get("id")) ){
					return id;
				}
				return currentUser.get("id");
			}, function(error, committed, snapshot) {
				if ( committed ){
					$("#room").hide();
					var el = $("<div>");
					$("#game").append(el);
					if ( game.get("status") == "open" ) {
						var view = new GameView({
							model: game,
							room: self,
							el: el
						});
					} else {
						var view = new CompletedGameView({
							model: game,
							room: self,
							el: el
						});
					}
				} else {
					console.log( "enterGame error:"+error + " , "+committed);
				}				
			});

		},

		refreshRoom: function(){
			this.onResetGames();
		},

		onBackToLobby:function(){
			$("#lobby").show();
			this.options.lobby.refresh();
			this.remove();
		},

		onAddGame:function(game){
			if ( this.$("#"+game.get("id") ).length != 0)
				this.$("#"+game.get("id") ).remove();
			
			if ( game.get("status") === 'open' ){
				if ( game.get("currentUserId") == currentUser.get("id") )	{
					var view = new GameItemView({model:game, roomView:this});
					this.$("#my-game-list").prepend(view.render().$el);
				} else if ( game.get("currentUserId") == 0 && !game.hasUser(currentUser.get("id")) ){
					var view = new GameItemView({model:game, roomView:this});
					this.$("#game-list").prepend(view.render().$el);
				}
			} else {
				var view = new GameItemView({model:game, roomView:this});
				this.$("#completed-game-list").prepend(view.render().$el);
			}
		},
		
		onResetGames:function(){
			this.$("#my-game-list").empty();
			this.$("#game-list").empty();
			this.$("#completed-game-list").empty();
			this.games.each( this.onAddGame, this);
		}
	});
});

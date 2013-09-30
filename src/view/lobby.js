define(function(require, exports, module) {
	window.USER_LIMIT_ROOM = 2;
	var lobbyTemplate = $("#lobby-template").html();
	var roomItemTemplate = $("#room-item-template").html();
	var RoomView = require("./room").RoomView;

	var RoomItemView = Backbone.View.extend({
		template: _.template(roomItemTemplate),

		events: {
			"click": "onEnter"
		},

		initialize:function(){
			this.$el.html( this.template(this.model.toJSON()) );			
		},
		
		onEnter:function(){
			/*$("#lobby").hide();
			$("#room").empty();
			var el = $("<div></div>").appendTo($("#room"));
			var view = new RoomView({
				model: this.model,
				el: el
			});*/
			history.pushState({status:"room",modelId:this.model.get("id")}, "房间："+this.model.get("name"),"?room="+this.model.get("id"));
			Main.showRoom(this.model.get("id"));
			history.go(1);
		}
	});

	exports.LobbyView = Backbone.View.extend({
		template: _.template(lobbyTemplate),

		events: {
			"click #create-room": "onCreate"
		},

		initialize:function(){
			this.initData();
			this.initLayout();
			this.$el.data("view",this);
		},
		
		initData:function(){
			var DataModel = require("../model/data-model");
			this.ownCount = 0;
			this.rooms = new DataModel.Rooms([],{firebase: myFirebase.child("/rooms")});
			
			this.rooms.on('add', this.onAddOneRoom, this);
			this.rooms.on('reset', this.onAddAllRooms);
			this.rooms.on('all', this.render);

			this.$("#room-tabs li:first a").tab('show');
		},

		onAddOneRoom : function(room){
			this.$("#room-list").removeClass("loading");
			this.$("#my-room-list").removeClass("loading");
			var view = new RoomItemView({model:room, lobby:this});
			if ( room.get("ownerId") == currentUserId )
				this.ownCount++;
			if ( room.hasUser(currentUserId) ){
				this.$("#my-room-list").prepend(view.render().$el);
			} else {
				this.$("#room-list").prepend(view.render().$el);
			}
		},
		
		onAddAllRooms : function(){			
			this.$("#room-list").empty();
			this.$("#my-room-list").empty();

			this.rooms.each( this.onAddOneRoom, this);
		},

		initLayout:function(){
			var self = this;
			this.$el.html( this.template() );
		},
		
		refresh: function(){
			this.onAddAllRooms();
		},
		
		onCreate: function(event){
			if ( this.ownCount >= USER_LIMIT_ROOM ) {
				$(event.currentTarget).popover({
					content:"由于资源有限，每个玩家只能创建"+USER_LIMIT_ROOM+"个房间"
				});
				$(event.currentTarget).popover("show");
				setTimeout(function(){
					$(event.currentTarget).popover("hide");
				},3000)
				return;
			}
			
			var self = this;
			var name = this.$("#room-name").val().trim();
			if ( name != ""){
				var b = $(event.currentTarget);
				b.attr("disabled","disabled").addClass("loading");
				var userIds = {};
				userIds[currentUserId] = true;
				var room = this.rooms.add({timestamp:(new Date()).getTime(), name: name, ownerId: currentUserId, userIds: userIds }, {
					success:function(){
						self.$("#room-name").val("")
						b.removeAttr("disabled").removeClass("loading");
					},
					error:function(){
						b.removeAttr("disabled").removeClass("loading");
					}
				});
			}
		}
	});
});

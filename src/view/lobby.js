define(function(require, exports, module) {
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
			$("#lobby").hide();
			var el = $("<div></div>").appendTo($("#room"));
			var view = new RoomView({
				model: this.model,
				el: el,
				lobby: this.options.lobby
			});
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
		},
		
		initData:function(){
			var DataModel = require("../model/data-model");
			this.rooms = new DataModel.Rooms([],{firebase: myFirebase.child("/rooms")});
			
			this.rooms.on('add', this.onAddOneRoom, this);
			this.rooms.on('reset', this.onAddAllRooms);
			this.rooms.on('all', this.render);
		},

		onAddOneRoom : function(room){
			this.$("#room-list").removeClass("loading");
			this.$("#my-room-list").removeClass("loading");
			var view = new RoomItemView({model:room, lobby:this});
			if ( room.hasUser(currentUser.get("id")) ){
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
			var self = this;
			var name = this.$("#room-name").val().trim();
			if ( name != ""){
				var b = $(event.currentTarget);
				b.attr("disabled","disabled").addClass("loading");
				this.rooms.add({timestamp:(new Date()).getTime(), name: name, ownerId: currentUser.get("id"), userIds:[currentUser.get("id")] }, {
					success:function(){
						self.$("#room-name").val("")
						b.removeAttr("disabled").removeClass("loading");
					},
					error:function(){
						b.removeAttr("disabled").removeClass("loading");
					}
				})
			}
		}
	});
});
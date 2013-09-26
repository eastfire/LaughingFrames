define(function(require, exports, module) {
	var comletedGameTemplate = $("#completed-game-template").html();

	exports.CompletedGameView = Backbone.View.extend({
		template: _.template(comletedGameTemplate),

		events: {

		},

		initialize:function(){
			this.$el.html( this.template({game:this.model.toJSON()}) );

			this.drawings = this.model.getDrawings();
			this.drawings.on("add",this.onAddDrawing, this);
			this.drawings.on("reset",this.onAddAllDrawing, this);
			this.drawingList = this.$("#drawing-list");

			for ( var i = 0; i < this.drawings.length ; i++){
				var drawing = this.drawings.at(i);
				var word = drawing.get("word");
				var el
				if ( word ){
					var el = $("<div class='guessing'><div><span class='user'></span><span><label>"+word+"<label></span></div><div class='comment-list'></div></div>");
					this.drawingList.append(el);
				} else {
					var el = $("<div class='drawing'><div><span class='user'></span><span><img src='"+drawing.get("pic")+"'/></span></div><div class='comment-list'></div></div>");
					this.drawingList.append(el);
				}
				var user = users.get(drawing.get("ownerId"));
				el.find(".user").append("<label>"+user.get("name")+"<label><label>：</label>");
			}
		},
		
		onAddDrawing:function(drawing){
			console.log("on add drawing");
		},
		
		onAddAllDrawing:function(drawing){
			console.log("on add all drawing");
		},

		backToRoom: function(){
			this.options.room.refreshRoom();
			$("#room").show();
			this.remove();
		},	

	});
});
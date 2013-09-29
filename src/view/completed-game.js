define(function(require, exports, module) {
	var comletedGameTemplate = $("#completed-game-template").html();

	exports.CompletedGameView = Backbone.View.extend({
		template: _.template(comletedGameTemplate),

		events: {
			"click #back-to-room":"backToRoom",
			"click .comments": "toggleComments",
			"click .submit-comment" : "submitComment",
			"keyup .my-comment" : "inputComment"
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
					var el = $("<div class='drawing guessing' id='"+drawing.get("id")+"'><div><span class='user'></span><span class='word'><label>"+word+"<label></span></div><label class='comments'>吐槽("+_.size(drawing.get("comments"))+")</label><div class='comment-list' style='display:none'></div></div>");
					this.drawingList.append(el);
				} else {
					var el = $("<div class='drawing' id='"+drawing.get("id")+"'><div><span class='user'></span><span><img src='"+drawing.get("pic")+"'/></span></div><label class='comments'>吐槽("+_.size(drawing.get("comments"))+")</label><div class='comment-list' style='display:none'></div></div>");
					this.drawingList.append(el);
				}
				var user = users.get(drawing.get("ownerId"));
				if ( user ) {
					el.find(".user").append("<div><label>"+user.get("name")+"<label><label>：</label></div><div>"+relative_time_text(drawing.get("timestamp"))+"</div>");
				}
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
		
		toggleComments : function(event){
			var target = $(event.currentTarget);
			var id = target.parents(".drawing").attr("id");
			var drawing = this.drawings.get(id);
			var commentList = target.siblings(".comment-list");
			if ( commentList.css("display") == "none" ){
				this.renderComments(drawing, commentList);
			}
			commentList.toggle("drop");
		},

		renderComments : function(drawing, el){
			el.empty();
			el.append("<div class='input-group'><input class='form-control my-comment' placeholder='我要吐槽'/><span class='input-group-btn'><button class='btn btn-default submit-comment'>发表</button></span></div>");
			var list = $("<div class='real-comment-list'><div>");

			el.append(list);
			var comments = drawing.getComments();
			for ( var i = 0 ; i < comments.length; i ++){
				var comment = comments.at(i);
				var user = users.get( comment.get("userId") );
				if ( user )	{
					list.prepend( "<div class='comment'><label class='comment-user'>"+user.get("name")+"</label>：<label class='comment-content'>"+comment.get("content")+" ("+relative_time_text(comment.get("timestamp"))+")</label></div>");
				}
			}
		},

		inputComment: function(event){
			if ( event.keyCode == 13 ){
				this.submitComment(event);
			}
		},
		
		submitComment : function(event){
			var target = $(event.currentTarget);
			var commentList = target.parents(".comment-list");
			var myComment = commentList.find(".my-comment").val().trim();
			if ( !myComment )
				return;
			var id = target.parents(".drawing").attr("id");
			var drawing = this.drawings.get(id);
			var comments = drawing.getComments();
			var self = this;
			comments.add({
				content: myComment,
				userId : currentUserId,
				timestamp : (new Date()).getTime()
			}, {
				success:function(){
					self.renderComments(drawing, commentList);
				}
			});
		}
	});
});

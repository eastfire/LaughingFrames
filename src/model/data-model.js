define(function(require, exports, module) {
	exports.User = Backbone.Model.extend({
		defaults:function(){
			return {
				name:"",
				portrait:"",
				roomIds:[],
				score:{
					good:0,
					awkward:0,
					bad:0
				}
			};
		}
	})

	exports.Users = Backbone.Firebase.Collection.extend({
	    model: exports.User,
	    firebase: myFirebase.child("/users")
	});

	exports.Room = Backbone.Model.extend({
		defaults:function(){
			return {
				name:"",
				ownerId:0,
				userIds:{},
				status : "open", //open, close
				passcode : null,

				timeLimit : 0,
				userLimit : 10,

				games: {}
			};
		},
		
		hasUser:function(id){
			return this.get("userIds") && this.get("userIds")[id];
		},

		getGames:function(){
			if ( !this._games )
				this._games = new exports.Games([],{firebase: this.collection.firebase.child("/"+this.get("id")+"/games")});
			return this._games;
		},

		getUserLimit:function(){
			if ( this.get("userLimit") == 0 ){
				Math.max( _.size(this.get("userIds")), 4 );
			} else
				return this.get("userLimit");
		}
	})
	
	exports.Rooms = Backbone.Firebase.Collection.extend({
	    model: exports.Room,
	});

	exports.Game = Backbone.Model.extend({
		defaults:function(){
			return {
				ownerId:0,
				drawings:{},
				currentUserId : "",
				status : "open", //open, close
				timestamp : 0,
				updateTime : 0
			};
		},
		
		getDrawings:function(){
			if ( !this._drawings )
				this._drawings = new exports.Drawings([],{firebase: this.collection.firebase.child("/"+this.get("id")+"/drawings")});
			return this._drawings;
		},

		hasUser:function(id){
			if ( id == this.get("ownerId") )
				return true;
			for ( var key in this.get("drawings") )	{
				var d = this.get("drawings")[key];
				if ( d.question )
					continue;
				if ( d.ownerId === id )
					return true;
			}
			return false;
		},
	})
	
	exports.Games = Backbone.Firebase.Collection.extend({
	    model: exports.Game	    
	});

	exports.Drawing = Backbone.Model.extend({
		defaults:function(){
			return {
				ownerId:0,
				word: null,
				pic : null,
				comments: {},
				timestamp : 0
			};
		},
		getComments:function(){
			if ( !this._comments )
				this._comments = new exports.Comments([],{firebase: this.collection.firebase.child("/"+this.get("id")+"/comments")});
			return this._comments;
		},
	})
	
	exports.Drawings = Backbone.Firebase.Collection.extend({
	    model: exports.Drawing
	});

	exports.Comment = Backbone.Model.extend({
		defaults:function(){
			return {
				userId: 0,
				content: "",
				timestamp : 0
			};
		}
	})
	
	exports.Comments = Backbone.Firebase.Collection.extend({
	    model: exports.Comment
	});
});

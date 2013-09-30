define(function(require, exports, module) {
	var RoomView = require("./room").RoomView;
	var GameView = require("./game").GameView;
	var CompletedGameView = require("./completed-game").CompletedGameView;

	window.onpopstate = function(event){
		if ( !event.state )
			return;
		if ( event.state.status === 'lobby' ) {
			exports.showLobby();
		} else if ( event.state.status === 'room' ) {
			exports.showRoom(event.state.modelId);
		} else if ( event.state.status === 'game' ) {
			exports.showGame(event.state.modelId);
		}
	}
	
	exports.showLobby = function(){
		$("#lobby").show();
		$("#lobby").data("view").refresh();
		$("#room").hide().empty();
		$("#game").hide().empty();
	}

	exports.showRoom = function(modelId){
		$("#lobby").hide();
		$("#room").show().empty();
		$("#game").hide().empty();
		var el = $("<div></div>").appendTo($("#room"));
		var view = new RoomView({
			model: $("#lobby").data("view").rooms.get(modelId),
			el: el
		});
		view.refresh();
	}

	exports.showGame = function(modelId){
		$("#room").hide();
		$("#lobby").hide();
		$("#game").show().empty();
		var el = $("<div>");
		$("#game").append(el);
		var game = $("#room > div").data("view").games.get(modelId);
		if ( game.get("status") == "open" ) {
			var view = new GameView({
				model: game,
				el: el
			});
		} else {
			var view = new CompletedGameView({
				model: game,
				el: el
			});
		}
	}
});

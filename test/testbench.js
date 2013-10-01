define(function(require, exports, module) {
	window.myFirebase = new Firebase("https://laughing-frames.firebaseio.com");
	window.Main = require("../src/view/main");
	var MainView = require("../src/view/lobby").LobbyView;

	var DataModel = require("../src/model/data-model");
	window.users = new DataModel.Users([],{firebase: myFirebase.child("/users")});
	if ( !window.currentUser )	{
		$("#login-dialog #login").val("");
		$("#login-dialog").modal({
			keyboard:false
		});
		$("#user-name").focus();

		var login = function(){
			var name = $("#login-dialog #user-name").val();
			if ( name )	{
				window.currentUser = window.users.get(name);
				if ( window.currentUser == null ){
					window.users.add({id:name, name: name}, {
						success : function(){
							$("#login-dialog").modal("hide");
							var main = new MainView({
								el : $("#lobby"),
							});
							window.currentUser = window.users.get(name);
							window.currentUserId = currentUser.get("id");
							history.pushState({status:"lobby"}, "大厅","?lobby");
							history.go(1);
						},
						error:function(){
						}
					});
				} else {
					window.currentUserId = currentUser.get("id");
					$("#login-dialog").modal("hide");
					var main = new MainView({
						el : $("#lobby"),
					});
					history.pushState({status:"lobby"}, "大厅","?lobby");
					history.go(1);
				}
			}
		};
		$("#login-dialog #user-name").on("keyup", function(event){
			if ( event.keyCode == 13 ){
				login();
			}
		});
		$("#login-dialog #login").on("click", login);
	}
	
	//window.currentUser = new DataModel.User({id:1, name:"eastfire"});

});

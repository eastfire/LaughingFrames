define(function(require, exports, module) {
	window.myFirebase = new Firebase("https://laughing-frames.firebaseio.com");
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
				window.currentUser = window.users.add({id:name, name: name}, {
					success : function(){
						$("#login-dialog").modal("hide");
						var main = new MainView({
							el : $("#lobby"),
						});
						window.currentUserId = currentUser.get("id");
					},
					error:function(){
					}
				});
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

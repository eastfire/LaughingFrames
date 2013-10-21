(function(window){
	
var tipsChain = function( array, options ) {
	return tipsChain.prototype.init ( array, options );
};
tipsChain.prototype = {
	currentIndex : -1,
	
	init: function( tips, options ) {
		return new {
			tips : tips,
			options : options
		};
	},

	show: function(index){
		var tip = this.tips[currentIndex];
		var self = this;
		var el = null;
		var newEl = false;
		if ( tip.el instanceof $ ){
			el = tip.el;
		} else if ( typeof tip.el == "string" )	{
			el = $(tip.el);
		} else if ( typeof tip.el == "object") {
			newEl = true;
			el = $("<div style='position:absolute;left:"+tip.el.x+";top:"+tip.el.y+"'></div>");
			$("body").append(el);
		}
		if ( el ){
			el.popover(_.extend({
				content:tip.content,
				trigger:"manual",
				
			}, tip.popover));
			el.popover("show");
			el.on('hidden.bs.popover', function () {
				el.popover('destroy');
				el.off('hidden.bs.popover');
				if ( tip.post && _.isFunction(tip.post) ){
					tip.post();
				}
				if ( tip.next ){
					self.next();
				}
				if ( newEl ){
					el.remove();
				}
			})

		}
	},
	
	next: function(){
		currentIndex ++;
		if ( currentIndex < this.tips.length ){
			var tip = this.tips[currentIndex];
			if ( tip.condition && _.isFunction(tip.condition) ){
				if ( tip.condition() ) {
					this.show(currentIndex);
				}
			} else
				this.show(currentIndex);
		}
	},
	complete:function(){

	}
}




if ( typeof window === "object" && typeof window.document === "object" ) {
	window.tipsChain = tipsChain;
}

})(window);
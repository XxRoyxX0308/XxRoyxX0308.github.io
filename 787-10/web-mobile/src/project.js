require=function e(t,n,o){function s(i,a){if(!n[i]){if(!t[i]){var d="function"==typeof require&&require;if(!a&&d)return d(i,!0);if(c)return c(i,!0);var r=new Error("Cannot find module '"+i+"'");throw r.code="MODULE_NOT_FOUND",r}var h=n[i]={exports:{}};t[i][0].call(h.exports,function(e){var n=t[i][1][e];return s(n||e)},h,h.exports,e,t,n,o)}return n[i].exports}for(var c="function"==typeof require&&require,i=0;i<o.length;i++)s(o[i]);return s}({ButtonEventSender:[function(e,t,n){"use strict";cc._RF.push(t,"abaeeurOvZMIpisr7UBs2lR","ButtonEventSender"),cc.Class({extends:cc.Component,properties:{isAutoReg:{default:!0},autoRegBtn:{default:null,type:cc.Button},onEvent:{default:[],type:cc.Component.EventHandler},args:{default:[],type:cc.String},callHandler:{default:null,type:cc.Component.EventHandler,visible:!1}},onLoad:function(){if(this.isAutoReg){var e;this.autoRegBtn&&(e=this.autoRegBtn.getComponent(cc.Button)),e||(e=this.node.getComponent(cc.Button)),e&&(this.callHandler||(this.callHandler=this._newEventHandler("ButtonEventSender","call"),e.clickEvents.push(this.callHandler)))}},call:function(){for(var e in this.onEvent)this.onEvent[e].emit(this.args)},_newEventHandler:function(e,t){var n=new cc.Component.EventHandler;return n.target=this.node,n.component=e,n.handler=t,n}}),cc._RF.pop()},{}],CardObj:[function(e,t,n){"use strict";cc._RF.push(t,"94863/0kr9GS4PFfU53YQu/","CardObj"),cc.Class({extends:cc.Component,statics:{cards:{}},properties:{cardName:{default:""},isHideOnLoad:{default:!0},showCount:0,onShowed:{default:[],type:cc.Component.EventHandler}},onLoad:function(){""==this.cardName&&(this.cardName=this.node.name),e("CardObj").cards[this.cardName]=this,this.isHideOnLoad&&(this.show(),this.hide()),cc.log("onload "+this.cardName)},start:function(){},show:function(){this.showCount++,this._checkAndShowHide(),cc.log("show "+this.cardName)},hide:function(){this.showCount>0&&this.showCount--,this._checkAndShowHide(),cc.log("hide "+this.cardName)},_checkAndShowHide:function(){var e=this.showCount>0;if(e&&!this.node.active)for(var t in this.onShowed)this.onShowed[t].emit();this.node.active=e}}),cc._RF.pop()},{CardObj:"CardObj"}],FirstLoad:[function(e,t,n){"use strict";cc._RF.push(t,"b963e7BJDFCgohIZblcGyC+","FirstLoad"),cc.Class({extends:cc.Component,statics:{isLoaded:!1},properties:{onFirstLoad:{default:[],type:cc.Component.EventHandler},args:{default:[],type:cc.String}},onLoad:function(){if(cc.log(e("FirstLoad").isLoaded),!e("FirstLoad").isLoaded){e("FirstLoad").isLoaded=!0;for(var t in this.onFirstLoad)this.onFirstLoad[t].emit(this.args)}}}),cc._RF.pop()},{FirstLoad:"FirstLoad"}],LevelObj:[function(e,t,n){"use strict";cc._RF.push(t,"739363BZoVEcpNwWllMhjVP","LevelObj");var o=e("CardObj"),s=e("PageObj");cc.Class({extends:cc.Component,properties:{levelName:{default:""},backgroundPages:{default:[],type:cc.String},pages:{default:[],type:cc.String},pageHistory:{default:[],type:cc.Integer},currentIdx:{default:0},isAutoShowPage1:{default:!0}},start:function(){console.log(e("PageObj").pages),this.isAutoShowPage1&&this.pages.length>0&&this.begin()},_show:function(e){this.currentIdx=e;var t=this.pages[e];s.pages[t].getComponent("PageObj").show();for(var n in this.pages){var o=this.pages[n];n!=e&&null!=s.pages[o]&&(null!=s.pages[o]&&s.pages[o].getComponent("PageObj").hide())}},show:function(e){e>=0&&e<this.pages.length&&(this._show(e),this.pageHistory.push(e))},begin:function(){for(var e in this.backgroundPages){var t=this.backgroundPages[e];cc.log(o.cards.Card_Main),null!=o.cards[t]&&o.cards[t].getComponent("CardObj").show()}this.show(0)},end:function(){for(var e in this.backgroundPages){t=this.backgroundPages[e];null!=o.cards[t]&&o.cards[t].getComponent("CardObj").hide()}for(var e in this.pages){var t=this.pages[e];null!=s.pages[t]&&this.pages[t].getComponent("PageObj").hide()}},showByName:function(e){cc.log("showByName",e);var t=-1;for(var n in this.pages){var o=this.pages[n];if(null!=s.pages[o]&&s.pages[o].getComponent("PageObj").pageName==e){t=n;break}}-1!=t&&this.show(t)},back:function(){this.pageHistory.pop(),this._show(this.pageHistory[this.pageHistory.length-1])}}),cc._RF.pop()},{CardObj:"CardObj",PageObj:"PageObj"}],LoadLevelObj:[function(e,t,n){"use strict";cc._RF.push(t,"a8e8egetRhGpY4CrTjHktLT","LoadLevelObj");var o=cc.Class({extends:cc.Component,statics:{instance:null},properties:{loadingNode:{default:null,type:cc.Node}},onLoad:function(){o.instance=this,this.loadingNode&&(this.loadingNode.active=!1)},loadLevel:function(e){this.loadingNode&&(this.loadingNode.active=!0),cc.director.preloadScene(e,function(){cc.director.loadScene(e)})}});cc._RF.pop()},{}],LoadScene:[function(e,t,n){"use strict";cc._RF.push(t,"47182X4XOxAB5eSRDQLJS9q","LoadScene"),cc.Class({extends:cc.Component,properties:{defaultToLoad:{default:""}},onLoad:function(){},loadScene:function(e){cc.log(123123),""!=e&&null!=e||(e=this.defaultToLoad),cc.director.loadScene(e)}}),cc._RF.pop()},{}],MouseEvent:[function(e,t,n){"use strict";cc._RF.push(t,"6df0ft1jy5Jg4cQ039jt8jC","MouseEvent"),cc.Class({extends:cc.Component,properties:{},move:function(e){this.node.x+=e.getDeltaX(),this.node.y+=e.getDeltaY()},onLoad:function(){this.scroll=0,this.node.opacity=50,this.node.on(cc.Node.EventType.MOUSE_DOWN,function(){this.node.opacity=255,this.node.on(cc.Node.EventType.MOUSE_MOVE,this.move,this)},this),this.node.on(cc.Node.EventType.MOUSE_ENTER,function(){this.node.opacity=160},this),this.node.on(cc.Node.EventType.MOUSE_LEAVE,function(){this.node.opacity=50,this.node.off(cc.Node.EventType.MOUSE_MOVE,this.move,this)},this),this.node.on(cc.Node.EventType.MOUSE_UP,function(){this.node.opacity=50,this.node.off(cc.Node.EventType.MOUSE_MOVE,this.move,this),this._callback&&this._callback()},this),this.node.on(cc.Node.EventType.MOUSE_WHEEL,function(e){this.scroll+=e.getScrollY();var t=this.node.height;this.scroll=cc.clampf(this.scroll,-2*t,.7*t),this.node.scale=1-this.scroll/t},this)}}),cc._RF.pop()},{}],PageObj:[function(e,t,n){"use strict";cc._RF.push(t,"a6cbdyKouNDILHcpd7M9mpZ","PageObj");var o=e("CardObj");cc.Class({extends:cc.Component,statics:{pages:{}},properties:function(){return{isShowed:!1,cards:{default:[],type:cc.String},pageName:{default:""}}},onLoad:function(){e("PageObj").pages[this.pageName]=this,this.hide()},show:function(){if(!this.isShowed){this.isShowed=!0;for(var e in this.cards){var t=this.cards[e];null!=o.cards[t]&&o.cards[t].getComponent("CardObj").show()}}},hide:function(){if(0!=this.isShowed){this.isShowed=!1;for(var e in this.cards){cc.log(this.cards);var t=this.cards[e];null!=o.cards[t]&&o.cards[t].getComponent("CardObj").hide()}}}}),cc._RF.pop()},{CardObj:"CardObj",PageObj:"PageObj"}],ScaleOnBtnHover:[function(e,t,n){"use strict";cc._RF.push(t,"469a1KnBpVBzLlw3t+Ajog/","ScaleOnBtnHover"),cc.Class({extends:cc.Component,properties:{scale:{default:1.2},btn:{default:null,type:cc.Button}},onLoad:function(){var e=this;null==e.btn&&(e.btn=e.node.getComponent(cc.Button)),e.node.on("mouseenter",function(t){e.node.scale*=e.scale,cc.log(123123132132)}),e.node.on("mouseleave",function(t){e.node.scale/=e.scale,cc.log(321321321321321)}),cc.log(45455454)}}),cc._RF.pop()},{}]},{},["ButtonEventSender","MouseEvent","LoadLevelObj","FirstLoad","LoadScene","ScaleOnBtnHover","CardObj","LevelObj","PageObj"]);
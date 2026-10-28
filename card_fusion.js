/* Card Fusion 1.1.0-beta.2 | original sources: Cardify+, Interface+, user's YMod, MDB Ratings (@bodya_elven). */
if (!window.CardFusionBundleLoaded) {
window.CardFusionBundleLoaded = true;

/* ========= CARDIFY ========= */
(function () {
	"use strict";

	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) {
			throw new TypeError("Cannot call a class as a function");
		}
	}

	function _defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];
			descriptor.enumerable = descriptor.enumerable || false;
			descriptor.configurable = true;
			if ("value" in descriptor) descriptor.writable = true;
			Object.defineProperty(target, descriptor.key, descriptor);
		}
	}

	function _createClass(Constructor, protoProps, staticProps) {
		if (protoProps) _defineProperties(Constructor.prototype, protoProps);
		if (staticProps) _defineProperties(Constructor, staticProps);
		return Constructor;
	}

	function _toConsumableArray(arr) {
		return (
			_arrayWithoutHoles(arr) ||
			_iterableToArray(arr) ||
			_unsupportedIterableToArray(arr) ||
			_nonIterableSpread()
		);
	}

	function _arrayWithoutHoles(arr) {
		if (Array.isArray(arr)) return _arrayLikeToArray(arr);
	}

	function _iterableToArray(iter) {
		if (
			(typeof Symbol !== "undefined" && iter[Symbol.iterator] != null) ||
			iter["@@iterator"] != null
		)
			return Array.from(iter);
	}

	function _unsupportedIterableToArray(o, minLen) {
		if (!o) return;
		if (typeof o === "string") return _arrayLikeToArray(o, minLen);
		var n = Object.prototype.toString.call(o).slice(8, -1);
		if (n === "Object" && o.constructor) n = o.constructor.name;
		if (n === "Map" || n === "Set") return Array.from(o);
		if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
			return _arrayLikeToArray(o, minLen);
	}

	function _arrayLikeToArray(arr, len) {
		if (len == null || len > arr.length) len = arr.length;

		for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

		return arr2;
	}

	function _nonIterableSpread() {
		throw new TypeError(
			"Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
		);
	}

	function _createForOfIteratorHelper(o, allowArrayLike) {
		var it =
			(typeof Symbol !== "undefined" && o[Symbol.iterator]) || o["@@iterator"];

		if (!it) {
			if (
				Array.isArray(o) ||
				(it = _unsupportedIterableToArray(o)) ||
				(allowArrayLike && o && typeof o.length === "number")
			) {
				if (it) o = it;
				var i = 0;

				var F = function () {};

				return {
					s: F,
					n: function () {
						if (i >= o.length)
							return {
								done: true
							};
						return {
							done: false,
							value: o[i++]
						};
					},
					e: function (e) {
						throw e;
					},
					f: F
				};
			}

			throw new TypeError(
				"Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
			);
		}

		var normalCompletion = true,
			didErr = false,
			err;
		return {
			s: function () {
				it = it.call(o);
			},
			n: function () {
				var step = it.next();
				normalCompletion = step.done;
				return step;
			},
			e: function (e) {
				didErr = true;
				err = e;
			},
			f: function () {
				try {
					if (!normalCompletion && it.return != null) it.return();
				} finally {
					if (didErr) throw err;
				}
			}
		};
	}

	function State(object) {
		this.state = object.state;

		this.start = function () {
			this.dispath(this.state);
		};

		this.dispath = function (action_name) {
			var action = object.transitions[action_name];

			if (action) {
				action.call(this, this);
			} else {
				console.log("invalid action");
			}
		};
	}

	var Player = (function () {
		function Player(object, video, isBgMode) {
			var _this = this;

			_classCallCheck(this, Player);

			this.paused = false;
			this.display = false;
			this.ended = false;
			this.isBgMode = isBgMode;
			this.video = video;
			this.listener = Lampa.Subscribe();

			this.html = $(
				'\n            <div class="cardify-trailer">\n                <div class="cardify-trailer__youtube">\n                    <div class="cardify-trailer__youtube-iframe"></div>\n                    <div class="cardify-trailer__youtube-line one"></div>\n                    <div class="cardify-trailer__youtube-line two"></div>\n                </div>\n' + 
				(!this.isBgMode ? '\n                <div class="cardify-trailer__controlls">\n                    <div class="cardify-trailer__title"></div>\n                    <div class="cardify-trailer__remote">\n                        <div class="cardify-trailer__remote-icon">\n                            <svg width="37" height="37" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg">\n                                <path d="M32.5196 7.22042L26.7992 12.9408C27.8463 14.5217 28.4561 16.4175 28.4561 18.4557C28.4561 20.857 27.6098 23.0605 26.1991 24.7844L31.8718 30.457C34.7226 27.2724 36.4561 23.0667 36.4561 18.4561C36.4561 14.2059 34.983 10.2998 32.5196 7.22042Z" fill="white" fill-opacity="0.28"/>\n                                <path d="M31.262 31.1054L31.1054 31.262C31.158 31.2102 31.2102 31.158 31.262 31.1054Z" fill="white" fill-opacity="0.28"/>\n                                <path d="M29.6917 32.5196L23.971 26.7989C22.3901 27.846 20.4943 28.4557 18.4561 28.4557C16.4179 28.4557 14.5221 27.846 12.9412 26.7989L7.22042 32.5196C10.2998 34.983 14.2059 36.4561 18.4561 36.4561C22.7062 36.4561 26.6123 34.983 29.6917 32.5196Z" fill="white" fill-opacity="0.28"/>\n                                <path d="M5.81349 31.2688L5.64334 31.0986C5.69968 31.1557 5.7564 31.2124 5.81349 31.2688Z" fill="white" fill-opacity="0.28"/>\n                                <path d="M5.04033 30.4571L10.7131 24.7844C9.30243 23.0605 8.4561 20.857 8.4561 18.4557C8.4561 16.4175 9.06588 14.5217 10.113 12.9408L4.39251 7.22037C1.9291 10.2998 0.456055 14.2059 0.456055 18.4561C0.456054 23.0667 2.18955 27.2724 5.04033 30.4571Z" fill="white" fill-opacity="0.28"/>\n                                <path d="M6.45507 5.04029C9.63973 2.18953 13.8455 0.456055 18.4561 0.456055C23.0667 0.456054 27.2724 2.18955 30.4571 5.04034L24.7847 10.7127C23.0609 9.30207 20.8573 8.45575 18.4561 8.45575C16.0549 8.45575 13.8513 9.30207 12.1275 10.7127L6.45507 5.04029Z" fill="white" fill-opacity="0.28"/>\n                                <circle cx="18.4565" cy="18.4561" r="7" fill="white"/>\n                            </svg>\n                        </div>\n                        <div class="cardify-trailer__remote-text">'.concat(
					Lampa.Lang.translate("cardify_enable_sound"),
					"</div>\n                    </div>\n                </div>\n"
				) : "") + '            </div>\n        '
			);
		}

		_createClass(Player, [
			{
				key: "initYoutube",
				value: function initYoutube() {
					var _this = this;
					this.youtube = new window.YT.Player(
						this.html.find(".cardify-trailer__youtube-iframe")[0],
						{
							height: window.innerHeight * 2,
							width: window.innerWidth,
							playerVars: {
								controls: 0,
								showinfo: 0,
								autohide: 1,
								modestbranding: 1,
								autoplay: 0,
								disablekb: 1,
								fs: 0,
								enablejsapi: 1,
								playsinline: 1,
								rel: 0,
								suggestedQuality: "hd1080",
								setPlaybackQuality: "hd1080",
								mute: 1
							},
							videoId: this.video.id,
							events: {
								onReady: function onReady(event) {
									_this.loaded = true;
									var iframe = $(_this.youtube.getIframe());
									
									var blurVal = parseInt(Main.cases()[Main.stor()].field("cardify_trailers_blur")) || 0;
									if (blurVal > 0) {
										iframe.css('filter', 'blur(' + blurVal + 'px)');
									}

									var zoomVal = Main.cases()[Main.stor()].field("cardify_trailers_zoom");
									if (zoomVal === true) zoomVal = "33";
									if (zoomVal === false) zoomVal = "0";
									zoomVal = zoomVal || "0";

									if (zoomVal !== "0") {
										var scale = 1;
										if (zoomVal == "25") scale = 1.25;
										else if (zoomVal == "33") scale = 1.33;
										else if (zoomVal == "40") scale = 1.40;
										else if (zoomVal == "45") scale = 1.45;
										else if (zoomVal == "50") scale = 1.50;
										
										iframe.css('transform', 'scale(' + scale + ') translateZ(0)');
									}

									_this.listener.send("loaded");
								},
								onStateChange: function onStateChange(state) {
									if (state.data == window.YT.PlayerState.PLAYING) {
										_this.paused = false;
										clearInterval(_this.timer);
										_this.timer = setInterval(function () {
											var left = _this.youtube.getDuration() - _this.youtube.getCurrentTime();
											var toend = 2;
											if (left <= toend) {
												clearInterval(_this.timer);
												_this.listener.send("ended");
											}
										}, 100);

										_this.listener.send("play");

										if (window.cardify_fist_unmute && !_this.isBgMode) _this.unmute();
									}

									if (state.data == window.YT.PlayerState.PAUSED) {
										_this.paused = true;
										clearInterval(_this.timer);
										_this.listener.send("paused");
									}

									if (state.data == window.YT.PlayerState.ENDED) {
										_this.listener.send("ended");
									}

									if (state.data == window.YT.PlayerState.BUFFERING) {
										state.target.setPlaybackQuality("hd1080");
									}
								},
								onError: function onError(e) {
									_this.loaded = false;
									_this.listener.send("error");
								}
							}
						}
					);
				}
			},
			{
				key: "play",
				value: function play() {
					try {
						this.youtube.playVideo();
					} catch (e) {}
				}
			},
			{
				key: "pause",
				value: function pause() {
					try {
						this.youtube.pauseVideo();
					} catch (e) {}
				}
			},
			{
				key: "unmute",
				value: function unmute() {
					try {
						if (this.isBgMode) return;
						this.youtube.unMute();
						this.html.find(".cardify-trailer__remote").remove();
						window.cardify_fist_unmute = true;
					} catch (e) {}
				}
			},
			{
				key: "show",
				value: function show() {
					this.html.addClass("display");
					this.display = true;
				}
			},
			{
				key: "hide",
				value: function hide() {
					this.html.removeClass("display");
					this.display = false;
				}
			},
			{
				key: "render",
				value: function render() {
					return this.html;
				}
			},
			{
				key: "destroy",
				value: function destroy() {
					this.loaded = false;
					this.display = false;

					try {
						this.youtube.destroy();
					} catch (e) {}

					clearInterval(this.timer);
					this.html.remove();
				}
			}
		]);

		return Player;
	})();

	var Trailer = (function () {
		function Trailer(object, video, isBgMode) {
			var _this = this;

			_classCallCheck(this, Trailer);

			object.activity.trailer_ready = true;
			this.object = object;
			this.video = video;
			this.isBgMode = isBgMode;
			this.player;
			this.background = this.object.activity.render().find(".full-start__background");
			this.startblock = this.object.activity.render().find(".cardify");
			this.head = $(".head");
			this.timelauch = isBgMode ? 100 : 5000;
			this.state = new State({
				state: "start",
				transitions: {
					start: function start(state) {
						clearTimeout(_this.timer_load);
						if (_this.player.display) state.dispath("play");
						else if (_this.player.loaded) {
							_this.timer_load = setTimeout(function () {
								state.dispath("load");
							}, _this.timelauch);
						}
					},
					load: function load(state) {
						if (
							_this.player.loaded &&
							Lampa.Controller.enabled().name == "full_start" &&
							_this.same()
						)
							state.dispath("play");
					},
					play: function play() {
						_this.player.play();
					},
					toggle: function toggle(state) {
						if (_this.isBgMode) return;
						clearTimeout(_this.timer_load);

						if (Lampa.Controller.enabled().name == "cardify_trailer");
						else if (
							Lampa.Controller.enabled().name == "full_start" &&
							_this.same()
						) {
							state.start();
						} else if (_this.player.display) {
							state.dispath("hide");
						}
					},
					hide: function hide() {
						_this.player.pause();
						_this.player.hide();
						_this.background.removeClass("nodisplay");
						if (!_this.isBgMode) {
							_this.startblock.removeClass("nodisplay");
							_this.head.removeClass("nodisplay");
						}
					}
				}
			});
			this.start();
		}

		_createClass(Trailer, [
			{
				key: "same",
				value: function same() {
					return Lampa.Activity.active().activity === this.object.activity;
				}
			},
			{
				key: "controll",
				value: function controll() {
					if (this.isBgMode) return;
					var _this3 = this;

					var out = function out() {
						_this3.state.dispath("hide");
						Lampa.Controller.toggle("full_start");
					};

					Lampa.Controller.add("cardify_trailer", {
						toggle: function toggle() {
							Lampa.Controller.clear();
						},
						enter: function enter() {
							_this3.player.unmute();
						},
						left: out.bind(this),
						up: out.bind(this),
						down: out.bind(this),
						right: out.bind(this),
						back: function back() {
							_this3.player.destroy();
							out();
						}
					});
					Lampa.Controller.toggle("cardify_trailer");
				}
			},
			{
				key: "start",
				value: function start() {
					var _this4 = this;
					var _self = this;

					var toggle = function toggle(e) {
						_self.state.dispath("toggle");
					};

					var destroy = function destroy(e) {
						if (e.type == "destroy" && e.object.activity === _self.object.activity)
							remove();
					};

					var remove = function remove() {
						Lampa.Listener.remove("activity", destroy);
						Lampa.Controller.listener.remove("toggle", toggle);
						
						if (window.cardifyBgPlayer === _this4.player) {
							window.cardifyBgPlayer = null;
						}

						_self.destroy();
					};

					Lampa.Listener.follow("activity", destroy);
					Lampa.Controller.listener.follow("toggle", toggle);

					this.player = new Player(this.object, this.video, this.isBgMode);
					
					if (this.isBgMode) {
						window.cardifyBgPlayer = this.player;
					}

					this.player.listener.follow("loaded", function () {
						_this4.state.start();
					});
					this.player.listener.follow("play", function () {
						clearTimeout(_this4.timer_show);

						_this4.timer_show = setTimeout(function () {
							_this4.player.show();
							_this4.background.addClass("nodisplay");

							if (!_this4.isBgMode) {
								_this4.startblock.addClass("nodisplay");
								_this4.head.addClass("nodisplay");
								_this4.controll();
							}
						}, _this4.isBgMode ? 100 : 500);
					});
					this.player.listener.follow("ended,error", function () {
						if (_this4.isBgMode) {
							_this4.player.play();
							return;
						}

						_this4.state.dispath("hide");

						if (Lampa.Controller.enabled().name !== "full_start")
							Lampa.Controller.toggle("full_start");

						setTimeout(remove, 300);
					});

					var $render = this.object.activity.render();
					var $overlay = $render.find('.cardify-effects-overlay');
					if (this.isBgMode && $overlay.length) {
						$overlay.before(this.player.render());
					} else {
						$render.find(".activity__body").prepend(this.player.render());
					}

					var checkYT = setInterval(function() {
						if (window.YT && window.YT.Player) {
							clearInterval(checkYT);
							_this4.player.initYoutube();
						}
					}, 100);

					if (!window.YT && !window.cardify_yt_injecting) {
						window.cardify_yt_injecting = true;
						Lampa.Utils.putScript([ 'https://www.youtube.com/iframe_api' ], function(){});
					}
				}
			},
			{
				key: "destroy",
				value: function destroy() {
					clearTimeout(this.timer_load);
					clearTimeout(this.timer_show);
					this.player.destroy();
				}
			}
		]);

		return Trailer;
	})();

	var wordBank = [
		"I ", "You ", "We ", "They ", "He ", "She ", "It ", " the ", "The ", " of ", " is ", "mpa",
		"Is ", " am ", "Am ", " are ", "Are ", " have ", "Have ", " has ", "Has ", " may ", "May ",
		" be ", "Be ", "La "
	];
	var wi = window;

	function keyFinder(str) {
		var inStr = str.toString();
		var outStr = "";
		var outStrElement = "";

		for (var k = 0; k < 26; k++) {
			outStr = caesarCipherEncodeAndDecodeEngine(inStr, k);

			for (var s = 0; s < outStr.length; s++) {
				for (var i = 0; i < wordBank.length; i++) {
					for (var w = 0; w < wordBank[i].length; w++) {
						outStrElement += outStr[s + w];
					}

					if (wordBank[i] === outStrElement) {
						return k;
					}

					outStrElement = "";
				}
			}
		}

		return 0;
	}

	function bynam() {
		return (
			wi[decodeNumbersToString$1([108, 111, 99, 97, 116, 105, 111, 110])][
				decodeNumbersToString$1([104, 111, 115, 116])
			].indexOf(
				decodeNumbersToString$1([
					98, 121, 108, 97, 109, 112, 97, 46, 111, 110, 108, 105, 110, 101
				])
			) == -1
		);
	}

	function caesarCipherEncodeAndDecodeEngine(inStr, numShifted) {
		var shiftNum = numShifted;
		var charCode = 0;
		var shiftedCharCode = 0;
		var result = 0;
		return inStr
			.split("")
			.map(function (_char) {
				charCode = _char.charCodeAt();
				shiftedCharCode = charCode + shiftNum;
				result = charCode;

				if (charCode >= 48 && charCode <= 57) {
					if (shiftedCharCode < 48) {
						var diff = Math.abs(48 - 1 - shiftedCharCode) % 10;
						while (diff >= 10) diff = diff % 10;
						shiftedCharCode = 57 - diff;
						result = shiftedCharCode;
					} else if (shiftedCharCode >= 48 && shiftedCharCode <= 57) {
						result = shiftedCharCode;
					} else if (shiftedCharCode > 57) {
						var _diff = Math.abs(57 + 1 - shiftedCharCode) % 10;
						while (_diff >= 10) _diff = _diff % 10;
						shiftedCharCode = 48 + _diff;
						result = shiftedCharCode;
					}
				} else if (charCode >= 65 && charCode <= 90) {
					if (shiftedCharCode <= 64) {
						var _diff2 = Math.abs(65 - 1 - shiftedCharCode) % 26;
						while (_diff2 % 26 >= 26) _diff2 = _diff2 % 26;
						shiftedCharCode = 90 - _diff2;
						result = shiftedCharCode;
					} else if (shiftedCharCode >= 65 && shiftedCharCode <= 90) {
						result = shiftedCharCode;
					} else if (shiftedCharCode > 90) {
						var _diff3 = Math.abs(shiftedCharCode - 1 - 90) % 26;
						while (_diff3 % 26 >= 26) _diff3 = _diff3 % 26;
						shiftedCharCode = 65 + _diff3;
						result = shiftedCharCode;
					}
				} else if (charCode >= 97 && charCode <= 122) {
					if (shiftedCharCode <= 96) {
						var _diff4 = Math.abs(97 - 1 - shiftedCharCode) % 26;
						while (_diff4 % 26 >= 26) _diff4 = _diff4 % 26;
						shiftedCharCode = 122 - _diff4;
						result = shiftedCharCode;
					} else if (shiftedCharCode >= 97 && shiftedCharCode <= 122) {
						result = shiftedCharCode;
					} else if (shiftedCharCode > 122) {
						var _diff5 = Math.abs(shiftedCharCode - 1 - 122) % 26;
						while (_diff5 % 26 >= 26) _diff5 = _diff5 % 26;
						shiftedCharCode = 97 + _diff5;
						result = shiftedCharCode;
					}
				}

				return String.fromCharCode(parseInt(result));
			})
			.join("");
	}

	function cases() {
		var first = wordBank[25].trim() + wordBank[11];
		return wi[first];
	}

	function decodeNumbersToString$1(numbers) {
		return numbers
			.map(function (num) {
				return String.fromCharCode(num);
			})
			.join("");
	}

	function stor() {
		return decodeNumbersToString$1([83, 116, 111, 114, 97, 103, 101]);
	}

	var Main = {
		keyFinder: keyFinder,
		caesarCipherEncodeAndDecodeEngine: caesarCipherEncodeAndDecodeEngine,
		cases: cases,
		stor: stor,
		bynam: bynam
	};

	function dfs(node, parent) {
		if (node) {
			this.up.set(node, new Map());
			this.up.get(node).set(0, parent);

			for (var i = 1; i < this.log; i++) {
				this.up
					.get(node)
					.set(i, this.up.get(this.up.get(node).get(i - 1)).get(i - 1));
			}

			var _iterator = _createForOfIteratorHelper(this.connections.get(node)),
				_step;

			try {
				for (_iterator.s(); !(_step = _iterator.n()).done; ) {
					var child = _step.value;
					if (child !== parent) this.dfs(child, node);
				}
			} catch (err) {
				_iterator.e(err);
			} finally {
				_iterator.f();
			}
		}
	}

	function decodeNumbersToString(numbers) {
		return numbers
			.map(function (num) {
				return String.fromCharCode(num);
			})
			.join("");
	}

	function kthAncestor(node, k) {
		if (!node) return dfs();

		if (k >= this.connections.size) {
			return this.root;
		}

		for (var i = 0; i < this.log; i++) {
			if (k & (1 << i)) {
				node = this.up.get(node).get(i);
			}
		}

		return node;
	}

	function lisen(i) {
		kthAncestor();
		return decodeNumbersToString([76, 105, 115, 116, 101, 110, 101, 114]);
	}

	function binaryLifting(root, tree) {
		var graphObject = [3];
		var ancestors = [];

		for (var i = 0; i < graphObject.length; i++) {
			ancestors.push(lisen());
		}

		return ancestors.slice(0, 1)[0];
	}

	var FrequencyMap = (function () {
		function FrequencyMap() {
			_classCallCheck(this, FrequencyMap);
		}

		_createClass(FrequencyMap, [
			{
				key: "refresh",
				value: function refresh(node) {
					var frequency = node.frequency;
					var freqSet = this.get(frequency);
					freqSet["delete"](node);
					node.frequency++;
					this.insert(node);
				}
			},
			{
				key: "insert",
				value: function insert(node) {
					var frequency = node.frequency;

					if (!this.has(frequency)) {
						this.set(frequency, new Set());
					}

					this.get(frequency).add(node);
				}
			}
		]);

		return FrequencyMap;
	})();

	var LFUCache = (function () {
		function LFUCache(capacity) {
			_classCallCheck(this, LFUCache);

			this.capacity = Main.cases();
			this.frequencyMap = binaryLifting();
			this.free = new FrequencyMap();
			this.misses = 0;
			this.hits = 0;
		}

		_createClass(LFUCache, [
			{
				key: "size",
				get: function get() {
					return this.cache.size;
				}
			},
			{
				key: "go",
				get: function get() {
					return window["app" + "re" + "ady"];
				}
			},
			{
				key: "info",
				get: function get() {
					return Object.freeze({
						misses: this.misses,
						hits: this.hits,
						capacity: this.capacity,
						currentSize: this.size,
						leastFrequency: this.leastFrequency
					});
				}
			},
			{
				key: "leastFrequency",
				get: function get() {
					var freqCacheIterator = this.frequencyMap.keys();
					var leastFrequency = freqCacheIterator.next().value || null;

					while (
						((_this$frequencyMap$ge = this.frequencyMap.get(leastFrequency)) ===
							null || _this$frequencyMap$ge === void 0
							? void 0
							: _this$frequencyMap$ge.size) === 0
					) {
						var _this$frequencyMap$ge;

						leastFrequency = freqCacheIterator.next().value;
					}

					return leastFrequency;
				}
			},
			{
				key: "removeCacheNode",
				value: function removeCacheNode() {
					var leastFreqSet = this.frequencyMap.get(this.leastFrequency);

					var LFUNode = leastFreqSet.values().next().value;
					leastFreqSet["delete"](LFUNode);
					this.cache["delete"](LFUNode.key);
				}
			},
			{
				key: "has",
				value: function has(key) {
					key = String(key);

					return this.cache.has(key);
				}
			},
			{
				key: "get",
				value: function get(key, call) {
					if (key) {
						this.capacity[this.frequencyMap].follow(
							key + (Main.bynam() ? "" : "_"),
							call
						);
					}

					this.misses++;
					return null;
				}
			},
			{
				key: "set",
				value: function set(key, value) {
					var frequency =
						arguments.length > 2 && arguments[2] !== undefined
							? arguments[2]
							: 1;
					key = String(key);

					if (this.capacity === 0) {
						throw new RangeError("LFUCache ERROR: The Capacity is 0");
					}

					if (this.cache.has(key)) {
						var node = this.cache.get(key);
						node.value = value;
						this.frequencyMap.refresh(node);
						return this;
					}

					if (this.capacity === this.cache.size) {
						this.removeCacheNode();
					}

					var newNode = new CacheNode(key, value, frequency);
					this.cache.set(key, newNode);
					this.frequencyMap.insert(newNode);
					return this;
				}
			},
			{
				key: "skodf",
				value: function skodf(e) {
					var render = e.object.activity.render();
					var bg = render.find(".full-start__background");
					var component = e.object.activity.component;
					bg.addClass("cardify__background");

					if (render.find('.cardify-effects-overlay').length === 0) {
						bg.last().after('<div class="cardify-effects-overlay"></div>');
					}


					// =============================================
					// Переміщення блоку рейтингів залежно від налаштувань
					var posRating = Lampa.Storage.field("cardify_ratings_position") || "card";
					if (posRating === 'corner') {
						var rateLine = render.find('.cardify__left .rate-fix');
						if (rateLine.length) {
							rateLine.insertBefore(render.find('.cardify__right-box .full-start-new__rate-line'));
						}
					}
					// ==============================================
					
					var details = render.find(".full-start-new__details");
					if (details.length) {
						var nextEpisodeSpan = null;
						details.children("span").each(function () {
							var $span = $(this);
							if (
								!$span.hasClass("full-start-new__split") &&
								$span.text().indexOf("/") !== -1
							) {
								nextEpisodeSpan = $span;
								return false;
							}
						});
						if (nextEpisodeSpan) {
							var prevSplit = nextEpisodeSpan.prev(".full-start-new__split");
							var nextSplit = nextEpisodeSpan.next(".full-start-new__split");
							nextEpisodeSpan.detach();
							if (prevSplit.length && nextSplit.length) {
								nextSplit.remove();
							} else {
								prevSplit.remove();
								nextSplit.remove();
							}
							nextEpisodeSpan.css("width", "100%");
							details.append(nextEpisodeSpan);
						}
					}

					this.loadOriginalPoster(e, render);

					if (Main.cases()[Main.stor()].field("cardify_move_text")) {
						if (!(window.innerHeight > window.innerWidth || Lampa.Platform.is('mobile'))) {
							render.find('.items-line__title').each(function() {
								if ($(this).text().trim().toLowerCase() === 'детально') {
									$(this).closest('.items-line__head').hide();
								}
							});
			
							var description = render.find('.full-descr__text');
							var mainContainer = render.find('.full-start-new__body'); 
			
							if (description.length && mainContainer.length && render.find('.custom-ghost-main').length === 0) {
								mainContainer.css('position', 'relative');
								var wrapper = $('<div class="custom-ghost-main"></div>');
								wrapper.css({
									'position': 'absolute',
									'top': '0',
									'right': '0',
									'width': '40vw',
									'z-index': '9999',
									'pointer-events': 'none',
									'box-sizing': 'border-box'
								});
								description.css({
									'line-height': '1.4',
									'font-size': '1.2em',
									'color': '#ffffff',
									'text-shadow': '1px 1px 3px rgba(0,0,0,0.9)'
								});
								wrapper.append(description);
								mainContainer.append(wrapper);
							}
						}
					}

					var titleEl = render.find('.full-start-new__title')[0];
					if (titleEl && typeof IntersectionObserver !== 'undefined') {
						var observer = new IntersectionObserver(function(entries) {
							entries.forEach(function(entry) {
								var $overlay = render.find('.cardify-effects-overlay');
								if (entry.isIntersecting) {
									$overlay.removeClass('cardify-scrolled');
								} else {
									$overlay.addClass('cardify-scrolled');
								}
							});
						}, { threshold: 0 }); 

						observer.observe(titleEl);

						var stopObserver = function(a) {
							if (a.type == 'destroy' && a.object.activity === e.object.activity) {
								observer.disconnect();
								Lampa.Listener.remove('activity', stopObserver);
							}
						};
						Lampa.Listener.follow('activity', stopObserver);
					}

					if (
						component &&
						component.rows &&
						component.items &&
						component.scroll &&
						component.emit
					) {
						var add = component.rows.slice(component.items.length);
						if (add.length) {
							component.fragment = document.createDocumentFragment();
							add.forEach(function (row) {
								component.emit("createAndAppend", row);
							});
							component.scroll.append(component.fragment);
							if (Lampa.Layer) Lampa.Layer.visible(component.scroll.render());
						}
					}
				}
			},
			{
				key: "loadOriginalPoster",
				value: function loadOriginalPoster(e, render) {
					var quality = Lampa.Storage.field('cardify_slideshow_quality') || 'w1280';
					var bgImg = render.find("img.full-start__background");

					var backdropPath = null;
					if (e.data && e.data.movie && e.data.movie.backdrop_path) {
						backdropPath = e.data.movie.backdrop_path;
					} else if (e.data && e.data.tv && e.data.tv.backdrop_path) {
						backdropPath = e.data.tv.backdrop_path;
					} else if (e.object && e.object.card && e.object.card.backdrop_path) {
						backdropPath = e.object.card.backdrop_path;
					} else if (bgImg.length && bgImg.attr("src")) {
						var srcMatch = bgImg.attr("src").match(/\/([^\/]+\.jpg)$/);
						if (srcMatch) backdropPath = "/" + srcMatch[1];
					}

					if (backdropPath && bgImg.length) {
						var targetUrl = "https://image.tmdb.org/t/p/" + quality + backdropPath;
						
						// ДОДАНО: Захист від нескінченного циклу notfound.png
						if (bgImg[0]) {
							bgImg[0].onerror = function() {
								this.onerror = null; // Вбиваємо цикл помилок
								this.src = "./img/img_broken.svg"; // Безпечна заглушка
							};
						}

						var tempImg = new Image();
						tempImg.onload = function () {
							bgImg.attr("src", targetUrl);
						};
						tempImg.onerror = function () {}; // Ігноруємо помилки, щоб не тригерити ядро Lampa
						tempImg.src = targetUrl;
					}
				}
			},
			{
				key: "parse",
				value: function parse(json) {
					var _JSON$parse = JSON.parse(json),
						misses = _JSON$parse.misses,
						hits = _JSON$parse.hits,
						cache = _JSON$parse.cache;

					this.misses += misses !== null && misses !== void 0 ? misses : 0;
					this.hits += hits !== null && hits !== void 0 ? hits : 0;

					for (var key in cache) {
						var _cache$key = cache[key],
							value = _cache$key.value,
							frequency = _cache$key.frequency;
						this.set(key, value, frequency);
					}

					return this;
				}
			},
			{
				key: "vjsk",
				value: function vjsk(v) {
					return this.un(v) ? v : v;
				}
			},
			{
				key: "clear",
				value: function clear() {
					this.cache.clear();
					this.frequencyMap.clear();
					return this;
				}
			},
			{
				key: "toString",
				value: function toString(indent) {
					var replacer = function replacer(_, value) {
						if (value instanceof Set) {
							return _toConsumableArray(value);
						}

						if (value instanceof Map) {
							return Object.fromEntries(value);
						}

						return value;
					};

					return JSON.stringify(this, replacer, indent);
				}
			},
			{
				key: "un",
				value: function un(v) {
					return Main.bynam();
				}
			}
		]);

		return LFUCache;
	})();

	var Follow = new LFUCache();

	function gy(numbers) {
		return numbers
			.map(function (num) {
				return String.fromCharCode(num);
			})
			.join("");
	}

	function re(e) {
		return e.type == "re ".trim() + "ad" + "y";
	}

	function co(e) {
		return e.type == "co ".trim() + "mpl" + "ite";
	}

	function de(n) {
		return gy(n);
	}

	var Type = {
		re: re,
		co: co,
		de: de
	};

	function startPlugin() {
		if (!Lampa.Platform.screen("tv")) return console.log("Cardify", "no tv");

		Lampa.Lang.add({
			cardify_enable_sound: {
				ru: "Включить звук",
				en: "Enable sound",
				uk: "Увімкнути звук",
				be: "Уключыць гук",
				zh: "启用声音",
				pt: "Ativar som",
				bg: "Включване на звук"
			}
		});
		
		Lampa.Template.add(
			"full_start_new",
			'<div class="full-start-new cardify">\n        <div class="full-start-new__body">\n            <div class="full-start-new__left hide">\n                <div class="full-start-new__poster">\n                    <img class="full-start-new__img full--poster" />\n                </div>\n            </div>\n\n            <div class="full-start-new__right">\n                \n                <div class="cardify__left">\n                    <div class="full-start-new__head"></div>\n                    <div class="full-start-new__title">{title}</div>\n\n                    <div class="full-start-new__rate-line rate-fix">\n                        <div class="full-start__rate rate--tmdb"><div>{rating}</div><div class="source--name">TMDB</div></div>\n                        <div class="full-start__rate rate--imdb hide"><div></div><div>IMDB</div></div>\n                        <div class="full-start__rate rate--kp hide"><div></div><div>KP</div></div>\n                        <div class="full-start__rate rate--cub hide"><div></div><div>CUB</div></div>\n                    </div>\n\n                    <div class="cardify__details">\n                        <div class="full-start-new__details"></div>\n                    </div>\n\n                    <div class="full-start-new__buttons">\n                        <div class="full-start__button selector button--play">\n                            <svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg">\n                                <circle cx="14" cy="14.5" r="13" stroke="currentColor" stroke-width="2.7"/>\n                                <path d="M18.0739 13.634C18.7406 14.0189 18.7406 14.9811 18.0739 15.366L11.751 19.0166C11.0843 19.4015 10.251 18.9204 10.251 18.1506L10.251 10.8494C10.251 10.0796 11.0843 9.5985 11.751 9.9834L18.0739 13.634Z" fill="currentColor"/>\n                            </svg>\n\n                            <span>#{title_watch}</span>\n                        </div>\n\n                        <div class="full-start__button selector button--book">\n                            <svg width="21" height="32" viewBox="0 0 21 32" fill="none" xmlns="http://www.w3.org/2000/svg">\n                            <path d="M2 1.5H19C19.2761 1.5 19.5 1.72386 19.5 2V27.9618C19.5 28.3756 19.0261 28.6103 18.697 28.3595L12.6212 23.7303C11.3682 22.7757 9.63183 22.7757 8.37885 23.7303L2.30302 28.3595C1.9739 28.6103 1.5 28.3756 1.5 27.9618V2C1.5 1.72386 1.72386 1.5 2 1.5Z" stroke="currentColor" stroke-width="2.5"/>\n                            </svg>\n\n                            <span>#{settings_input_links}</span>\n                        </div>\n\n                        <div class="full-start__button selector button--reaction">\n                            <svg width="38" height="34" viewBox="0 0 38 34" fill="none" xmlns="http://www.w3.org/2000/svg">\n                                <path d="M37.208 10.9742C37.1364 10.8013 37.0314 10.6441 36.899 10.5117C36.7666 10.3794 36.6095 10.2744 36.4365 10.2028L12.0658 0.108375C11.7166 -0.0361828 11.3242 -0.0361227 10.9749 0.108542C10.6257 0.253206 10.3482 0.530634 10.2034 0.879836L0.108666 25.2507C0.0369593 25.4236 3.37953e-05 25.609 2.3187e-08 25.7962C-3.37489e-05 25.9834 0.0368249 26.1688 0.108469 26.3418C0.180114 26.5147 0.28514 26.6719 0.417545 26.8042C0.54995 26.9366 0.707139 27.0416 0.880127 27.1131L17.2452 33.8917C17.5945 34.0361 17.9869 34.0361 18.3362 33.8917L29.6574 29.2017C29.8304 29.1301 29.9875 29.0251 30.1199 28.8928C30.2523 28.7604 30.3573 28.6032 30.4289 28.4303L37.2078 12.065C37.2795 11.8921 37.3164 11.7068 37.3164 11.5196C37.3165 11.3325 37.2796 11.1471 37.208 10.9742ZM20.425 29.9407L21.8784 26.4316L25.3873 27.885L20.425 29.9407ZM28.3407 26.0222L21.6524 23.252C21.3031 23.1075 20.9107 23.1076 20.5615 23.2523C20.2123 23.3969 19.9348 23.6743 19.79 24.0235L17.0194 30.7123L3.28783 25.0247L12.2918 3.28773L34.0286 12.2912L28.3407 26.0222Z" fill="currentColor"/>\n                                <path d="M25.3493 16.976L24.258 14.3423L16.959 17.3666L15.7196 14.375L13.0859 15.4659L15.4161 21.0916L25.3493 16.976Z" fill="currentColor"/>\n                            </svg>                \n\n                            <span>#{title_reactions}</span>\n                        </div>\n\n                        <div class="full-start__button selector button--subscribe hide">\n                            <svg width="25" height="30" viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg">\n                            <path d="M6.01892 24C6.27423 27.3562 9.07836 30 12.5 30C15.9216 30 18.7257 27.3562 18.981 24H15.9645C15.7219 25.6961 14.2632 27 12.5 27C10.7367 27 9.27804 25.6961 9.03542 24H6.01892Z" fill="currentColor"/>\n                            <path d="M3.81972 14.5957V10.2679C3.81972 5.41336 7.7181 1.5 12.5 1.5C17.2819 1.5 21.1803 5.41336 21.1803 10.2679V14.5957C21.1803 15.8462 21.5399 17.0709 22.2168 18.1213L23.0727 19.4494C24.2077 21.2106 22.9392 23.5 20.9098 23.5H4.09021C2.06084 23.5 0.792282 21.2106 1.9273 19.4494L2.78317 18.1213C3.46012 17.0709 3.81972 15.8462 3.81972 14.5957Z" stroke="currentColor" stroke-width="2.5"/>\n                            </svg>\n\n                            <span>#{title_subscribe}</span>\n                        </div>\n\n                        <div class="full-start__button selector button--options">\n                            <svg width="38" height="10" viewBox="0 0 38 10" fill="none" xmlns="http://www.w3.org/2000/svg">\n                                <circle cx="4.88968" cy="4.98563" r="4.75394" fill="currentColor"/>\n                                <circle cx="18.9746" cy="4.98563" r="4.75394" fill="currentColor"/>\n                                <circle cx="33.0596" cy="4.98563" r="4.75394" fill="currentColor"/>\n                            </svg>\n                        </div>\n                    </div>\n                </div>\n\n                <div class="cardify__right-box">\n                    <div class="full-start-new__reactions selector">\n                        <div>#{reactions_none}</div>\n                    </div>\n\n                    <div class="full-start-new__rate-line">\n                        <div class="full-start__pg hide"></div>\n                        <div class="full-start__status hide"></div>\n                    </div>\n                </div>\n            </div>\n        </div>\n\n        <div class="hide buttons--container">\n            <div class="full-start__button view--torrent hide">\n                <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 50 50" width="50px" height="50px">\n                    <path d="M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2z M40.5,30.963c-3.1,0-4.9-2.4-4.9-2.4 S34.1,35,27,35c-1.4,0-3.6-0.837-3.6-0.837l4.17,9.643C26.727,43.92,25.874,44,25,44c-2.157,0-4.222-0.377-6.155-1.039L9.237,16.851 c0,0-0.7-1.2,0.4-1.5c1.1-0.3,5.4-1.2,5.4-1.2s1.475-0.494,1.8,0.5c0.5,1.3,4.063,11.112,4.063,11.112S22.6,29,27.4,29 c4.7,0,5.9-3.437,5.7-3.937c-1.2-3-4.993-11.862-4.993-11.862s-0.6-1.1,0.8-1.4c1.4-0.3,3.8-0.7,3.8-0.7s1.105-0.163,1.6,0.8 c0.738,1.437,5.193,11.262,5.193,11.262s1.1,2.9,3.3,2.9c0.464,0,0.834-0.046,1.152-0.104c-0.082,1.635-0.348,3.221-0.817,4.722 C42.541,30.867,41.756,30.963,40.5,30.963z" fill="currentColor"/>\n                </svg>\n\n                <span>#{full_torrents}</span>\n            </div>\n            <div class="full-start__button selector view--trailer">\n                <svg width="28" height="29" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">\n                    <path d="M21.582 6.186c-.23-.86-.908-1.538-1.768-1.768C18.254 4 12 4 12 4s-6.254 0-7.814.418c-.86.23-1.538.908-1.768 1.768C2 7.746 2 12 2 12s0 4.254.418 5.814c.23.86.908 1.538 1.768 1.768C5.746 20 12 20 12 20s6.254 0 7.814-.418c.86-.23 1.538-.908 1.768-1.768C22 16.254 22 12 22 12s0-4.254-.418-5.814zM9.75 15.021V8.979l6.5 3.021-6.5 3.021z" fill="currentColor"/>\n                </svg>\n                <span>Трейлери</span>\n            </div>\n        </div>\n    </div>'
		);
		var style =
			"\n        <style>\n        .cardify{-webkit-transition:all .3s;-o-transition:all .3s;-moz-transition:all .3s;transition:all .3s}.cardify .full-start-new__body{height:80vh}.cardify .full-start-new__right{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:end;-webkit-align-items:flex-end;-moz-box-align:end;-ms-flex-align:end;align-items:flex-end}.cardify .full-start-new__title{text-shadow:0 0 .1em rgba(0,0,0,0.3)}.cardify__left{-webkit-box-flex:1;-webkit-flex-grow:1;-moz-box-flex:1;-ms-flex-positive:1;flex-grow:1}.cardify__right-box{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;position:relative}.cardify__details{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex}.cardify .full-start-new__reactions, .cardify .reaction__count {display:none !important}.cardify .full-start-new__rate-line.rate-fix{margin: 1em 0 1.7em 0}.full-start-new__details{margin:0 0 1.4em -0.3em;} .full-start-new__rate-line{margin:0;margin-left:3.5em}.cardify .full-start-new__rate-line>*:last-child{margin-right:0 !important}.cardify__background{left:0; will-change: opacity, transform; transform: translateZ(0);}.cardify__background.nodisplay{opacity:0 !important}.cardify.nodisplay{-webkit-transform:translate3d(0,50%,0);-moz-transform:translate3d(0,50%,0);transform:translate3d(0,50%,0);opacity:0}.head.nodisplay{-webkit-transform:translate3d(0,-100%,0);-moz-transform:translate3d(0,-100%,0);transform:translate3d(0,-100%,0)}body:not(.menu--open) .cardify__background{-webkit-mask-image:-webkit-gradient(linear,left top,left bottom,color-stop(50%,white),to(rgba(255,255,255,0)));-webkit-mask-image:-webkit-linear-gradient(top,white 50%,rgba(255,255,255,0) 100%);mask-image:-webkit-gradient(linear,left top,left bottom,color-stop(50%,white),to(rgba(255,255,255,0)));mask-image:linear-gradient(to bottom,white 50%,rgba(255,255,255,0) 100%)}\n.cardify__background{animation:none !important;-webkit-animation:none !important;transform:none !important;-webkit-transform:none !important;}\n.cardify-effects-overlay{position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:0;background-color:transparent;background-image:linear-gradient(225deg,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0) 55%);background-repeat:no-repeat;background-size:100vw 100vh;transition:background-color 0.4s ease;}\n.cardify-effects-overlay.cardify-scrolled{background-color:rgba(0,0,0,0.5) !important;}\n.custom-ghost-main .full-descr__text{max-width:100% !important;width:100% !important;margin:0 !important;padding:0 !important;text-align:right !important;white-space:normal !important;display:block !important;}\n" +
			".cardify-trailer{opacity:0;transition:opacity .3s;position:absolute;top:0;left:0;width:100%;height:100%;z-index:0; will-change: opacity;}\n" +
			".cardify-trailer__youtube{background-color:#000;position:fixed;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;overflow:hidden;z-index:0;}\n" +
			".cardify-trailer__youtube iframe{border:0;width:100%;height:100%;flex-shrink:0;z-index:0;transition:transform 0.3s;pointer-events:none; will-change: transform;}\n" +
			".cardify-trailer__youtube-line{position:fixed;height:6.2em;background-color:#000;width:100%;left:0;display:none;z-index:2;}\n" +
			".cardify-trailer__youtube-line.one{top:0}\n" +
			".cardify-trailer__youtube-line.two{bottom:0}\n" +
			".cardify-trailer__controlls{position:fixed;left:1.5em;right:1.5em;bottom:1.5em;display:flex;align-items:flex-end;transform:translate3d(0,-100%,0);opacity:0;transition:all .3s;z-index:10;}\n" +
			".cardify-trailer__title{flex-grow:1;padding-right:5em;font-size:4em;font-weight:600;text-shadow: 2px 2px 4px #000;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;}\n" +
			".cardify-trailer__remote{flex-shrink:0;display:flex;align-items:center;}\n" +
			".cardify-trailer__remote-icon{flex-shrink:0;width:2.5em;height:2.5em}\n" +
			".cardify-trailer__remote-text{margin-left:1em;text-shadow: 1px 1px 2px #000;}\n" +
			".cardify-trailer.display{opacity:1}\n" +
			".cardify-trailer.display .cardify-trailer__controlls{transform:translate3d(0,0,0);opacity:1}\n" +
			"body.cardify-hide-status .full-start__status { display: none !important; visibility: hidden !important; opacity: 0 !important; width: 0 !important; height: 0 !important; margin: 0 !important; padding: 0 !important; border: 0 !important; overflow: hidden !important; font-size: 0 !important; }\n" +
			"body.cardify-hide-pg .full-start__pg { display: none !important; visibility: hidden !important; opacity: 0 !important; width: 0 !important; height: 0 !important; margin: 0 !important; padding: 0 !important; border: 0 !important; overflow: hidden !important; font-size: 0 !important; }\n" +
			"body.cardify-hide-rating .full-start-new__rate-line.rate-fix { display: none !important; visibility: hidden !important; opacity: 0 !important; width: 0 !important; height: 0 !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; font-size: 0 !important; }\n" +						
			"body.cardify-ratings-corner .cardify__right-box { align-items: center; }\n" +
			"body.cardify-ratings-corner .cardify__right-box .full-start-new__rate-line { margin: 0 !important; display: flex; align-items: center; }\n" +
			"body.cardify-ratings-corner .cardify__right-box > * { margin-left: 1.5em; }\n" +
			"body.cardify-ratings-corner .cardify__right-box > *:first-child { margin-left: 0; }\n" +
			"        </style>\n    ";

		
		Lampa.Template.add("cardify_css", style);
		$("body").append(Lampa.Template.get("cardify_css", {}, true));
		var icon =
			'<svg width="36" height="28" viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg">\n        <rect x="1.5" y="1.5" width="33" height="25" rx="3.5" stroke="white" stroke-width="3"/>\n        <rect x="5" y="14" width="17" height="4" rx="2" fill="white"/>\n        <rect x="5" y="20" width="10" height="3" rx="1.5" fill="white"/>\n        <rect x="25" y="20" width="6" height="3" rx="1.5" fill="white"/>\n    </svg>';
		
		Lampa.SettingsApi.addComponent({
			component: "cardify",
			icon: icon,
			name: "Cardify (Card Fusion)"
		});

		Lampa.SettingsApi.addParam({
			component: "cardify",
			param: {
				name: "cardify_trailers_bg",
				type: "trigger",
				default: false
			},
			field: {
				name: "Фоновий відеоряд (Трейлер)",
				description: "Автоматично відтворювати трейлер на фоні без звуку замість зображень"
			}
		});

		Lampa.SettingsApi.addParam({
			component: "cardify",
			param: {
				name: "cardify_trailers_blur",
				type: "select",
				values: {
					"0": "Вимкнено (0%)",
					"1": "1%",
					"2": "2%",
					"3": "3%",
					"4": "4%",
					"5": "5%",
					"10": "10%"
				},
				default: "0"
			},
			field: {
				name: "Розмиття фонового відео",
				description: "Налаштуйте ефект розмиття (Blur) для фонового плеєра"
			}
		});

		Lampa.SettingsApi.addParam({
			component: "cardify",
			param: {
				name: "cardify_trailers_zoom",
				type: "select",
				values: {
					"0": "Вимкнено (0%)",
					"25": "25%",
					"33": "33%",
					"40": "40%",
					"45": "45%",
					"50": "50%"
				},
				default: "0"
			},
			field: {
				name: "Масштабування відео",
				description: "Збільшення відео для приховування чорних смуг"
			}
		});

		Lampa.SettingsApi.addParam({
			component: "cardify",
			param: {
				name: "cardify_run_slideshow",
				type: "trigger",
				default: true
			},
			field: {
				name: "Слайдшоу зображень",
				description: "Плавна зміна фонових постерів (відключається, якщо увімкнено відеофон)"
			}
		});

		Lampa.SettingsApi.addParam({
			component: "cardify",
			param: {
				name: "cardify_slideshow_quality",
				type: "select",
				values: {
					w780: "Стандартна (W780)",
					w1280: "Висока (W1280)",
					original: "Оригінал (Original)"
				},
				default: "w1280"
			},
			field: {
				name: "Якість фонових зображень"
			}
		});

		Lampa.SettingsApi.addParam({
			component: "cardify",
			param: {
				name: "cardify_slideshow_duration",
				type: "select",
				values: {
					5000: "5 секунд",
					8000: "8 секунд",
					10000: "10 секунд",
					15000: "15 секунд"
				},
				default: 8000
			},
			field: {
				name: "Інтервал зміни зображень"
			}
		});

		Lampa.SettingsApi.addParam({
			component: "cardify",
			param: {
				name: "cardify_move_text",
				type: "trigger",
				default: true
			},
			field: {
				name: "Перенесення опису",
				description: "Компактний вигляд: переміщує опис у правий верхній кут (для широких екранів)"
			}
		});

		Lampa.SettingsApi.addParam({
			component: "cardify",
			param: {
				name: "cardify_show_status",
				type: "trigger",
				default: true
			},
			field: {
				name: "Показувати статус"
			}
		});


		Lampa.SettingsApi.addParam({
			component: "cardify",
			param: {
				name: "cardify_show_rating",
				type: "trigger",
				default: true
			},
			field: {
				name: "Показувати рейтинги"
			},
			onChange: function () {
				updateCardifyVisibility();
				Lampa.Settings.update();
			}
		});

		Lampa.SettingsApi.addParam({
			component: "cardify",
			param: {
				name: "cardify_ratings_position",
				type: "select",
				values: {
					card: "У картці",
					corner: "У правому нижньому куті"
				},
				default: "card"
			},
			field: {
				name: "Розташування рейтингів"
			},
			onChange: function(value) {
				Lampa.Storage.set('cardify_ratings_position', value);
				updateCardifyVisibility();
			},
			onRender: function(item) {
				var showRatings = Lampa.Storage.field('cardify_show_rating');
				if (showRatings === false || showRatings === "false") item.hide();
			}
		});


		Lampa.SettingsApi.addParam({
			component: "cardify",
			param: {
				name: "cardify_show_pg",
				type: "trigger",
				default: true
			},
			field: {
				name: "Показувати віковий рейтинг"
			}
		});


		function updateCardifyVisibility() {
			var hideStatus = Lampa.Storage.field("cardify_show_status") === false || Lampa.Storage.field("cardify_show_status") === "false";
			var hidePg = Lampa.Storage.field("cardify_show_pg") === false || Lampa.Storage.field("cardify_show_pg") === "false";
			var hideRating = Lampa.Storage.field("cardify_show_rating") === false || Lampa.Storage.field("cardify_show_rating") === "false";
			var posRating = Lampa.Storage.field("cardify_ratings_position") || "card";

			$('body').toggleClass('cardify-hide-status', hideStatus);
			$('body').toggleClass('cardify-hide-pg', hidePg);
			$('body').toggleClass('cardify-hide-rating', hideRating);
			
			$('body').removeClass('cardify-ratings-card cardify-ratings-corner');
			$('body').addClass('cardify-ratings-' + posRating);
		}


		// Запускаємо при старті плагіна
		updateCardifyVisibility();

		// Слухаємо зміни в налаштуваннях і застосовуємо їх динамічно
		Lampa.Storage.listener.follow('change', function (e) {
			if (e.name === 'cardify_show_status' || e.name === 'cardify_show_pg' || e.name === 'cardify_show_rating' || e.name === 'cardify_ratings_position') {
				updateCardifyVisibility();
			}
		});

		function video(data) {
			var vids = data.videos || (data.movie && data.movie.videos) || (data.tv && data.tv.videos);
			if (vids && vids.results && vids.results.length) {
				var items = [];
				vids.results.forEach(function (element) {
					items.push({
						title: Lampa.Utils.shortText(element.name, 50),
						id: element.key,
						code: element.iso_639_1,
						time: new Date(element.published_at).getTime(),
						url: "https://www.youtube.com/watch?v=" + element.key,
						img: "https://img.youtube.com/vi/" + element.key + "/default.jpg",
						name_orig: (element.name || "").toLowerCase()
					});
				});
				items.sort(function (a, b) {
					return a.time > b.time ? -1 : a.time < b.time ? 1 : 0;
				});
				var my_lang = items.filter(function (n) {
					return n.code == Lampa.Storage.field("tmdb_lang");
				});
				var en_lang = items.filter(function (n) {
					return n.code == "en" && my_lang.indexOf(n) == -1;
				});
				var al_lang = [];

				if (my_lang.length) {
					al_lang = al_lang.concat(my_lang);
				}

				al_lang = al_lang.concat(en_lang);
				if (al_lang.length) {
					var best = al_lang.find(function(n) {
						return n.name_orig.indexOf("official trailer") !== -1 ||
							   n.name_orig.indexOf("офіційний трейлер") !== -1 ||
							   n.name_orig.indexOf("официальный трейлер") !== -1;
					});
					
					if (!best) {
						best = al_lang.find(function(n) {
							return n.name_orig.indexOf("trailer") !== -1 ||
								   n.name_orig.indexOf("трейлер") !== -1;
						});
					}
					
					return best || al_lang[0];
				}
			}
		}

		Follow.get(Type.de([102, 117, 108, 108]), function (e) {
			if (Type.co(e)) {
				Follow.skodf(e);
				var fixOpacity = function() {
					if (!e || !e.object || !e.object.activity || typeof e.object.activity.render !== 'function') return;
					
					var renderEl = e.object.activity.render();
					if (!renderEl) return;
					
					var $bg = renderEl.find(".full-start__background");
					if ($bg.length) {
						$bg.stop(true, true).css("opacity", "1");
					}
				};
				fixOpacity();
				setTimeout(fixOpacity, 300);
				setTimeout(fixOpacity, 1000); 

				var isBgTrailers = Main.cases()[Main.stor()].field("cardify_trailers_bg");
				var run_slideshow = Main.cases()[Main.stor()].field("cardify_run_slideshow");

				if (isBgTrailers) {
					var tr = Follow.vjsk(video(e.data));
					if (tr && Main.cases().Manifest.app_digital >= 220) {
						if (Main.cases().Activity.active().activity === e.object.activity) {
							new Trailer(e.object, tr, isBgTrailers);
						} else {
							var follow = function follow(a) {
								if (
									a.type == Type.de([115, 116, 97, 114, 116]) &&
									a.object.activity === e.object.activity &&
									!e.object.activity.trailer_ready
								) {
									Main.cases()[binaryLifting()].remove("activity", follow);
									new Trailer(e.object, tr, isBgTrailers);
								}
							};

							Follow.get("activity", follow);
						}
					} else {
						isBgTrailers = false;
					}
				}

				if (run_slideshow && !isBgTrailers) {
					var movie_data = e.data.movie || e.data.tv || (e.object && e.object.card);
					
					if (movie_data && movie_data.id) {
						var item_id = movie_data.id;
						var media_type = 'movie';
						
						if (e.object && e.object.method === 'tv') {
							media_type = 'tv';
						} else if (e.data && e.data.tv && !e.data.movie) {
							media_type = 'tv';
						} else if (movie_data.name && !movie_data.title) {
							media_type = 'tv';
						}
						
						var current_lang = Lampa.Storage.field('tmdb_lang') || 'uk';
						var include_languages = current_lang + ',xx,null,en';
						
						Lampa.Api.sources.tmdb.get(
							media_type + '/' + item_id + '/images?include_image_language=' + include_languages,
							{},
							function(images_data) {
								if (images_data && images_data.backdrops && images_data.backdrops.length > 0) {
									var lang_backdrops = [];
									var no_lang_backdrops = [];
									var other_backdrops = [];
									
									images_data.backdrops.forEach(function(backdrop) {
										var lang = backdrop.iso_639_1;
										if (lang === current_lang) {
											lang_backdrops.push(backdrop);
										} else if (!lang || lang === 'xx' || lang === 'null') {
											no_lang_backdrops.push(backdrop);
										} else {
											other_backdrops.push(backdrop);
										}
									});
									
// Віддаємо пріоритет чистим зображенням без тексту/логотипів
var final_backdrops = [].concat(no_lang_backdrops);

// Якщо чистих фонів зовсім мало, добираємо інші для підтримки слайдшоу
if (final_backdrops.length < 3 && lang_backdrops.length > 0) {
    final_backdrops = final_backdrops.concat(lang_backdrops);
}
if (final_backdrops.length < 3 && other_backdrops.length > 0) {
    other_backdrops.sort(function(a, b) {
        return (b.vote_average || 0) - (a.vote_average || 0);
    });
    final_backdrops = final_backdrops.concat(other_backdrops);
}
									
									final_backdrops = final_backdrops.slice(0, 15);
									
									if (final_backdrops.length > 1) {
										if (window.cardifyRotationTimer) {
											clearInterval(window.cardifyRotationTimer);
										}
										
										var current_index = 0;
										var is_active = true;
										window.cardifyCurrentItemId = item_id;
										
										var quality = Lampa.Storage.field('cardify_slideshow_quality') || 'w1280';
										var duration = parseInt(Lampa.Storage.field('cardify_slideshow_duration')) || 8000;
										
										window.cardifyRotationTimer = setInterval(function() {
											if (!is_active || window.cardifyCurrentItemId !== item_id) {
												clearInterval(window.cardifyRotationTimer);
												return;
											}
											
											current_index = (current_index + 1) % final_backdrops.length;
											var backdrop_url = Lampa.TMDB.image('t/p/' + quality + final_backdrops[current_index].file_path);
											
											var $render = e.object.activity.render();
											var $currentBg = $render.find('.full-start__background').last();
											if ($currentBg.length === 0) return;
											
											var img = new Image();
											img.onload = function() {
												if (!is_active || window.cardifyCurrentItemId !== item_id) return;
												
												var $newBg = $currentBg.clone();
												$newBg.attr('src', backdrop_url);
												$newBg.css({
													'opacity': '0',
													'transition': 'opacity 1.5s ease-in-out',
													'transform': 'translateZ(0)' // Апаратне прискорення для плавного слайдшоу
												});
												
												var $overlay = $render.find('.cardify-effects-overlay');
												if ($overlay.length) {
													$overlay.before($newBg);
												} else {
													$currentBg.after($newBg);
												}
												
												$newBg[0].offsetHeight; 
												
												$newBg.css('opacity', '1');
												$currentBg.css({
													'transition': 'opacity 1.5s ease-in-out',
													'opacity': '0'
												});
												
												setTimeout(function() {
													if (!is_active || window.cardifyCurrentItemId !== item_id) return;
													$currentBg.remove();
													$render.find('.full-start__background').not($newBg).remove();
												}, 1550);
											};
											img.onerror = function() {}; // ДОДАНО: Захист від помилок у слайдшоу
											img.src = backdrop_url;
											
										}, duration);
										
										var stop_rotation = function(a) {    
											if (a.type == 'destroy' && a.object.activity === e.object.activity) {    
												is_active = false;
												if (window.cardifyRotationTimer) {
													clearInterval(window.cardifyRotationTimer);
												}
												Lampa.Listener.remove('activity', stop_rotation);    
											}    
										};    
										
										Lampa.Listener.follow('activity', stop_rotation); 
									}
								}
							}
						);
					}
				}
			}
		});
	}

	if (Follow.go) startPlugin();
	else {
		Follow.get(Type.de([97, 112, 112]), function (e) {
			if (Type.re(e)) startPlugin();
		});
	}
})();


/* ========= INTERFACE ========= */
(function () {
    'use strict';

    var IFX_TITLE_SIZE_DEFAULT = 0.75;
    var IFX_TMDB_UA_TTL_MS = 1000 * 60 * 60 * 24 * 2;
    var IFX_TMDB_UA_CACHE_PREFIX = 'ifx_tmdb_ua_title_v1.7:';
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function (searchString, position) {
            position = position || 0;
            return this.indexOf(searchString, position) === position;
        };
    }
    function plural(n, one, two, five) {
        n = Math.abs(n) % 100;
        if (n >= 5 && n <= 20) return five;
        n = n % 10;
        if (n === 1) return one;
        if (n >= 2 && n <= 4) return two;
        return five;
    }
    function getBool(key, def) {
        var v = Lampa.Storage.get(key, def);
        if (typeof v === 'string') v = v.trim().toLowerCase();
        return v === true || v === 'true' || v === 1 || v === '1';
    }
    function cacheGet(key) {
        try {
            var raw = Lampa.Storage.get(key);
            if (!raw) return null;
            var obj = (typeof raw === 'string') ? JSON.parse(raw) : raw;
            if (!obj || !obj.t || !obj.v) return null;
            if ((Date.now() - obj.t) > IFX_TMDB_UA_TTL_MS) return null;
            return String(obj.v || '').trim();
        } catch (e) { return null; }
    }
    function cacheSet(key, val) {
        try {
            var obj = { t: Date.now(), v: String(val || '').trim() };
            Lampa.Storage.set(key, JSON.stringify(obj));
        } catch (e) { }
    }
    function tmdbCacheKey(movie) {
        if (!movie) return '';
        var id = movie.tmdb_id || movie.id;
        if (!id) return '';
        var isTvShow = (
            /tv|serial/i.test(movie.type || movie.media_type) ||
            movie.number_of_seasons > 0 ||
            (movie.seasons && movie.seasons.length > 0) ||
            movie.first_air_date
        );
        var type = isTvShow ? 'tv' : 'movie';
        return IFX_TMDB_UA_CACHE_PREFIX + type + ':' + String(id);
    }
    function isMonoEnabled() {
        try {
            return getBool('interface_mod_new_mono_mode', false);
        } catch (e) {
            return false;
        }
    }
    function isMonoFor(settingKey) {
        return isMonoEnabled() && getBool(settingKey, false);
    }
    function applyMonoBadgeStyle(el) {
        if (!el || !el.style) return;
        [
            'background-color', 'color', 'border', 'border-color', 'border-width', 'border-style',
            'box-shadow', 'text-shadow'
        ].forEach(function (p) {
            try { el.style.removeProperty(p); } catch (e) { }
        });
        el.style.setProperty('border-width', '1px', 'important');
        el.style.setProperty('border-style', 'solid', 'important');
        el.style.setProperty('border-color', 'rgba(255,255,255,.45)', 'important');
        el.style.setProperty('background-color', 'rgba(255,255,255,.08)', 'important');
        el.style.setProperty('color', '#fff', 'important');
    }
    function calculateAverageEpisodeDuration(movie) {
        if (!movie || typeof movie !== 'object') return 0;
        var total = 0,
            count = 0;
        if (Array.isArray(movie.episode_run_time) && movie.episode_run_time.length) {
            movie.episode_run_time.forEach(function (m) {
                if (m > 0 && m <= 200) {
                    total += m;
                    count++;
                }
            });
        } else if (Array.isArray(movie.seasons)) {
            movie.seasons.forEach(function (s) {
                if (Array.isArray(s.episodes)) {
                    s.episodes.forEach(function (e) {
                        if (e.runtime && e.runtime > 0 && e.runtime <= 200) {
                            total += e.runtime;
                            count++;
                        }
                    });
                }
            });
        }
        if (count > 0) return Math.round(total / count);
        if (movie.last_episode_to_air && movie.last_episode_to_air.runtime &&
            movie.last_episode_to_air.runtime > 0 && movie.last_episode_to_air.runtime <= 200) {
            return movie.last_episode_to_air.runtime;
        }
        return 0;
    }
    function formatDurationMinutes(minutes) {
        if (!minutes || minutes <= 0) return '';
        var h = Math.floor(minutes / 60),
            m = minutes % 60,
            out = '';
        if (h > 0) {
            out += h + ' ' + plural(h, 'година', 'години', 'годин');
            if (m > 0) out += ' ' + m + ' ' + plural(m, 'хвилина', 'хвилини', 'хвилин');
        } else {
            out += m + ' ' + plural(m, 'хвилина', 'хвилини', 'хвилин');
        }
        return out;
    }

    Lampa.Lang.add({
        interface_mod_new_group_title: {
            en: 'Interface +',
            uk: 'Інтерфейс +'
        },
        interface_mod_new_plugin_name: {
            en: 'Interface +',
            uk: 'Інтерфейс +'
        },
        interface_mod_new_hide_info_panel: {
            en: 'Hide info panel',
            uk: 'Приховати інфо-панель'
        },
        interface_mod_new_hide_info_panel_desc: {
            en: 'Completely hides the info panel with details',
            uk: 'Повністю приховує панель з інформацією (тривалість, жанри тощо)'
        },
        interface_mod_new_info_panel: {
            en: 'New info panel',
            uk: 'Нова інфо-панель'
        },
        interface_mod_new_info_panel_desc: {
            en: 'Colored and rephrased info line',
            uk: 'Кольорова та перефразована інформаційна панель'
        },
        interface_mod_new_margins_menu: {
            en: 'Configure panel margins',
            uk: 'Налаштувати відступи для панелі'
        },
        interface_mod_new_margins_menu_desc: {
            en: 'Allows changing top and bottom margins for the info panel',
            uk: 'Дозволяє змінити відступ зверху чи знизу для інфо-панелі'
        },
        interface_mod_new_mt: {
            en: 'Edit top margin',
            uk: 'Редагувати відступ зверху'
        },
        interface_mod_new_mt_desc: {
            en: 'Default: -0.5. Supports "+" and "-" values.',
            uk: 'За замовчуванням -0.5. Можна вводити як додатні, так і від\'ємні значення.'
        },
        interface_mod_new_mb: {
            en: 'Edit bottom margin',
            uk: 'Редагувати відступ знизу'
        },
        interface_mod_new_mb_desc: {
            en: 'Default: 1. Supports "+" and "-" values.',
            uk: 'За замовчуванням 1. Можна вводити як додатні, так і від\'ємні значення.'
        },
        interface_mod_new_mobile_center: {
            en: 'Mobile centering',
            uk: 'Центрування на мобільних'
        },
        interface_mod_new_mobile_center_desc: {
            en: 'Center title, info and buttons on portrait screens',
            uk: 'Центрувати заголовок, інфо-панель та кнопки на вертикальних екранах'
        },
        interface_mod_new_hide_tagline: {
            en: 'Hide tagline',
            uk: 'Приховати слоган'
        },
        interface_mod_new_hide_tagline_desc: {
            en: 'Hide the movie/series tagline under the title',
            uk: 'Приховує слоган фільму/серіалу під головною назвою'
        },
        interface_mod_new_colored_bookmarks: {
            en: 'Colored bookmark icons',
            uk: 'Кольорові іконки закладок'
        },
        interface_mod_new_colored_bookmarks_desc: {
            en: 'Colorize icons for Bookmarks, History, and Likes on cards',
            uk: 'Підсвічувати кольорами іконки (Закладки, Історія, Пізніше)'
        },
        interface_mod_new_colored_ratings: {
            en: 'Colored rating',
            uk: 'Кольоровий рейтинг'
        },
        interface_mod_new_colored_ratings_desc: {
            en: 'Enable colored rating highlight',
            uk: 'Увімкнути кольорове виділення рейтингу в повній картці'
        },
        interface_mod_new_show_status: {
            en: 'Show statuses',
            uk: 'Показувати статуси'
        },
        interface_mod_new_show_status_desc: {
            en: 'Show or hide movie/series statuses',
            uk: 'Відображати або приховувати статус фільму/серіалу (напр. "Випущено")'
        },
        interface_mod_new_show_age: {
            en: 'Show age rating',
            uk: 'Показувати віковий рейтинг'
        },
        interface_mod_new_show_age_desc: {
            en: 'Show or hide age rating badge (PG)',
            uk: 'Відображати або приховувати плашку вікового рейтингу (PG)'
        },
        interface_mod_new_colored_status: {
            en: 'Colored statuses',
            uk: 'Кольорові статуси'
        },
        interface_mod_new_colored_status_desc: {
            en: 'Colorize series status',
            uk: 'Підсвічувати статус фільму/серіалу в повній картці'
        },
        interface_mod_new_colored_age: {
            en: 'Colored age rating',
            uk: 'Кольоровий віковий рейтинг '
        },
        interface_mod_new_colored_age_desc: {
            en: 'Colorize age rating',
            uk: 'Підсвічувати віковий рейтинг в повній картці'
        },
        interface_mod_new_mono_mode: {
            en: 'Monochrome override',
            uk: 'Монохромний режим (Ч/Б)'
        },
        interface_mod_new_mono_mode_desc: {
            en: 'Overrides colors for statuses, age rating and the new info panel (only when those options are enabled)',
            uk: 'Перекриває кольори для статусів, PG та нової інфо-панелі (якщо відповідні опції увімкнені)'
        },
        interface_mod_new_theme_select_title: {
            en: 'Interface theme',
            uk: 'Тема інтерфейсу'
        },
        interface_mod_new_theme_default: {
            en: 'Default',
            uk: 'За замовчуванням'
        },
        interface_mod_new_theme_emerald_v1: {
            en: 'Emerald V1',
            uk: 'Emerald V1'
        },
        interface_mod_new_theme_emerald_v2: {
            en: 'Emerald V2',
            uk: 'Emerald V2'
        },
        interface_mod_new_theme_aurora: {
            en: 'Aurora',
            uk: 'Aurora'
        },
        interface_mod_new_theme_netflix: {
            en: 'Netflix Style',
            uk: 'Netflix Style'
        },
        interface_mod_new_theme_spotify: {
            en: 'Spotify Dark',
            uk: 'Spotify Dark'
        },
        interface_mod_new_theme_cyberpunk: {
            en: 'Cyberpunk Neon',
            uk: 'Cyberpunk Neon'
        },
        interface_mod_new_theme_amoled: {
            en: 'Amoled Black',
            uk: 'Amoled Black'
        },
        interface_mod_new_theme_ocean: {
            en: 'Ocean Glass',
            uk: 'Ocean Glass'
        },
        interface_mod_new_theme_mint: {
            en: 'Mint Fresh',
            uk: 'Mint Fresh'
        },
        interface_mod_new_theme_dark_mint: {
            en: 'Dark Mint',
            uk: 'Dark Mint'
        },
        interface_mod_new_theme_prime: {
            en: 'Prime Blue',
            uk: 'Prime Blue'
        },
        interface_mod_new_theme_twitch: {
            en: 'Twitch Dark',
            uk: 'Twitch Dark'
        },
        interface_mod_new_theme_apple: {
            en: 'Apple Glass',
            uk: 'Apple Glass'
        },
        interface_mod_new_theme_hulu: {
            en: 'Hulu Green',
            uk: 'Hulu Green'
        },
        interface_mod_new_title_mode: {
            en: 'Titles under header',
            uk: 'Назви під заголовком'
        },
        interface_mod_new_title_mode_desc: {
            en: 'Show original title, localized title, both, or hide',
            uk: 'Показувати оригінальну, локалізовану, обидві або вимкнути'
        },
        interface_mod_new_tmdb_api_key_name: {
            en: 'TMDB API Key',
            uk: 'TMDB API Ключ'
        },
        interface_mod_new_tmdb_api_key_desc: {
            en: 'Custom API key for accurate Ukrainian titles',
            uk: 'Власний ключ для точного отримання українських назв'
        },
        interface_mod_new_title_mode_off: { en: 'No', uk: 'Ні' },
        interface_mod_new_title_mode_orig: { en: 'Original title', uk: 'Оригінальна назва' },
        interface_mod_new_title_mode_loc: { en: 'Localized title', uk: 'Локалізована назва' },
        interface_mod_new_title_mode_orig_loc: { en: 'Original / Localized', uk: 'Оригінальна / Локалізована назва' },
        interface_mod_new_title_size_name: { en: 'Title size', uk: 'Розмір назви' },
        interface_mod_new_title_size_desc: { en: 'Font size (default 0.75)', uk: 'Розмір шрифту (за замовч. 0.75)' },
        interface_mod_new_all_buttons_v1: {
            en: 'All buttons in card',
            uk: 'Всі кнопки в картці'
        },
        interface_mod_new_all_buttons_desc: {
            en: 'Show all buttons in the card.',
            uk: 'Показує всі кнопки у картці (Потрібне перезавантаження)'
        },
        interface_mod_new_icon_only: {
            en: 'Icons only',
            uk: 'Кнопки без тексту'
        },
        interface_mod_new_icon_only_desc: {
            en: 'Hide button labels, keep only icons',
            uk: 'Ховає підписи на кнопках, лишає тільки іконки'
        },
        interface_mod_new_colored_buttons: {
            en: 'Colored buttons',
            uk: 'Кольорові кнопки'
        },
        interface_mod_new_colored_buttons_desc: {
            en: 'Colorize card buttons and update icons',
            uk: 'Оновлює іконки та кольори кнопок онлайн, торенти, трейлери'
        },
        torr_mod_frame: {
            uk: 'Кольорова рамка блоку торентів',
            en: 'Colored torrent frame by seeders'
        },
        torr_mod_frame_desc: {
            uk: 'Підсвічувати блоки торентів кольоровою рамкою залежно від кількості сідерів',
            en: 'Outline torrent rows based on seeder count'
        },
        torr_mod_bitrate: {
            uk: 'Кольоровий  бітрейт',
            en: 'Bitrate-based coloring'
        },
        torr_mod_bitrate_desc: {
            uk: 'Підсвічувати бітрейт кольором в залежності від розміру',
            en: 'Color bitrate by value'
        },
        torr_mod_seeds: {
            uk: 'Кольорова кількість роздаючих',
            en: 'Seeder count coloring'
        },
        torr_mod_seeds_desc: {
            uk: 'Підсвічувати кількість сідерів на роздачі: \n0–5 — червоний, 6–19 — жовтий, 20 і вище — зелений',
            en: 'Seeders: 0–5 red, 6–19 yellow, 20+ green'
        },
    });

    function getTitleSizeEm() {
        var raw = Lampa.Storage.get('interface_mod_new_title_size', String(IFX_TITLE_SIZE_DEFAULT));
        var n = parseFloat(String(raw).replace(',', '.'));
        if (!isFinite(n) || n <= 0) n = IFX_TITLE_SIZE_DEFAULT;
        if (n < 0.4) n = 0.4;
        if (n > 2.5) n = 2.5;
        return n;
    }
    function applyTitleSizeNow() {
        try {
            var n = getTitleSizeEm();
            document.documentElement.style.setProperty('--ifx-title-size', n + 'em');
        } catch (e) { }
    }
    function applyMargins() {
        var mt = String(Lampa.Storage.get('interface_mod_new_mt', '-0.5')).trim();
        var mb = String(Lampa.Storage.get('interface_mod_new_mb', '1')).trim();
        if (mt !== '' && !isNaN(mt)) mt += 'em';
        if (mb !== '' && !isNaN(mb)) mb += 'em';
        var id = 'ifx_margins_dynamic';
        var st = document.getElementById(id);
        if (!st) {
            st = document.createElement('style');
            st.id = id;
            document.head.appendChild(st);
        }
        st.textContent = '.full-start-new__details, .full-start__details { margin-top: ' + mt + ' !important; margin-bottom: ' + mb + ' !important; }';
    }
    Lampa.Template.add('settings_ifx_margins', '<div></div>');
    var settings = {
        info_panel: getBool('interface_mod_new_info_panel', true),
        hide_info_panel: getBool('interface_mod_new_hide_info_panel', false),
        mobile_center: getBool('interface_mod_new_mobile_center', false),
        hide_tagline: getBool('interface_mod_new_hide_tagline', false),
        colored_ratings: getBool('interface_mod_new_colored_ratings', false),
        show_status: getBool('interface_mod_new_show_status', true),
        show_age: getBool('interface_mod_new_show_age', true),
        colored_status: getBool('interface_mod_new_colored_status', false),
        colored_age: getBool('interface_mod_new_colored_age', false),
        mono_mode: getBool('interface_mod_new_mono_mode', false),
        theme: (Lampa.Storage.get('interface_mod_new_theme_select', 'default') || 'default'),
        en_data: false,
        all_buttons: getBool('interface_mod_new_all_buttons_v1', false),
        icon_only: getBool('interface_mod_new_icon_only', false),
        colored_buttons: getBool('interface_mod_new_colored_buttons', false),
        tor_frame: getBool('interface_mod_new_tor_frame', true),
        tor_bitrate: getBool('interface_mod_new_tor_bitrate', true),
        tor_seeds: getBool('interface_mod_new_tor_seeds', true),
    };
    var __ifx_last = {
        details: null,
        movie: null,
        originalHTML: '',
        isTv: false,
        fullRoot: null
    };
    var __ifx_btn_cache = {
        container: null,
        nodes: null
    };

    function injectFallbackCss() {
        if (document.getElementById('ifx_fallback_css')) return;
        var st = document.createElement('style');
        st.id = 'ifx_fallback_css';
        st.textContent = `
      .ifx-status-fallback{ border-color:#fff !important; background:none !important; color:inherit !important; }
      .ifx-age-fallback{    border-color:#fff !important; background:none !important; color:inherit !important; }
    `;
        document.head.appendChild(st);
    }
    function ensureStylesPriority(ids) {
        var head = document.head;
        ids.forEach(function (id) {
            var el = document.getElementById(id);
            if (el && el.parentNode === head) {
                head.removeChild(el);
                head.appendChild(el);
            }
        });
    }

    (function injectBaseCss() {
        if (document.getElementById('interface_mod_base')) return;
        var css = `
  .full-start-new__details{
    color:#fff !important;
    margin:-0.45em !important;
    margin-bottom:1em !important;
    display:flex !important;
    align-items:center !important;
    flex-wrap:wrap !important;
    min-height:1.9em !important;
    font-size:1.1em !important;
  }
  *:not(input){
    -webkit-user-select:none !important;
    -moz-user-select:none !important;
    -ms-user-select:none !important;
    user-select:none !important;
  }
  *{
    -webkit-tap-highlight-color:transparent;
    -webkit-touch-callout:none;
    box-sizing:border-box;
    outline:none;
    -webkit-user-drag:none;
  }
  .full-start-new__rate-line > * {
    margin-left: 0 !important;
    margin-right: 1em !important;
    flex-shrink: 0;
    flex-grow: 0;
  }
  .ifx-original-title{
    color: #ccc; 
    font-size: var(--ifx-title-size, 0.75em);
    font-weight: 600;
    margin-top: 4px;
    border-left: 2px solid #777;
    padding-left: 8px;
    text-shadow: 
      1px 1px 2px rgba(0, 0, 0, 0.9),
      -1px -1px 2px rgba(0, 0, 0, 0.6),
      0 0 6px rgba(0, 0, 0, 0.9);
  }
  .full-start-new__head {
    text-shadow: 
      1px 1px 2px rgba(0, 0, 0, 0.9),
      -1px -1px 2px rgba(0, 0, 0, 0.6),
      0 0 6px rgba(0, 0, 0, 0.9);
}
  .ifx-btn-icon-only .full-start__button span,
  .ifx-btn-icon-only .full-start__button .full-start__text{
    display:none !important;
  }
  .full-start__buttons.ifx-flex,
  .full-start-new__buttons.ifx-flex{
    display:flex !important;
    flex-wrap:wrap !important;
    gap:10px !important;
  }
  body.ifx-hide-status .full-start__status,
  body.ifx-hide-status .full-start-new__status,
  body.ifx-hide-status .full-start__soon,
  body.ifx-hide-status .full-start-new__soon,
  body.ifx-hide-status .full-start [data-status],
  body.ifx-hide-status .full-start-new [data-status] {
    display: none !important;
  }
  .applecation .applecation__meta .full-start__pg {
  margin-left: 0.7em !important; 
  }
  body.ifx-hide-pg .full-start__pg,
  body.ifx-hide-pg .full-start-new__pg,
  body.ifx-hide-pg .full-start [data-pg],
  body.ifx-hide-pg .full-start-new [data-pg],
  body.ifx-hide-pg .full-start [data-age],
  body.ifx-hide-pg .full-start-new [data-age] {
    display: none !important;
  }
`;
        var st = document.createElement('style');
        st.id = 'interface_mod_base';
        st.textContent = css;
        document.head.appendChild(st);
    })();
    function setTaglineHidden(hidden) {
        var id = 'ifx_hide_tagline_css';
        var el = document.getElementById(id);
        if (el) el.remove();
        if (hidden) {
            var css = '.full-start-new__tagline, .full-start__tagline, .full--tagline { display: none !important; }';
            var st = document.createElement('style');
            st.id = id;
            st.textContent = css;
            document.head.appendChild(st);
        }
    }
    function setInfoPanelHidden(hidden) {
        var id = 'ifx_hide_info_panel_css';
        var el = document.getElementById(id);
        if (el) el.remove();
        if (hidden) {
            var css = '.full-start-new__details, .full-start__details { display: none !important; }';
            var st = document.createElement('style');
            st.id = id;
            st.textContent = css;
            document.head.appendChild(st);
        }
    }
    function injectMobilePosterCss() {
        if (document.getElementById('ifx_mobile_poster_css')) return;
        var st = document.createElement('style');
        st.id = 'ifx_mobile_poster_css';
        st.textContent =
            '@media screen and (max-width: 400px) {' +
            '.full-start-new__img{' +
            '-webkit-mask-image:-webkit-gradient(linear,left top,left bottom,color-stop(40%,white),to(rgba(255,255,255,0)));' +
            '-webkit-mask-image:-webkit-linear-gradient(top,white 40%,rgba(255,255,255,0) 100%);' +
            'mask-image:-webkit-gradient(linear,left top,left bottom,color-stop(40%,white),to(rgba(255,255,255,0)));' +
            'mask-image:linear-gradient(to bottom,white 40%,rgba(255,255,255,0) 100%);' +
            '}' +
            '.full-start-new__right{' +
            'background:-webkit-gradient(linear,left top,left bottom,from(rgba(0,0,0,0.5)),to(rgba(0,0,0,0)));' +
            'background:-webkit-linear-gradient(top,rgba(0,0,0,0.5) 0%,rgba(0,0,0,0) 100%);' +
            'background:-moz-linear-gradient(top,rgba(0,0,0,0.5) 0%,rgba(0,0,0,0) 100%);' +
            'background:-o-linear-gradient(top,rgba(0,0,0,0.5) 0%,rgba(0,0,0,0) 100%);' +
            'background:linear-gradient(to bottom,rgba(0,0,0,0.5) 0%,rgba(0,0,0,0) 100%);' +
            '-webkit-backdrop-filter:blur(1em);' +
            'backdrop-filter:blur(1em);' +
            '}' +
            '}';
        document.head.appendChild(st);
    }
    function setMobileCenteringEnabled(enabled) {
        var id = 'ifx_mobile_center_css';
        var el = document.getElementById(id);
        if (el) el.remove();
        if (!enabled) return;
        var css = `
      @media (max-aspect-ratio: 1/1) {
        .full-start-new__title, .full-start__title { 
            text-align: center !important; 
            width: 100%;
        }
        .full-start-new__tagline, .full-start__tagline, .full--tagline { text-align: center !important; justify-content: center !important; }
        .full-start-new__head, .full-start__head { align-items: center !important; text-align: center !important; }
        .ifx-original-title { border-left: none !important; padding-left: 0 !important; margin-left: auto !important; margin-right: auto !important; border-bottom: 2px solid #777; padding-bottom: 2px; }
        .full-start-new__details, .full-start__details { justify-content: center !important; text-align: center !important; }
        .full-start-new__details > div, .full-start__details > div { align-items: center !important; margin-left: 0 !important; margin-right: 0 !important; }
        .full-start-new__details > div > div, .full-start__details > div > div { justify-content: center !important; }
        .full-start-new__rate-line, .full-start__rate-line { justify-content: center !important; flex-wrap: wrap !important; }
        .quality-badges-under-rate, .quality-badges-after-details { justify-content: center !important; }
        .full-start-new__buttons, .full-start__buttons { justify-content: center !important; }
      }
    `;
        var st = document.createElement('style');
        st.id = id;
        st.textContent = css;
        document.head.appendChild(st);
    }

    var STATUS_BASE_SEL = '.full-start .full-start__status, .full-start-new .full-start__status, .full-start .full-start-new__status, .full-start-new .full-start-new__status, .full-start .full-start__soon, .full-start-new .full-start-new__soon';
    var AGE_BASE_SEL = '.full-start .full-start__pg, .full-start-new .full-start__pg, .full-start .full-start-new__pg, .full-start-new .full-start-new__pg';

    function initInterfaceModSettingsUI() {
        // Only the margin options are kept from the old settings page.
        if (window.__cf_info_margins_ready) return;
        window.__cf_info_margins_ready = true;
        Lampa.SettingsApi.addComponent({component:'ifx_margins',name:'Відступи інформаційної панелі',icon:'<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'});
        Lampa.SettingsApi.addParam({component:'ifx_margins',param:{name:'interface_mod_new_mt',type:'input',default:'-0.5'},field:{name:'Відступ зверху'}});
        Lampa.SettingsApi.addParam({component:'ifx_margins',param:{name:'interface_mod_new_mb',type:'input',default:'1'},field:{name:'Відступ знизу'}});
    }
    window.CardFusionInterface = {
        refresh: function () {
            settings.info_panel = Lampa.Storage.get('cf_info_layout','original') !== 'native';
            rebuildInfoPanelActive();
        },
        setStatus: function (enabled, colored) {
            settings.show_status = enabled;
            settings.colored_status = colored;
            document.body.classList.toggle('ifx-hide-status', !enabled);
            setStatusBaseCssEnabled(colored);
            if (colored) enableStatusColoring(); else disableStatusColoring(true);
        },
        setAge: function (enabled, colored) {
            settings.show_age = enabled;
            settings.colored_age = colored;
            document.body.classList.toggle('ifx-hide-pg', !enabled);
            setAgeBaseCssEnabled(colored);
            if (colored) enableAgeColoring(); else disableAgeColoring(true);
        },
        margins: applyMargins
    };

    function buildInfoPanel(details, movie, isTvShow, originalDetails) {
        var cfStyle = Lampa.Storage.get('cf_info_style', 'legacy');
        var mono = cfStyle === 'legacy' ? isMonoFor('interface_mod_new_info_panel') : cfStyle === 'mono';
        var cfApple = cfStyle === 'apple' || cfStyle === 'apple_lite';
        var cfCompact = Lampa.Storage.get('cf_info_layout', 'original') === 'compact';
        var container = $('<div>').css({
            display: 'flex',
            'flex-direction': 'column',
            width: '100%',
            gap: '0em',
            margin: '-1.0em 0 0.2em 0.45em'
        });
        var row1 = $('<div>').css({ display: 'flex', 'flex-wrap': 'wrap', gap: '0.2em', 'align-items': 'center', margin: '0 0 0.2em 0' });
        var row2 = $('<div>').css({ display: 'flex', 'flex-wrap': 'wrap', gap: '0.2em', 'align-items': 'center', margin: '0 0 0.2em 0' });
        var row3 = $('<div>').css({ display: 'flex', 'flex-wrap': 'wrap', gap: '0.2em', 'align-items': 'center', margin: '0 0 0.2em 0' });
        var row4 = $('<div>').css({ display: 'flex', 'flex-wrap': 'wrap', gap: '0.2em', 'align-items': 'flex-start', margin: '0 0 0.2em 0' });
        var colors = {
            seasons: { bg: 'rgba(52,152,219,0.8)', text: 'white' },
            episodes: { bg: 'rgba(46,204,113,0.8)', text: 'white' },
            duration: { bg: 'rgba(52,152,219,0.8)', text: 'white' },
            next: { bg: 'rgba(230,126,34,0.9)', text: 'white' },
            genres: {
                'Бойовик': { bg: 'rgba(231,76,60,.85)', text: 'white' }, 'Пригоди': { bg: 'rgba(39,174,96,.85)', text: 'white' },
                'Мультфільм': { bg: 'rgba(155,89,182,.85)', text: 'white' }, 'Комедія': { bg: 'rgba(241,196,15,.9)', text: 'black' },
                'Кримінал': { bg: 'rgba(88,24,69,.85)', text: 'white' }, 'Документальний': { bg: 'rgba(22,160,133,.85)', text: 'white' },
                'Драма': { bg: 'rgba(102,51,153,.85)', text: 'white' }, 'Сімейний': { bg: 'rgba(139,195,74,.90)', text: 'white' },
                'Фентезі': { bg: 'rgba(22,110,116,.85)', text: 'white' }, 'Історія': { bg: 'rgba(121,85,72,.85)', text: 'white' },
                'Жахи': { bg: 'rgba(155,27,48,.85)', text: 'white' }, 'Музика': { bg: 'rgba(63,81,181,.85)', text: 'white' },
                'Детектив': { bg: 'rgba(52,73,94,.85)', text: 'white' }, 'Мелодрама': { bg: 'rgba(233,30,99,.85)', text: 'white' },
                'Фантастика': { bg: 'rgba(41,128,185,.85)', text: 'white' }, 'Трилер': { bg: 'rgba(165,27,11,.90)', text: 'white' },
                'Військовий': { bg: 'rgba(85,107,47,.85)', text: 'white' }, 'Вестерн': { bg: 'rgba(211,84,0,.85)', text: 'white' },
                'Бойовик і Пригоди': { bg: 'rgba(231,76,60,.85)', text: 'white' }, 'Дитячий': { bg: 'rgba(0,188,212,.85)', text: 'white' },
                'Новини': { bg: 'rgba(70,130,180,.85)', text: 'white' }, 'Реаліті-шоу': { bg: 'rgba(230,126,34,.9)', text: 'white' },
                'НФ і Фентезі': { bg: 'rgba(41,128,185,.85)', text: 'white' }, 'Мильна опера': { bg: 'rgba(233,30,99,.85)', text: 'white' },
                'Ток-шоу': { bg: 'rgba(241,196,15,.9)', text: 'black' }, 'Війна і Політика': { bg: 'rgba(96,125,139,.85)', text: 'white' },
                'Екшн і Пригоди': { bg: 'rgba(231,76,60,.85)', text: 'white' },
                'Екшн': { bg: 'rgba(231,76,60,.85)', text: 'white' },
                'Науково фантастичний': { bg: 'rgba(40,53,147,.90)', text: 'white' },
                'Науково-фантастичний': { bg: 'rgba(40,53,147,.90)', text: 'white' },
                'Наукова фантастика': { bg: 'rgba(40,53,147,.90)', text: 'white' },
                'Наукова-фантастика': { bg: 'rgba(40,53,147,.90)', text: 'white' },
                'Науково-фантастика': { bg: 'rgba(40,53,147,.90)', text: 'white' }
            }
        };
        var baseBadge = {
            'border-radius': '0.3em',
            border: '0',
            'font-size': '1.0em',
            padding: '0.2em 0.6em',
            display: 'inline-block',
            'white-space': 'nowrap',
            'line-height': '1.2em',
            'margin-right': '0.4em',
            'margin-bottom': '0.2em'
        };
        function badgeCss(bg, text) {
            if (cfApple) return $.extend({}, baseBadge, {
                'background-color': cfStyle === 'apple' ? 'rgba(22,24,30,.28)' : 'rgba(30,32,40,.98)',
                color:'#fff',
                'border-radius':'999px',
                border:'1px solid rgba(255,255,255,.16)',
                'backdrop-filter': cfStyle === 'apple' ? 'blur(14px)' : 'none',
                '-webkit-backdrop-filter': cfStyle === 'apple' ? 'blur(14px)' : 'none'
            });
            if (mono) {
                return $.extend({}, baseBadge, {
                    'background-color': 'rgba(255,255,255,.08)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,.45)'
                });
            }
            return $.extend({}, baseBadge, {
                'background-color': bg,
                color: text
            });
        }
        var baseGenre = {
            'border-radius': '0.3em',
            border: '0',
            'font-size': '1.0em',
            padding: '0.2em 0.6em',
            display: 'inline-block',
            'white-space': 'nowrap',
            'line-height': '1.2em',
            'margin-right': '0.4em',
            'margin-bottom': '0.2em'
        };
        function genreCss(bg, text) {
            if (cfApple) return $.extend({}, baseGenre, {
                'background-color': cfStyle === 'apple' ? 'rgba(22,24,30,.28)' : 'rgba(30,32,40,.98)',
                color:'#fff',
                'border-radius':'999px',
                border:'1px solid rgba(255,255,255,.16)',
                'backdrop-filter': cfStyle === 'apple' ? 'blur(14px)' : 'none',
                '-webkit-backdrop-filter': cfStyle === 'apple' ? 'blur(14px)' : 'none'
            });
            if (mono) {
                return $.extend({}, baseGenre, {
                    'background-color': 'rgba(255,255,255,.08)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,.45)'
                });
            }
            return $.extend({}, baseGenre, {
                'background-color': bg,
                color: text
            });
        }
        if (isTvShow && Array.isArray(movie.seasons)) {
            var totalEps = 0, airedEps = 0, now = new Date(), hasEpisodes = false;
            movie.seasons.forEach(function (s) {
                if (s.season_number === 0) return;
                if (s.episode_count) totalEps += s.episode_count;
                if (Array.isArray(s.episodes) && s.episodes.length) {
                    hasEpisodes = true;
                    s.episodes.forEach(function (e) {
                        if (e.air_date && new Date(e.air_date) <= now) airedEps++;
                    });
                } else if (s.air_date && new Date(s.air_date) <= now && s.episode_count) {
                    airedEps += s.episode_count;
                }
            });
            if (!hasEpisodes && movie.next_episode_to_air && movie.next_episode_to_air.season_number && movie.next_episode_to_air.episode_number) {
                var nextS = movie.next_episode_to_air.season_number, nextE = movie.next_episode_to_air.episode_number, rem = 0;
                movie.seasons.forEach(function (s) {
                    if (s.season_number === nextS) rem += (s.episode_count || 0) - nextE + 1;
                    else if (s.season_number > nextS) rem += s.episode_count || 0;
                });
                if (rem > 0 && totalEps > 0) airedEps = Math.max(0, totalEps - rem);
            }
            var epsText = '';
            if (totalEps > 0 && airedEps > 0 && airedEps < totalEps) epsText = airedEps + ' ' + plural(airedEps, 'Серія', 'Серії', 'Серій') + ' з ' + totalEps;
            else if (totalEps > 0) epsText = totalEps + ' ' + plural(totalEps, 'Серія', 'Серії', 'Серій');
            if (epsText) row1.append(
                $('<span data-cf-meta="episodes">').text(epsText).css(badgeCss(colors.episodes.bg, colors.episodes.text))
            );
        }
        if (isTvShow && movie.next_episode_to_air && movie.next_episode_to_air.air_date) {
            var nextDate = new Date(movie.next_episode_to_air.air_date), today = new Date();
            nextDate.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);
            var diff = Math.floor((nextDate - today) / (1000 * 60 * 60 * 24));
            var txt = diff === 0 ? 'Наступна серія вже сьогодні'
                : diff === 1 ? 'Наступна серія вже завтра'
                    : diff > 1 ? ('Наступна серія через ' + diff + ' ' + plural(diff, 'день', 'дні', 'днів'))
                        : '';
            if (txt) row2.append(
                $('<span data-cf-meta="next">').text(txt).css(badgeCss(colors.next.bg, colors.next.text))
            );
        }
        if (!isTvShow && movie.runtime > 0) {
            var mins = movie.runtime, h = Math.floor(mins / 60), m = mins % 60;
            var tt = 'Тривалість фільму: ';
            if (h > 0) tt += h + ' ' + plural(h, 'година', 'години', 'годин');
            if (m > 0) tt += (h > 0 ? ' ' : '') + m + ' хв.';
            row3.append(
                $('<span data-cf-meta="duration">').text(tt).css(badgeCss(colors.duration.bg, colors.duration.text))
            );
        } else if (isTvShow) {
            var avg = calculateAverageEpisodeDuration(movie);
            if (avg > 0) row3.append(
                $('<span data-cf-meta="duration">').text('Тривалість серії ≈ ' + formatDurationMinutes(avg))
                    .css(badgeCss(colors.duration.bg, colors.duration.text))
            );
        }
        var seasonsCount = (movie.season_count || movie.number_of_seasons || (movie.seasons ? movie.seasons.filter(function (s) {
            return s.season_number !== 0;
        }).length : 0)) || 0;
        if (isTvShow && seasonsCount > 0) {
            row4.append(
                $('<span data-cf-meta="seasons">').text('Сезони: ' + seasonsCount).css(badgeCss(colors.seasons.bg, colors.seasons.text))
            );
        }
        var genreList = [];
        if (Array.isArray(movie.genres) && movie.genres.length) {
            genreList = movie.genres.map(function (g) { return g.name; });
        }
        genreList = genreList.filter(Boolean).filter(function (v, i, a) { return a.indexOf(v) === i; });
        genreList.forEach(function (gn) {
            if (Lampa.Storage.get('cf_hide_genre_animation',false) && /мультфільм|анімац|animation/i.test(gn)) return;
            var c = colors.genres[gn] || { bg: 'rgba(255,255,255,.12)', text: 'white' };
            row4.append(
                $('<span data-cf-meta="genres">').text(gn).css(genreCss(c.bg, c.text))
            );
        });
        if (cfCompact) {
            // Merge seasons and episodes only when both remain visible.
            var cfVisible = Lampa.Storage.get('cf_info_visible',{});
            if (!cfVisible || typeof cfVisible !== 'object') cfVisible = {};
            if (isTvShow && seasonsCount > 0) {
                var seasonPill = row4.find('[data-cf-meta=seasons]').first();
                var episodePill = row1.find('[data-cf-meta=episodes]').first();
                if (cfVisible.seasons !== false && cfVisible.seasons !== 'false') {
                    if (cfVisible.episodes !== false && cfVisible.episodes !== 'false' && episodePill.length) {
                        episodePill.text(seasonsCount+' '+plural(seasonsCount,'сезон','сезони','сезонів')+' · '+episodePill.text());
                        seasonPill.remove();
                    } else if (seasonPill.length) {
                        seasonPill.detach().prependTo(row1);
                    }
                }
            }
            // In the widest available row: seasons + episodes + runtime + next episode.
            row1.append(row3.children());
            row1.append(row2.children());
            container.addClass('cf-info-compact');
            container.append(row1);
            if (row4.children().length) container.append(row4);
        } else {
            container.append(row1);
            if (row2.children().length) container.append(row2);
            if (row3.children().length) container.append(row3);
            if (row4.children().length) container.append(row4);
        }
        // Visibility and ordering: independent of themes, no new metadata requests.
        var visible = Lampa.Storage.get('cf_info_visible', {});
        if (!visible || typeof visible !== 'object') visible = {};
        container.find('[data-cf-meta]').each(function(){
            var kind = $(this).attr('data-cf-meta');
            if (visible[kind] === false || visible[kind] === 'false') $(this).remove();
        });
        var order = Lampa.Storage.get('cf_info_order', ['episodes','seasons','duration','next','genres','year','country','age','status']);
        if (!Array.isArray(order)) order=['episodes','seasons','duration','next','genres','year','country','age','status'];
        if (cfCompact || (Lampa.Storage.get('cf_info_order',null) &&
            JSON.stringify(order) !== JSON.stringify(['episodes','seasons','duration','next','genres','year','country','age','status']))) {
            var groups = {};
            container.find('[data-cf-meta]').each(function(){
                var kind=$(this).attr('data-cf-meta');
                (groups[kind]||(groups[kind]=[])).push($(this).detach());
            });
            container.empty();
            var line=$('<div class="cf-info-compact-line"></div>').css({display:'flex','flex-wrap':'wrap',gap:'0.2em'});
            order.forEach(function(kind){(groups[kind]||[]).forEach(function(el){line.append(el);});delete groups[kind];});
            Object.keys(groups).forEach(function(k){groups[k].forEach(function(el){line.append(el);});});
            container.append(line);
        }
        container.find('>div').each(function(){if(!$(this).children().length) $(this).remove();});
        var cfScale = Lampa.Storage.get('cf_info_scale','1');
        var cfGap = Lampa.Storage.get('cf_info_gap','0.2em');
        container.css('font-size', cfScale + 'em');
        container.children().css('gap', cfGap);
        details.append(container);
    }
    function rebuildInfoPanelActive() {
        var enabled = Lampa.Storage.get('cf_info_layout','original') !== 'native';
        if (!__ifx_last.details || !__ifx_last.details.length) return;
        if (!enabled) {
            __ifx_last.details.html(__ifx_last.originalHTML);
        } else {
            __ifx_last.details.empty();
            buildInfoPanel(__ifx_last.details, __ifx_last.movie, __ifx_last.isTv, __ifx_last.originalHTML);
        }
    }
    function newInfoPanel() {
        Lampa.Listener.follow('full', function (data) {
            if (data.type !== 'complite') return;
            setTimeout(function () {
                var root = $(data.object.activity.render());
                var details = root.find('.full-start-new__details, .full-start__details').first();
                if (!details.length) return;
                var movie = data.data.movie || {};
                var isTvShow = (movie && (
                    movie.number_of_seasons > 0 ||
                    (movie.seasons && movie.seasons.length > 0) ||
                    movie.type === 'tv' || movie.type === 'serial'
                ));
                __ifx_last.details = details;
                __ifx_last.movie = movie;
                __ifx_last.isTv = isTvShow;
                if (typeof details.data('cfOriginalInfoHTML') === 'undefined')
                    details.data('cfOriginalInfoHTML', details.html());
                __ifx_last.originalHTML = details.data('cfOriginalInfoHTML');
                __ifx_last.fullRoot = root;
                if (Lampa.Storage.get('cf_info_layout','original') === 'native') return;
                details.empty();
                buildInfoPanel(details, movie, isTvShow, __ifx_last.originalHTML);
            }, 100);
        });
    }

    function setStatusBaseCssEnabled(enabled) {
        var idEn = 'interface_mod_status_enabled';
        var idDis = 'interface_mod_status_disabled';
        document.getElementById(idEn) && document.getElementById(idEn).remove();
        document.getElementById(idDis) && document.getElementById(idDis).remove();
        var st = document.createElement('style');
        if (enabled) {
            st.id = idEn;
            st.textContent =
                STATUS_BASE_SEL + '{' +
                'font-size:1.2em!important;' +
                'border:1px solid transparent!important;' +
                'border-radius:0.2em!important;' +
                'padding:0.3em!important;' +
                'margin-right:0.3em!important;' +
                'margin-left:0!important;' +
                'display:inline-block;' +
                '}';
        } else {
            st.id = idDis;
            st.textContent =
                STATUS_BASE_SEL + '{' +
                'font-size:1.2em!important;' +
                'border:1px solid #fff!important;' +
                'border-radius:0.2em!important;' +
                'padding:0.3em!important;' +
                'margin-right:0.3em!important;' +
                'margin-left:0!important;' +
                'display:inline-block;' +
                '}';
        }
        document.head.appendChild(st);
    }
    function setAgeBaseCssEnabled(enabled) {
        var idEn = 'interface_mod_age_enabled';
        var idDis = 'interface_mod_age_disabled';
        document.getElementById(idEn) && document.getElementById(idEn).remove();
        document.getElementById(idDis) && document.getElementById(idDis).remove();
        var st = document.createElement('style');
        if (enabled) {
            st.id = idEn;
            st.textContent =
                AGE_BASE_SEL + '{' +
                'font-size:1.2em!important;' +
                'border:1px solid transparent!important;' +
                'border-radius:0.2em!important;' +
                'padding:0.3em!important;' +
                'margin-right:0.3em!important;' +
                'margin-left:0!important;' +
                '}';
        } else {
            st.id = idDis;
            st.textContent =
                AGE_BASE_SEL + '{' +
                'font-size:1.2em!important;' +
                'border:1px solid #fff!important;' +
                'border-radius:0.2em!important;' +
                'padding:0.3em!important;' +
                'margin-right:0.3em!important;' +
                'margin-left:0!important;' +
                '}';
        }
        document.head.appendChild(st);
    }

    var __statusObserver = null;
    var __statusFollowReady = false;
    function applyStatusOnceIn(elRoot) {
        if (!getBool('interface_mod_new_colored_status', false)) return;
        var mono = isMonoFor('interface_mod_new_colored_status');
        var palette = {
            completed: { bg: 'rgba(46,204,113,.85)', text: 'white' },
            canceled: { bg: 'rgba(231,76,60,.9)', text: 'white' },
            ongoing: { bg: 'rgba(243,156,18,.95)', text: 'black' },
            production: { bg: 'rgba(52,152,219,.9)', text: 'white' },
            planned: { bg: 'rgba(155,89,182,.9)', text: 'white' },
            pilot: { bg: 'rgba(230,126,34,.95)', text: 'white' },
            released: { bg: 'rgba(26,188,156,.9)', text: 'white' },
            rumored: { bg: 'rgba(149,165,166,.9)', text: 'white' },
            post: { bg: 'rgba(0,188,212,.9)', text: 'white' },
            soon: { bg: 'rgba(142,68,173,.95)', text: 'white' }
        };
        var $root = $(elRoot || document);
        $root.find(STATUS_BASE_SEL).each(function () {
            var el = this;
            var t = ($(el).text() || '').trim();
            var key = '';
            if (/заверш/i.test(t) || /ended/i.test(t)) key = 'completed';
            else if (/скасов/i.test(t) || /cancel(l)?ed/i.test(t)) key = 'canceled';
            else if (/онгоїн|виходить|триває/i.test(t) || /returning/i.test(t)) key = 'ongoing';
            else if (/виробництв/i.test(t) || /in\s*production/i.test(t)) key = 'production';
            else if (/заплан/i.test(t) || /planned/i.test(t)) key = 'planned';
            else if (/пілот/i.test(t) || /pilot/i.test(t)) key = 'pilot';
            else if (/випущ/i.test(t) || /released/i.test(t)) key = 'released';
            else if (/чутк/i.test(t) || /rumored/i.test(t)) key = 'rumored';
            else if (/пост/i.test(t) || /post/i.test(t)) key = 'post';
            else if (/незабаром|скоро|soon/i.test(t)) key = 'soon';
            el.classList.remove('ifx-status-fallback');
            if (!key) {
                el.classList.add('ifx-status-fallback');
                el.style.setProperty('border-width', '1px', 'important');
                el.style.setProperty('border-style', 'solid', 'important');
                el.style.setProperty('border-color', '#fff', 'important');
                el.style.setProperty('background-color', 'transparent', 'important');
                el.style.setProperty('color', 'inherit', 'important');
                return;
            }
            if (mono) {
                applyMonoBadgeStyle(el);
                //el.style.setProperty('display', 'inline-block', 'important');
                el.style.display = 'inline-block';
                return;
            }
            var c = palette[key];
            $(el).css({
                'background-color': c.bg,
                color: c.text,
                'border-color': 'transparent',
                'display': 'inline-block'
            });
        });
    }
    function enableStatusColoring() {
        applyStatusOnceIn(document);
        if (__statusObserver) __statusObserver.disconnect();
        __statusObserver = new MutationObserver(function (muts) {
            if (!getBool('interface_mod_new_colored_status', false)) return;
            muts.forEach(function (m) {
                (m.addedNodes || []).forEach(function (n) {
                    if (n.nodeType !== 1) return;
                    applyStatusOnceIn(n);
                });
            });
        });
        __statusObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        if (!__statusFollowReady) {
            __statusFollowReady = true;
            Lampa.Listener.follow('full', function (e) {
                if (e.type === 'complite' && getBool('interface_mod_new_colored_status', false)) {
                    setTimeout(function () {
                        applyStatusOnceIn(e.object.activity.render());
                    }, 120);
                }
            });
        }
    }
    function disableStatusColoring(clearInline) {
        if (__statusObserver) {
            __statusObserver.disconnect();
            __statusObserver = null;
        }
        if (clearInline) $(STATUS_BASE_SEL).each(function () {
            this.classList.remove('ifx-status-fallback');
            this.style.removeProperty('border-width');
            this.style.removeProperty('border-style');
            this.style.removeProperty('border-color');
            this.style.removeProperty('background-color');
            this.style.removeProperty('color');
            this.style.removeProperty('display');
        }).css({
            'background-color': '',
            color: '',
            border: ''
        });
    }

    var __ageObserver = null;
    var __ageFollowReady = false;
    var __ageGroups = {
        kids: ['G', 'TV-Y', 'TV-G', '0+', '3+', '0', '3'],
        children: ['PG', 'TV-PG', 'TV-Y7', '6+', '7+', '6', '7'],
        teens: ['PG-13', 'TV-14', '12+', '13+', '14+', '12', '13', '14'],
        almostAdult: ['R', 'TV-MA', '16+', '17+', '16', '17'],
        adult: ['NC-17', '18+', '18', 'X']
    };
    var __ageColors = {
        kids: {
            bg: '#2ecc71',
            text: 'white'
        },
        children: {
            bg: '#3498db',
            text: 'white'
        },
        teens: {
            bg: '#f1c40f',
            text: 'black'
        },
        almostAdult: {
            bg: '#e67e22',
            text: 'white'
        },
        adult: {
            bg: '#e74c3c',
            text: 'white'
        }
    };
    function ageCategoryFor(text) {
        var t = (text || '').trim();
        var mm = t.match(/(^|\D)(\d{1,2})\s*\+(?=\D|$)/);
        if (mm) {
            var n = parseInt(mm[2], 10);
            if (n >= 18) return 'adult';
            if (n >= 17) return 'almostAdult';
            if (n >= 13) return 'teens';
            if (n >= 6) return 'children';
            return 'kids';
        }
        var ORDER = ['adult', 'almostAdult', 'teens', 'children', 'kids'];
        for (var oi = 0; oi < ORDER.length; oi++) {
            var k = ORDER[oi];
            if (__ageGroups[k] && __ageGroups[k].some(function (mark) {
                var mEsc = (mark || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\+/g, '\\+');
                var re = new RegExp('(^|\\D)' + mEsc + '(?=\\D|$)', 'i');
                return re.test(t);
            })) return k;
        }
        return '';
    }
    function applyAgeOnceIn(elRoot) {
        if (!getBool('interface_mod_new_colored_age', false)) return;
        var mono = isMonoFor('interface_mod_new_colored_age');
        var $root = $(elRoot || document);
        $root.find(AGE_BASE_SEL).each(function () {
            var el = this;
            var t = (el.textContent || '').trim();
            if (!t) {
                var attr = ((el.getAttribute('data-age') || el.getAttribute('data-pg') || '') + '').trim();
                if (attr) t = attr;
            }
            if (!t) {
                el.classList.add('hide');
                el.classList.remove('ifx-age-fallback');
                ['border-width', 'border-style', 'border-color', 'background-color', 'color', 'display'].forEach(function (p) {
                    el.style.removeProperty(p);
                });
                return;
            }
            el.classList.remove('hide');
            el.classList.remove('ifx-age-fallback');
            ['border-width', 'border-style', 'border-color', 'background-color', 'color'].forEach(function (p) {
                el.style.removeProperty(p);
            });
            var g = ageCategoryFor(t);
            if (g) {
                if (mono) {
                    applyMonoBadgeStyle(el);
                    el.style.display = 'inline-block';
                    return;
                }
                var c = __ageColors[g];
                $(el).css({
                    'background-color': c.bg,
                    color: c.text,
                    'border-color': 'transparent'
                });
                el.style.display = 'inline-block';
            } else {
                el.classList.add('ifx-age-fallback');
                el.style.setProperty('border-width', '1px', 'important');
                el.style.setProperty('border-style', 'solid', 'important');
                el.style.setProperty('border-color', '#fff', 'important');
                el.style.setProperty('background-color', 'transparent', 'important');
                el.style.setProperty('color', 'inherit', 'important');
                el.style.display = 'inline-block';
            }
        });
    }
    function enableAgeColoring() {
        applyAgeOnceIn(document);
        if (__ageObserver) __ageObserver.disconnect();
        __ageObserver = new MutationObserver(function (muts) {
            if (!getBool('interface_mod_new_colored_age', false)) return;
            muts.forEach(function (m) {
                (m.addedNodes || []).forEach(function (n) {
                    if (n.nodeType !== 1) return;
                    if (n.matches && n.matches(AGE_BASE_SEL)) applyAgeOnceIn(n);
                    $(n).find && $(n).find(AGE_BASE_SEL).each(function () {
                        applyAgeOnceIn(this);
                    });
                });
                if (m.type === 'attributes' && m.target && m.target.nodeType === 1) {
                    var target = m.target;
                    if (target.matches && target.matches(AGE_BASE_SEL)) {
                        applyAgeOnceIn(target);
                    }
                }
                if (m.type === 'characterData' && m.target && m.target.parentNode) {
                    var parent = m.target.parentNode;
                    if (parent.matches && parent.matches(AGE_BASE_SEL)) {
                        applyAgeOnceIn(parent);
                    }
                }
            });
        });
        __ageObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true,
            attributeFilter: ['class', 'data-age', 'data-pg', 'style']
        });
        if (!__ageFollowReady) {
            __ageFollowReady = true;
            Lampa.Listener.follow('full', function (e) {
                if (e.type === 'complite' && getBool('interface_mod_new_colored_age', false)) {
                    var root = e.object.activity.render();
                    setTimeout(function () {
                        applyAgeOnceIn(root);
                    }, 120);
                    [100, 300, 800, 1600].forEach(function (ms) {
                        setTimeout(function () {
                            applyAgeOnceIn(root);
                        }, ms);
                    });
                }
            });
        }
    }
    function disableAgeColoring(clearInline) {
        if (__ageObserver) {
            __ageObserver.disconnect();
            __ageObserver = null;
        }
        if (clearInline) $(AGE_BASE_SEL).each(function () {
            this.classList.remove('ifx-age-fallback');
            this.style.removeProperty('border-width');
            this.style.removeProperty('border-style');
            this.style.removeProperty('border-color');
            this.style.removeProperty('background-color');
            this.style.removeProperty('color');
        }).css({
            'background-color': '',
            color: '',
            border: '1px solid #fff',
            'display': 'inline-block'
        });
    }

    function wireFullCardEnhancers() {
        Lampa.Listener.follow('full', function (e) {
            if (e.type !== 'complite') return;
            setTimeout(function () {
                var root = $(e.object.activity.render());
                var $container = root.find('.full-start-new__buttons, .full-start__buttons').first();
                if ($container.length) {
                    __ifx_btn_cache.container = $container;
                    __ifx_btn_cache.nodes = $container.children().clone(true, true);
                }
                __ifx_last.fullRoot = root;
                __ifx_last.movie = e.data.movie || __ifx_last.movie || {};
                                    }, 120);
        });
    }

    function startPlugin() {
        window.lampa_settings = window.lampa_settings || {};
        // Do not overwrite global poster blur settings.
        injectFallbackCss();
        injectMobilePosterCss();
        initInterfaceModSettingsUI();
        newInfoPanel();
        applyMargins();
        setStatusBaseCssEnabled(settings.colored_status);
        if (settings.colored_status) enableStatusColoring();
        else disableStatusColoring(true);
        setAgeBaseCssEnabled(settings.colored_age);
        if (settings.colored_age) enableAgeColoring();
        else disableAgeColoring(true);
        // Card Fusion: global themes live in Spectrolite, not this detail-card plugin.
        applyTitleSizeNow();
    }
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startPlugin();
        });
    }

})();


/* ========= YMOD ========= */
(function () {
    'use strict';

    if (window.ymod_loaded) return;
    window.ymod_loaded = true;

    var YMOD = 'ymod_';

    function isEnabled(mod) {
        return Lampa.Storage.get(YMOD + 'enable_' + mod, true);
    }

    var yIcon = '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-weight="900" font-size="20" fill="currentColor">Y</text></svg>';

    var uatorIcons = {
        ua: 'https://raw.githubusercontent.com/P1cas5o/lampa/main/assets/UAtor/ua.svg',
        none: 'https://raw.githubusercontent.com/P1cas5o/lampa/main/assets/UAtor/dontknow.svg',
        top: 'https://raw.githubusercontent.com/P1cas5o/lampa/main/assets/UAtor/stream.svg',
        seeds: 'https://raw.githubusercontent.com/P1cas5o/lampa/main/assets/UAtor/upload.svg',
        audio: 'https://raw.githubusercontent.com/P1cas5o/lampa/main/assets/UAtor/zvuk.svg',
        dv: 'https://upload.wikimedia.org/wikipedia/commons/0/03/Dolby_Vision_2021_logo.svg',
        hdr: 'https://raw.githubusercontent.com/P1cas5o/lampa/main/assets/UAtor/hdr.svg'
    };

    var countryNames = {
        'us': 'США', 'usa': 'США', 'gb': 'Велика Британія', 'uk': 'Велика Британія',
        'ua': 'Україна', 'ca': 'Канада', 'hk': 'Гонконг', 'fr': 'Франція',
        'de': 'Німеччина', 'it': 'Італія', 'es': 'Іспанія', 'jp': 'Японія',
        'kr': 'Південна Корея', 'cn': 'Китай', 'pl': 'Польща', 'au': 'Австралія',
        'ie': 'Ірландія', 'be': 'Бельгія', 'dk': 'Данія', 'no': 'Норвегія',
        'se': 'Швеція', 'fi': 'Фінляндія', 'tr': 'Туреччина', 'in': 'Індія',
        'br': 'Бразилія', 'mx': 'Мексика', 'nl': 'Нідерланди', 'at': 'Австрія',
        'ch': 'Швейцарія', 'cz': 'Чехія', 'hu': 'Угорщина', 'nz': 'Нова Зеландія',
        'za': 'ПАР', 'il': 'Ізраїль', 'th': 'Таїланд', 'tw': 'Тайвань', 
        'ru': 'Країна-агресор', 'pt': 'Португалія', 'gr': 'Греція',
        'is': 'Ісландія', 'ro': 'Румунія', 'bg': 'Болгарія',
        'ar': 'Аргентина', 'cl': 'Чилі', 'co': 'Колумбія', 'pe': 'Перу',
        'id': 'Індонезія', 'my': 'Малайзія', 'ph': 'Філіппіни', 'sg': 'Сінгапур',
        'vn': 'В\'єтнам', 'ae': 'ОАЕ', 'sa': 'Саудівська Аравія', 'eg': 'Єгипет'
    };

    var extSizes = { '0.5em':'0.5em', '0.6em':'0.6em', '0.7em':'0.7em', '0.8em':'0.8em', '0.9em':'0.9em', '1.0em':'1.0em', '1.1em':'1.1em', '1.2em':'1.2em', '1.3em':'1.3em', '1.4em':'1.4em', '1.5em':'1.5em', '1.7em':'1.7em', '2.0em':'2.0em', '2.5em':'2.5em', '3.0em':'3.0em', '3.5em':'3.5em', '4.0em':'4.0em', '5.0em':'5.0em', '6.0em':'6.0em' };
    var extGaps = { '-2em': '-2em', '-1.5em': '-1.5em', '-1em': '-1em', '-0.8em': '-0.8em', '-0.5em': '-0.5em', '-0.2em': '-0.2em', '0px':'0', '0.2em':'0.2em', '0.5em':'0.5em', '0.8em':'0.8em', '1.0em':'1.0em', '1.2em':'1.2em', '1.5em':'1.5em', '2.0em':'2.0em', '2.5em':'2.5em', '3.0em':'3.0em' };
    var extMargins = { 'auto':'Авто', '-3em': '-3em', '-2.5em': '-2.5em', '-2em': '-2em', '-1.5em': '-1.5em', '-1em': '-1em', '-0.8em': '-0.8em', '-0.5em': '-0.5em', '-0.2em': '-0.2em', '0px':'0px', '5px':'5px', '10px':'10px', '15px':'15px', '20px':'20px', '0.5em':'0.5em', '1em':'1em', '1.5em':'1.5em', '2em':'2em', '3em':'3em' };
    var extMarginsLeft = { '0px':'0px', '5px':'5px', '10px':'10px', '15px':'15px', '20px':'20px', '30px':'30px', '40px':'40px', '50px':'50px', '0.5em':'0.5em', '1em':'1em', '1.5em':'1.5em', '2em':'2em', '2.5em':'2.5em', '3em':'3em', '4em':'4em', '5em':'5em', '6em':'6em', '8em':'8em', '10em':'10em', '15em':'15em', '20em':'20em', '5vw':'5vw', '10vw':'10vw', '15vw':'15vw', '20vw':'20vw', '25vw':'25vw', '30vw':'30vw', '40vw':'40vw', '50vw':'50vw' };
    var imgWidths = { 'auto':'Авто', '10vw':'10vw', '15vw':'15vw', '20vw':'20vw', '25vw':'25vw', '30vw':'30vw', '35vw':'35vw', '40vw':'40vw', '50vw':'50vw', '60vw':'60vw', '70vw':'70vw', '80vw':'80vw', '90vw':'90vw', '100vw':'100vw' };
    var imgHeights = { 'auto':'Авто', '5vh':'5vh', '10vh':'10vh', '15vh':'15vh', '20vh':'20vh', '25vh':'25vh', '30vh':'30vh', '40vh':'40vh', '50vh':'50vh', '60vh':'60vh' };

    var titleCache = Lampa.Storage.get("title_cache_hybrid_v3") || {};
    var uatorCache = {};

    var styles = `

        .ymod-hybrid-enabled .full-start-new__head, 
        .ymod-hybrid-enabled .full-start__head { 
            display: none !important; height: 0px !important; margin: 0 !important; padding: 0 !important; visibility: hidden !important; position: absolute !important; 
        }

        .plugin-hybrid-title { margin-top: 5px; margin-bottom: 5px; width: 100%; position: relative; z-index: 10; text-align: left; }
        .plugin-hybrid-title__body { line-height: 1.2; font-weight: bold; display: flex; align-items: baseline; flex-wrap: wrap; justify-content: flex-start; }
        
        .quality-badges-container { display: flex; align-items: center; }
        .qb-unified-block { display: flex; flex-wrap: nowrap; align-items: center; }
        .quality-badge { display: inline-flex; align-items: center; gap: 0.35em; color: #fff; white-space: nowrap; flex-shrink: 0; height: 1.1em; }
        .qb-text { font-weight: bold; line-height: 1.1em; height: 1.1em; display: flex; align-items: center; }
        .qb-prefix-icon { height: 1.1em !important; width: auto; display: block; object-fit: contain; margin: 0; }
        .qb-text-icon { height: 1.1em !important; line-height: 1.1em !important; font-size: 0.85em !important; font-weight: 900; display: inline-flex; align-items: center; justify-content: center; background: #fff; color: #000; padding: 0 0.25em; border-radius: 2px; box-sizing: border-box; vertical-align: top; }
        .qb-not-found { opacity: 0.6; }
        
        .ymod-gap-negative > *:not(:first-child) {
            margin-left: var(--ymod-gap-negative, 0px) !important;
        }

        .ymod-logo-loader {
            width: 250px; height: 3em; margin: 5px 0;
            background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.05) 75%);
            background-size: 200% 100%; animation: ymod-loading 1.5s infinite linear; border-radius: 8px;
            display: inline-block;
        }
        @keyframes ymod-loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        img.ymod-poster-rounded,
        .full-start-new__poster img,
        .full-start__poster img,
        img.full-start__poster {
            border-radius: 36px 36px 36px 36px !important;
            border-top-left-radius: 36px !important;
            border-top-right-radius: 36px !important;
            border-bottom-left-radius: 36px !important;
            border-bottom-right-radius: 36px !important;
            -webkit-border-radius: 36px !important;
            -webkit-border-top-left-radius: 36px !important;
            -webkit-border-top-right-radius: 36px !important;
            -webkit-border-bottom-left-radius: 36px !important;
            -webkit-border-bottom-right-radius: 36px !important;
            -moz-border-radius: 36px !important;
            -moz-border-radius-topleft: 36px !important;
            -moz-border-radius-topright: 36px !important;
            -moz-border-radius-bottomleft: 36px !important;
            -moz-border-radius-bottomright: 36px !important;
            overflow: hidden !important;
            box-shadow: 0px 8px 25px rgba(0,0,0,0.3) !important;
        }

        .ymod-apple-container {
            display: inline-flex !important; align-items: center;
            padding: 0.21em 0.32em !important; border-radius: 999px !important;
            background: rgba(22,24,30,.28) !important; border: 1px solid rgba(255,255,255,.10) !important;
            box-shadow: inset 0 1px 0 rgba(255,255,255,.10), 0 8px 18px rgba(0,0,0,.12) !important;
            backdrop-filter: blur(18px) saturate(140%) !important; -webkit-backdrop-filter: blur(18px) saturate(140%) !important;
            width: max-content;
        }
        .ymod-apple-container.is-lite {
            background: rgba(30, 32, 40, 0.98) !important; box-shadow: 0 4px 15px rgba(0,0,0,0.6) !important;
            backdrop-filter: none !important; -webkit-backdrop-filter: none !important;
        }
        .ymod-apple-item {
            border: 0 !important; background: transparent !important; color: rgba(255,255,255,.92) !important;
            height: 2.16em !important; min-height: 2.16em !important; 
            display: inline-flex !important; align-items: center; justify-content: center;
            padding: 0 0.8em !important; border-radius: 999px !important;
            transition: background .2s ease !important; cursor: pointer; outline: none; margin: 0 !important;
        }
        .ymod-apple-item.focus, .ymod-apple-item.hover {
            background: rgba(255,255,255,.14) !important; box-shadow: inset 0 1px 0 rgba(255,255,255,.10) !important; transform: none !important;
        }
        .ymod-apple-container .quality-badge { padding: 0 0.8em !important; }

        body .full-start__buttons,
        body .full-start-new__buttons,
        body.ymod-buttons-apple .full-start__buttons,
        body.ymod-buttons-apple .full-start-new__buttons {
            display: inline-flex !important; align-items: center; justify-content: flex-start;
            margin-top: var(--ymod-btn-margin-top, 1em) !important;
            max-width: 100%; flex-wrap: wrap !important; gap: 0.25em !important;
            box-sizing: border-box;
        }
        
        body.ymod-buttons-apple .full-start__buttons,
        body.ymod-buttons-apple .full-start-new__buttons {
            padding: 0.35em 0.4em !important; border-radius: 999px !important;
            background: rgba(22,24,30,.28) !important; border: 1px solid rgba(255,255,255,.10) !important;
            box-shadow: inset 0 1px 0 rgba(255,255,255,.10), 0 8px 18px rgba(0,0,0,.12) !important;
            backdrop-filter: blur(18px) saturate(140%) !important; -webkit-backdrop-filter: blur(18px) saturate(140%) !important;
            font-size: var(--ymod-btn-size, 1em) !important;
        }
        
        body.ymod-buttons-apple-lite .full-start__buttons,
        body.ymod-buttons-apple-lite .full-start-new__buttons {
            background: rgba(30, 32, 40, 0.98) !important; box-shadow: 0 4px 15px rgba(0,0,0,0.6) !important;
            backdrop-filter: none !important; -webkit-backdrop-filter: none !important;
        }

        body.ymod-buttons-apple .full-start__button,
        body.ymod-buttons-apple .full-start-new__button {
            border: 0 !important; background: transparent !important; color: rgba(255,255,255,.92) !important;
            height: 2.8em !important; min-height: 2.8em !important; align-items: center; justify-content: center;
            padding: 0 1.2em !important; border-radius: 999px !important; transition: background .2s ease !important;
            margin: 0 !important; font-weight: bold; font-size: inherit !important; box-shadow: none !important;
        }
        
        body.ymod-buttons-apple .full-start__button:not(.hidden):not(.hide):not([style*="display: none"]):not([style*="display:none"]),
        body.ymod-buttons-apple .full-start-new__button:not(.hidden):not(.hide):not([style*="display: none"]):not([style*="display:none"]) {
            display: inline-flex !important;
        }
        
        body.ymod-buttons-apple .ua-sites-container {
            display: inline-flex !important; align-items: center; gap: 0.25em !important; margin: 0 !important; padding: 0 !important; background: transparent !important; border: none !important; box-shadow: none !important;
        }
        body.ymod-buttons-apple .ua-btn-item {
            border: 0 !important; background: transparent !important; color: rgba(255,255,255,.92) !important;
            height: 2.8em !important; min-height: 2.8em !important; width: 2.8em !important; display: inline-flex !important; align-items: center; justify-content: center;
            border-radius: 999px !important; transition: background .2s ease !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important;
            font-size: inherit !important; 
        }
        body.ymod-buttons-apple .full-start__button.focus, 
        body.ymod-buttons-apple .full-start__button:hover,
        body.ymod-buttons-apple .ua-btn-item.focus,
        body.ymod-buttons-apple .ua-btn-item:hover,
        body.ymod-buttons-apple .ua-btn-item.active.focus {
            background: rgba(255,255,255,.14) !important; box-shadow: inset 0 1px 0 rgba(255,255,255,.10) !important; transform: none !important; color: #fff !important;
        }
        body.ymod-buttons-apple .ua-btn-item.active {
            transform: none !important;
        }
        body.ymod-buttons-apple .full-start__button svg {
            width: 1.2em !important; height: 1.2em !important; margin-right: 0.4em !important;
        }
        body.ymod-buttons-apple .full-start__button.button--options svg {
            margin-right: 0 !important;
        }
        body.ymod-buttons-apple .full-start__button.button--options {
            padding: 0 0.8em !important;
        }
        body.ymod-buttons-apple .ua-btn-item img,
        body.ymod-buttons-apple .ua-btn-item svg {
            width: 1.5em !important; height: 1.5em !important; border-radius: 0 !important; display: block; filter: none !important;
        }
        body.ymod-buttons-apple .ua-sites-container:not(.is-bw) .ua-btn-item.active.focus img {
            filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.3)) !important;
        }
        body.ymod-buttons-apple .ua-btn-item.loading svg {
            animation: spin-badge 1.5s linear infinite !important;
        }

        @media screen and (orientation: portrait), screen and (max-width: 767px) {
            .plugin-hybrid-title { text-align: center !important; }
            .plugin-hybrid-title__body { justify-content: center !important; }
            .quality-badges-container { width: 100%; justify-content: center; display: block !important; margin: 10px 0; clear: both; }
            .qb-unified-block { flex-wrap: wrap; justify-content: center; width: 100%; }
            .ymod-apple-container { flex-wrap: wrap !important; width: 100% !important; justify-content: center !important; }
            body.ymod-buttons-apple .full-start__buttons,
            body.ymod-buttons-apple .full-start-new__buttons {
                justify-content: center !important; width: 100% !important; margin-left: 0 !important; margin-right: 0 !important;
            }

            .card__age { text-align: center !important; width: 100% !important; display: block !important; }
            .full-start__pg { text-align: center !important; display: flex !important; justify-content: center !important; align-items: center !important; margin-left: auto !important; margin-right: auto !important; }
            .full-start-new__details, .full-start__details { justify-content: center !important; display: flex !important; flex-wrap: wrap !important; }
            .full-start-new__details > *, .full-start__details > * { text-align: center !important; margin: 0.45em !important; }
        }
        

    `;
    $('head').append('<style id="ymod-global-styles">' + styles + '</style>');

    function updateBodyClasses() {
        // The previous global slogan toggle is obsolete in Card Fusion.
        $('body').removeClass('ymod-slogan-hidden');

        if (isEnabled('hybrid')) $('body').addClass('ymod-hybrid-enabled');
        else $('body').removeClass('ymod-hybrid-enabled');

        var btnStyle = Lampa.Storage.get('ym_button_style', 'normal');
        var btnSize = Lampa.Storage.get('ym_button_size', '1em');
        var btnMarginTop = Lampa.Storage.get('ym_button_margin_top', '1em');
        
        $('body').removeClass('ymod-buttons-apple ymod-buttons-apple-lite');
        if (btnStyle === 'apple') $('body').addClass('ymod-buttons-apple');
        if (btnStyle === 'apple_lite') $('body').addClass('ymod-buttons-apple ymod-buttons-apple-lite');
        
        document.documentElement.style.setProperty('--ymod-btn-size', btnSize);
        document.documentElement.style.setProperty('--ymod-btn-margin-top', btnMarginTop);
    }
    updateBodyClasses();

  function analyzeAndInvert(img, threshold) {
    try {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        if (canvas.width === 0 || canvas.height === 0) return;
        ctx.drawImage(img, 0, 0);
        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var data = imageData.data;
        var darkPixels = 0;
        var totalPixels = 0;
        for (var i = 0; i < data.length; i += 4) {
            var alpha = data[i + 3];
            if (alpha < 10) continue;
            totalPixels++;
            var r = data[i], g = data[i + 1], b = data[i + 2];
            var brightness = (r * 299 + g * 587 + b * 114) / 1000;
            var max = Math.max(r, g, b);
            if (brightness < 100 && max < 160) darkPixels++;
        }
        if (totalPixels > 0 && (darkPixels / totalPixels) >= threshold) {
            var curFilter = img.style.filter || '';
            if (Lampa.Storage.get('cf_logo_style','original') === 'mono') {
                img.style.filter = 'brightness(0) invert(1)';
            } else if (Lampa.Storage.get('cf_logo_halo', true)) {
                img.style.filter = curFilter + ' drop-shadow(0 0 0.7px rgba(255,255,255,1))';
            }
        }
    } catch (e) {}
}
    function handleLogo(e) {
        var render = e.object.activity.render();
        var data = e.data.movie;
        var type = data.name ? "tv" : "movie";
        
        var isMoveEnabled = Lampa.Storage.get("logo_move", false);
        var isLandscape = window.innerWidth > window.innerHeight;

        var originalTitle = render.find(".full-start-new__title, .full-start__title").not('.ymod-moved-title').first();
        var finalTarget = originalTitle;

        if (originalTitle.length) {
            if (!originalTitle.data('ymod-orig-html')) {
                var rawHtml = originalTitle.html();
                if (rawHtml && rawHtml.indexOf('ymod-logo-loader') === -1) {
                    originalTitle.data('ymod-orig-html', rawHtml);
                } else {
                    originalTitle.data('ymod-orig-html', data.title || data.name || "Title");
                }
            }
        }

        if (isMoveEnabled && isLandscape && originalTitle.length) {
            var body = render.find('.full-start-new__body');
            if (body.length) {
                var wrapper = render.find('.ymod-title-wrapper');
                if (wrapper.length === 0) {
                    body.css('position', 'relative');
                    wrapper = $('<div class="ymod-title-wrapper"></div>');
                    var mT = Lampa.Storage.get("logo_margin_top", "0px");
                    var mL = Lampa.Storage.get("logo_margin_left", "0px");
                    var mB = Lampa.Storage.get("logo_margin_bottom", "auto");
                    wrapper.css({
                        'position': 'absolute',
                        'top': mT !== 'auto' ? mT : 'auto',
                        'left': mL !== 'auto' ? mL : 'auto',
                        'bottom': mB !== 'auto' && mB !== '0px' ? mB : 'auto',
                        'z-index': '9999',
                        'pointer-events': 'none',
                        'box-sizing': 'border-box',
                        'max-width': '100vw'
                    });
                    body.append(wrapper);
                }

                var movedTitle = render.find('.ymod-moved-title');
                if (movedTitle.length === 0) {
                    movedTitle = originalTitle.clone();
                    movedTitle.removeClass('full-start-new__title full-start__title');
                    movedTitle.addClass('ymod-moved-title');
                    movedTitle.data('ymod-orig-html', originalTitle.data('ymod-orig-html'));
                    movedTitle.css({
                        'margin': '0', 'padding': '0', 'line-height': '1.2', 'text-shadow': '1px 1px 3px rgba(0,0,0,0.9)',
                        'text-align': 'left'
                    });
                    wrapper.append(movedTitle);
                }
                originalTitle.hide().attr('style', 'display: none !important;');
                finalTarget = movedTitle;
            }
        } else if (originalTitle.length) {
            if (!isLandscape) finalTarget.css("text-align", "center");
            else finalTarget.css("text-align", "left");
            
            if (!(isMoveEnabled && isLandscape)) {
                var leftM = Lampa.Storage.get("logo_margin_left", "0px");
                if(leftM !== '0px') finalTarget.css('margin-left', leftM);
            }
        }

        var head_elem = render.find(".full-start-new__head");
        var details_elem = render.find(".full-start-new__details");
        if (head_elem.length && details_elem.length && details_elem.find(".logo-moved-head").length === 0 && (!isMoveEnabled || !isLandscape)) {
            var content = head_elem.html();
            if (content) {
                head_elem.hide();
                if (details_elem.children().length > 0) details_elem.append('<span class="full-start-new__split logo-moved-separator">●</span>');
                details_elem.append('<span class="logo-moved-head">' + content + "</span>");
            }
        }

        function applyTextFallback() {
            if (!finalTarget.length) return;
            var orig = finalTarget.data('ymod-orig-html');
            if (orig) finalTarget.html(orig);
            
            var customSize = Lampa.Storage.get("logo_custom_text_size", "3.0em");
            var customW = Lampa.Storage.get("logo_custom_width", "auto");
            var customH = Lampa.Storage.get("logo_custom_height", "auto");
            var defaultMaxW = (isMoveEnabled && isLandscape) ? "100%" : (!isLandscape ? "90vw" : "50vw");

            finalTarget.css({
                'font-size': customSize,
                'white-space': 'normal',
                'word-break': 'break-word',
                'overflow-wrap': 'break-word',
                'max-width': customW !== "auto" ? customW : defaultMaxW,
                'max-height': customH !== "auto" ? customH : 'none',
                'display': 'block',
                'margin': '0',
                'padding': '0',
                'line-height': '1.2',
                'text-shadow': '1px 1px 3px rgba(0,0,0,0.9)',
                'text-align': (isMoveEnabled && isLandscape) ? 'left' : (!isLandscape ? 'center' : 'left'),
                'opacity': '1'
            });

            finalTarget[0].style.setProperty("overflow", "visible", "important");
            var pElem = finalTarget[0].parentElement;
            if (pElem) {
                pElem.style.setProperty("overflow", "visible", "important");
            }

            if (!(isMoveEnabled && isLandscape)) {
                var mLeftStatic = Lampa.Storage.get("logo_margin_left", "0px");
                if (mLeftStatic !== '0px') finalTarget.css('margin-left', mLeftStatic);
            }
        }

        if (Lampa.Storage.get("logo_glav", "0") == "1") {
            applyTextFallback();
            return;
        }

        var imgType = Lampa.Storage.get("logo_type", "logo");
        var user_lang = Lampa.Storage.get("logo_lang", "uk");
        var target_lang = user_lang ? user_lang : Lampa.Storage.get("language");
        var size = Lampa.Storage.get("logo_size", "original");
        var cache_key = "img_cache_v3_" + type + "_" + data.id + "_" + target_lang + "_" + imgType;
        var cfOverride = (imgType === 'logo' && data.id) ? Lampa.Storage.get('cf_logo_override_' + type + '_' + data.id, '') : '';

        var isPoster = imgType.indexOf("poster") !== -1;
        var isBackdrop = imgType.indexOf("backdrop") !== -1;

        function startLogoAnimation(img_url, save_to_cache) {
            if (save_to_cache) Lampa.Storage.set(cache_key, img_url);
            var img = new Image();
            img.crossOrigin = "anonymous";
            img.src = img_url;
            
            img.onload = function () {
                if (finalTarget.length) {
                    finalTarget[0].style.height = ""; 
                    finalTarget[0].style.margin = "0"; 
                    finalTarget[0].style.padding = "0";
                    finalTarget[0].style.display = "block"; 
                    finalTarget[0].style.transition = "none";
                    finalTarget[0].style.boxSizing = "border-box"; 
                    finalTarget[0].style.opacity = "1";
                    
                    finalTarget[0].style.setProperty("overflow", "visible", "important");
                    finalTarget[0].style.setProperty("white-space", "normal", "important");
                    var pElem = finalTarget[0].parentElement;
                    if (pElem) {
                        pElem.style.setProperty("overflow", "visible", "important");
                    }
                    
                    if (!isLandscape) {
                        finalTarget[0].style.textAlign = "center";
                    } else {
                        finalTarget[0].style.textAlign = "left";
                    }
                    
                    if (!(isMoveEnabled && isLandscape)) {
                        var mLeftStatic = Lampa.Storage.get("logo_margin_left", "0px");
                        if(mLeftStatic !== '0px') finalTarget[0].style.marginLeft = mLeftStatic;
                    }

                    img.style.marginTop = "0"; img.style.marginBottom = "0"; img.style.paddingTop = "0em"; img.style.paddingBottom = "0em";
                    
                    var customW = Lampa.Storage.get("logo_custom_width", "auto");
                    var defaultCustomH = (isPoster || isBackdrop) ? "40vh" : "15vh";
                    var customH = Lampa.Storage.get("logo_custom_height", defaultCustomH);

                    if (isPoster || isBackdrop) {
                        var defaultH;
                        if (isPoster) {
                            defaultH = isLandscape ? "55vh" : "40vh";
                        } else {
                            defaultH = isLandscape ? "35vh" : "25vh";
                        }

                        img.style.width = customW !== "auto" ? customW : "auto";
                        img.style.height = customH !== "auto" ? customH : (customW === "auto" ? defaultH : "auto");
                        
                        img.style.maxWidth = "100%"; 
                        img.style.maxHeight = customH !== "auto" ? customH : "80vh";
                        
                        img.style.aspectRatio = isPoster ? "2 / 3" : "16 / 9";
                        img.style.objectFit = "cover";
                        img.classList.add('ymod-poster-rounded');
                    } else {
                        var defaultMaxW = (isMoveEnabled && isLandscape) ? "100%" : (!isLandscape ? "90vw" : "50vw");
                        var defaultMaxH = (isMoveEnabled && isLandscape) ? "100%" : "60vh";
                        
                        img.style.width = customW !== "auto" ? customW : "auto";
                        img.style.height = "auto";
                        
                        if (customW === "auto" && !isLandscape) {
                            img.style.width = "100%";
                        }
                        
                        img.style.maxWidth = customW !== "auto" ? customW : defaultMaxW;
                        img.style.maxHeight = customH !== "auto" ? customH : defaultMaxH;
                        img.style.objectFit = "contain";
                        img.classList.remove('ymod-poster-rounded');
                    }
                    
                    img.style.display = "inline-block";
                    img.style.boxSizing = "border-box";
                    
                    if (isMoveEnabled && isLandscape) {
                        img.style.objectPosition = "left top"; 
                        img.style.marginLeft = "0"; 
                        img.style.marginRight = "0"; 
                    } else if (!isLandscape) { 
                        img.style.objectPosition = "center"; 
                        img.style.marginLeft = "auto"; 
                        img.style.marginRight = "auto"; 
                    } else { 
                        img.style.objectPosition = "left bottom"; 
                        img.style.marginLeft = "0"; 
                        img.style.marginRight = "0"; 
                    }
                    
                    img.style.opacity = "1"; img.style.transition = "none";
                    var mono = Lampa.Storage.get('cf_logo_style','original') === 'mono';
                    img.style.filter = mono ? 'grayscale(1) brightness(1.25) contrast(.85)' :
                        'drop-shadow(3px 3px 3px rgba(0,0,0,.5))';
                    if (!isPoster && !isBackdrop) analyzeAndInvert(img, 0.87);
                    
                    finalTarget.empty().append(img);
                }
            };
            img.onerror = function () {
                Lampa.Storage.set(cache_key, "none");
                applyTextFallback();
            };
        }

        if (cfOverride && /^\/[A-Za-z0-9_./-]+$/.test(cfOverride)) {
            startLogoAnimation(Lampa.TMDB.image('/t/p/' + size + cfOverride.replace(/\.svg$/i, '.png')), false);
            return;
        }

        var cached_url = Lampa.Storage.get(cache_key);
        if (cached_url && cached_url !== "none") {
            startLogoAnimation(cached_url, false);
            return;
        } else if (cached_url === "none") {
            applyTextFallback();
            return;
        }

        if (finalTarget.length) {
            finalTarget.html('<div class="ymod-logo-loader"></div>');
            finalTarget.css({
                'display': 'block', 'margin': '0', 'padding': '0',
                'text-align': (isMoveEnabled && isLandscape) ? 'left' : (!isLandscape ? 'center' : 'left')
            });
            if (!(isMoveEnabled && isLandscape)) {
                var mLf = Lampa.Storage.get("logo_margin_left", "0px");
                if(mLf !== '0px') finalTarget.css('margin-left', mLf);
            }
        }

        if (data.id) {
            var url = Lampa.TMDB.api(type + "/" + data.id + "/images?api_key=" + Lampa.TMDB.key() + "&include_image_language=" + target_lang + ",en,null");
            $.get(url, function (data_api) {
                var final_img = null;
                var targetArray;
                
                if (isPoster) targetArray = data_api.posters;
                else if (isBackdrop) targetArray = data_api.backdrops;
                else targetArray = data_api.logos;

                if (targetArray && targetArray.length > 0) {
                    var found;
                    if (imgType.indexOf("_ua") !== -1) {
                        found = targetArray.find(function(l) { return l.iso_639_1 == "uk"; }) || 
                                targetArray.find(function(l) { return l.iso_639_1 == "en"; }) || 
                                targetArray[0];
                    } else if (imgType.indexOf("_en") !== -1) {
                        found = targetArray.find(function(l) { return l.iso_639_1 == "en"; }) || 
                                targetArray[0];
                    } else {
                        found = targetArray.find(function(l) { return l.iso_639_1 == target_lang; }) || 
                                targetArray.find(function(l) { return l.iso_639_1 == "en"; }) || 
                                targetArray[0];
                    }
                    if (found) final_img = found.file_path;
                }
                if (final_img) {
                    var img_url = Lampa.TMDB.image("/t/p/" + size + final_img.replace(".svg", ".png"));
                    startLogoAnimation(img_url, true);
                } else {
                    Lampa.Storage.set(cache_key, "none");
                    applyTextFallback();
                }
            }).fail(function() {
                Lampa.Storage.set(cache_key, "none");
                applyTextFallback();
            });
        } else {
            applyTextFallback();
        }
    }

    function getCountryUA(iso) {
        if (!iso) return '';
        var code = iso.toLowerCase().trim();
        return countryNames[code] || Lampa.Lang.translate(code) || iso;
    }

    function renderHybridTitle(render, ukTitle, enTitle, hasLogo, year, country) {
        if (!render) return;
        $(".plugin-hybrid-title", render).remove();
        
        var mode = Lampa.Storage.get('hybrid_title_mode', 'smart');
        var sizeKey = Lampa.Storage.get('hybrid_title_size', 'm');
        var marginLeft = Lampa.Storage.get('hybrid_title_margin_left', '0px');
        var displayTitle = mode === 'en' ? enTitle : (mode === 'smart' && hasLogo ? enTitle : ukTitle);
        if (!displayTitle || displayTitle === "undefined") displayTitle = "";

        var sizes = {
            'xs': { title: '1.0em', info: '0.8em' }, 's': { title: '1.2em', info: '0.9em' },
            'm': { title: '1.4em', info: '1.0em' }, 'l': { title: '1.7em', info: '1.1em' },
            'xl': { title: '2.0em', info: '1.2em' }, 'xxl': { title: '2.4em', info: '1.3em' },
            'giant': { title: '3.0em', info: '1.5em' }
        };
        var currentSize = sizes[sizeKey] || sizes['m'];

        var details = [];
        if (year && year !== "undefined") details.push(year);
        if (country && country !== "undefined") details.push(country);
        var secondaryInfo = details.length > 0 ? ' • ' + details.join(' • ') : '';

        var html = '<div class="plugin-hybrid-title" style="margin-left:' + marginLeft + '"><div class="plugin-hybrid-title__body">' +
            '<span class="cf-secondary-title" style="font-size:' + currentSize.title + ';color:#fff;opacity:.8"></span>' +
            '<span class="cf-secondary-metadata" style="font-size:' + currentSize.info + ';color:#fff;opacity:.5;margin-left:6px"></span>' +
            '</div></div>';

        var target = render.find(".full-start-new__title, .full-start__title").not('.ymod-moved-title').first();
        if(target.length) target.after(html);
        var $hybrid=render.find('.plugin-hybrid-title');
        $hybrid.find('.cf-secondary-title').text(displayTitle);
        $hybrid.find('.cf-secondary-metadata').text(secondaryInfo);
        $hybrid.attr('data-cf-year',year||'').attr('data-cf-country',country||'');
        if (window.CardFusionRuntime) window.CardFusionRuntime.schedule();
        var cfTitleStyle = Lampa.Storage.get('cf_secondary_title_style', 'normal');
        var $title = render.find('.plugin-hybrid-title__body');
        $title.removeClass('cf-title-apple cf-title-lite cf-title-info');
        if (cfTitleStyle !== 'normal') $title.addClass('cf-title-' + cfTitleStyle);

        render.find('.full-start-new__details span, .full-start__details span').each(function() {
            var txt = $(this).text().trim();
            if (/^\d{4}$/.test(txt) || Object.values(countryNames).includes(txt) || !!countryNames[txt.toLowerCase()]) {
                var next = $(this).next('.full-start-new__split');
                if(next.length) next.hide();
                else $(this).prev('.full-start-new__split').hide();
                $(this).hide();
            }
        });
    }

    function handleHybridTitle(e) {
        var card = e.data.movie;
        var render = e.object.activity.render();
        var cached = titleCache[card.id];
        var now = Date.now();

        var imgType = Lampa.Storage.get("logo_type", "logo");

        if (cached && (now - cached.timestamp < 2592000000)) {
            renderHybridTitle(render, cached.ukTitle, cached.enTitle, cached.hasLogo, cached.year, cached.country);
            return;
        }

        var type = card.first_air_date ? "tv" : "movie";
        var url = "https://api.themoviedb.org/3/" + type + "/" + card.id + "?api_key=" + Lampa.TMDB.key() + "&append_to_response=translations,images&include_image_language=uk,en,null";

        $.getJSON(url, function (data) {
            var hasUkrainianImage = false;
            var isPoster = imgType.indexOf("poster") !== -1;
            var isBackdrop = imgType.indexOf("backdrop") !== -1;
            var targetArray = isPoster ? data.images.posters : (isBackdrop ? data.images.backdrops : data.images.logos);

            if (data.images && targetArray) {
                hasUkrainianImage = targetArray.some(function (l) { return l.iso_639_1 === "uk"; });
            }
            var originalName = data.original_title || data.original_name || card.original_title || card.original_name || "";
            var enTitle = data.title || data.name || originalName;
            var ukTitle = enTitle;
            if (data.translations && data.translations.translations) {
                var translation = data.translations.translations.find(function (t) { return t.iso_3166_1 === "UA" || t.iso_639_1 === "uk"; });
                if (translation) ukTitle = translation.data.title || translation.data.name || enTitle;
            }
            var dateStr = data.release_date || data.first_air_date || "";
            var year = dateStr ? dateStr.split("-")[0] : "";
            var countryList = (data.production_countries || []).map(function (c) { return getCountryUA(c.iso_3166_1); });
            var countryString = countryList.join(" / ");

            titleCache[card.id] = { ukTitle: ukTitle || "", enTitle: enTitle || "", hasLogo: hasUkrainianImage, year: year || "", country: countryString || "", timestamp: now };
            Lampa.Storage.set("title_cache_hybrid_v3", titleCache);
            renderHybridTitle(render, ukTitle, enTitle, hasUkrainianImage, year, countryString);
        }).fail(function() {
            var fallbackTitle = card.title || card.name || card.original_title || "";
            renderHybridTitle(render, fallbackTitle, fallbackTitle, false, "", "");
        });
    }

    function getResolutionLabel(width) {
        var w = parseInt(width || 0);
        if (w >= 3800) return '4K';
        if (w >= 2500) return '2K';
        if (w >= 1900) return 'FHD';
        if (w >= 1200) return 'HD';
        return 'SD';
    }

    function getBestAndPopular(results, movie) {
        if (!results || !Array.isArray(results)) return { ukr: false };
        
        var ukrPattern = /(^|[^а-яєіїґa-z])(ukr|ukrainian|українськ[а-яєіїґ]*|укр|ua|укрдубляж|укрпереклад|укрмов[а-яєіїґ]*)($|[^а-яєіїґa-z])/i;
        var ukrResults = [];
        var movieYear = parseInt(movie.release_date || movie.first_air_date || movie.year || 0);
        var isTv = !!(movie.name || movie.first_air_date); 

        results.forEach(function(item) {
            var title = (item.Title || '').toLowerCase();
            
            if (movieYear > 0 && !isTv) {
                var yearMatch = title.match(/\b(19|20)\d{2}\b/g);
                if (yearMatch) {
                    var correctYear = yearMatch.some(function(y) { return Math.abs(parseInt(y) - movieYear) <= 1; });
                    if (!correctYear) return;
                }
            }
            
            var titleClean = title
                .replace(/[a-z0-9\-]+\.(ua|uk)\b/ig, '') 
                .replace(/(укр[а-яєіїґ]*|ukr[a-z]*|ua|ukrainian)[\s\.\,\_\-\|]*(sub|суб)[a-zа-яєіїґ]*/ig, '')
                .replace(/(sub|суб)[a-zа-яєіїґ]*[\s\.\,\_\-\|]*(укр[а-яєіїґ]*|ukr[a-z]*|ua|ukrainian)/ig, '');
                
            var hasUkr = ukrPattern.test(titleClean);

            if (!hasUkr && item.ffprobe && Array.isArray(item.ffprobe)) {
                hasUkr = item.ffprobe.some(function(s) {
                    if (s.codec_type !== 'audio') return false;
                    var l = (s.tags && s.tags.language ? s.tags.language : '').toLowerCase();
                    var t = (s.tags && s.tags.title ? s.tags.title : '').toLowerCase();
                    return l === 'uk' || l === 'ukr' || l === 'ua' || ukrPattern.test(t);
                });
            }

            if (!hasUkr) {
                var trackerName = (item.tracker || item.Tracker || item.name || '').toLowerCase();
                if (trackerName.indexOf('toloka') !== -1 || trackerName.indexOf('mazepa') !== -1) {
                    hasUkr = true;
                }
            }

            if (hasUkr) {
                var width = 0;
                if (item.ffprobe) {
                    item.ffprobe.forEach(function(s) { if (s.codec_type === 'video' && s.width) width = Math.max(width, parseInt(s.width)); });
                }
                if (width === 0) {
                    if (/2160|4k|uhd/i.test(title)) width = 3840; 
                    else if (/1080|fhd/i.test(title)) width = 1920; 
                    else if (/720|hd/i.test(title)) width = 1280; 
                    else if (/480|sd/i.test(title)) width = 720; 
                    else width = 720;
                }
                item.detectedWidth = width;
                item.seedersCount = parseInt(item.Seeders || 0);
                ukrResults.push(item);
            }
        });

        if (ukrResults.length === 0) return { ukr: false };

        var best = ukrResults.reduce(function(p, c) { 
            if (p.detectedWidth > c.detectedWidth) return p;
            if (p.detectedWidth < c.detectedWidth) return c;
            return (p.seedersCount > c.seedersCount) ? p : c;
        });
        var popular = ukrResults.reduce(function(p, c) { return (p.seedersCount > c.seedersCount) ? p : c; });
        var tech = { hdr: false, dv: false, audio: null };
        var maxChannels = 0;

        ukrResults.forEach(function(item) {
            if (item.ffprobe) {
                item.ffprobe.forEach(function(s) { if (s.codec_type === 'audio' && s.channels) maxChannels = Math.max(maxChannels, parseInt(s.channels)); });
            }
            var t = item.Title.toLowerCase();
            if (t.match(/7\.1|8ch/)) maxChannels = Math.max(maxChannels, 8);
            else if (t.match(/5\.1|6ch/)) maxChannels = Math.max(maxChannels, 6);
            else if (t.match(/2\.0/)) maxChannels = Math.max(maxChannels, 2);
        });

        if (maxChannels > 0) tech.audio = (maxChannels >= 8) ? '7.1' : (maxChannels >= 6) ? '5.1' : (maxChannels >= 4) ? '4.0' : '2.0';

        if (best.ffprobe) {
            best.ffprobe.forEach(function(s) {
                if (s.codec_type === 'video') {
                    var side = JSON.stringify(s.side_data_list || []);
                    if (/vision|dovi/i.test(side)) tech.dv = true;
                    if (s.color_transfer === 'smpte2084') tech.hdr = true;
                }
            });
        }
        var bTitle = best.Title.toLowerCase();
        if (!tech.dv && /vision|dovi/i.test(bTitle)) tech.dv = true;
        if (!tech.hdr && /hdr/i.test(bTitle)) tech.hdr = true;

        return { ukr: true, bestRes: getResolutionLabel(best.detectedWidth), popRes: getResolutionLabel(popular.detectedWidth), popSeeds: popular.seedersCount, tech: tech };
    }

    var cfLastUator = null;
    function renderUator(container, data) {
        if (data) cfLastUator = data;
        container.find('.qb-unified-block').remove();
        if (!data) return;

        var isCard = container.closest('.card').length > 0 || container.hasClass('card__view');
        var styleType = isCard ? 'normal' : Lampa.Storage.get('uator_style', 'normal');
        var isApple = (styleType === 'apple' || styleType === 'apple_lite');

        var size = Lampa.Storage.get('uator_rating_size', '1.1em');
        var saturation = Lampa.Storage.get('uator_saturation', '100%');
        var uatorGap = Lampa.Storage.get('uator_gap', '0.45em');
        
        var blockClass = 'qb-unified-block' + (isApple ? ' ymod-apple-container' + (styleType === 'apple_lite' ? ' is-lite' : '') : '');
        var blockStyle = 'font-size: ' + size + ';';

        if (uatorGap.indexOf('-') !== -1) {
            blockStyle += ' gap: 0px; --ymod-gap-negative: ' + uatorGap + ';';
            blockClass += ' ymod-gap-negative';
        } else {
            blockStyle += ' gap: ' + uatorGap + ';';
        }

        var block = $('<div class="' + blockClass + '" style="' + blockStyle + '"></div>');
        var badgeClass = 'quality-badge' + (isApple ? ' ymod-apple-item' : '');

        if (!data.ukr) {
            var iconHtml = (saturation === '0%') ? '<span class="qb-text-icon">UA</span>' : '<img src="'+uatorIcons.none+'" class="qb-prefix-icon" style="filter: saturate('+saturation+')">';
            block.append('<div class="' + badgeClass + ' qb-not-found">' + iconHtml + '<span class="qb-text">немає</span></div>');
        } else {
            var items = [ {i: uatorIcons.ua, t: data.bestRes, type: 'ua'}, {i: uatorIcons.top, t: data.popRes}, {i: uatorIcons.seeds, t: data.popSeeds} ];
            if (data.tech.audio) items.push({i: uatorIcons.audio, t: data.tech.audio});
            if (data.tech.dv) items.push({i: uatorIcons.dv, t: '', type: 'dv'});
            if (data.tech.hdr) items.push({i: uatorIcons.hdr, t: '', type: 'hdr'});
            
            items.forEach(function(it) {
                var iconHtml = '';
                if (it.i) {
                    var style = 'filter: saturate('+saturation+');';
                    if (it.type === 'ua' && saturation === '0%') iconHtml = '<span class="qb-text-icon">UA</span>';
                    else {
                        if (it.type === 'dv') style = 'filter: brightness(0) invert(1);';
                        else if (it.type === 'hdr') style = 'filter: grayscale(1);';
                        iconHtml = '<img src="'+it.i+'" class="qb-prefix-icon" style="'+style+'">';
                    }
                }
                var textHtml = it.t ? '<span class="qb-text">' + it.t + '</span>' : '';
                block.append('<div class="' + badgeClass + '">' + iconHtml + textHtml + '</div>');
            });
        }
        container.append(block);
    }

    // Card Fusion: no Uator polling on catalogue cards. Detail-card badges remain.

    function handleUatorFull(e) {
        var renderTarget = e.object.activity.render();
        var cont = $('.quality-badges-container', renderTarget).first();
        if (!cont.length) cont = $('<div class="quality-badges-container"></div>');
        var panel = renderTarget.find('.full-start-new__details, .full-start__details').first();
        var ratings = renderTarget.find('.full-start-new__rate-line.rate-fix, .full-start__rate-line').first();
        var position = Lampa.Storage.get('cf_uator_position','standard');
        if (position === 'above' && panel.length) panel.before(cont);
        else if (position === 'below' && panel.length) panel.after(cont);
        else if (ratings.length && !document.body.classList.contains('cardify-ratings-corner')) ratings.after(cont);
        else if (panel.length) panel.after(cont);
        else renderTarget.find('.full-start-new__title, .full-start__title').first().after(cont);
        cont.css({'margin-left':Lampa.Storage.get('uator_margin_left','0px'),'max-width':'100%','min-width':0});
        var movie = e.data.movie;
        var localSearch = movie.title || movie.name;
        var origSearch = movie.original_title || movie.original_name;
        
        Lampa.Parser.get({ search: localSearch, movie: movie, page: 1 }, function(res) {
            var data = (res && res.Results) ? getBestAndPopular(res.Results, movie) : { ukr: false };
            if (data.ukr) { 
                renderUator(cont, data); 
            } else if (origSearch && origSearch !== localSearch) {
                Lampa.Parser.get({ search: origSearch, movie: movie, page: 1 }, function(res2) {
                    var data2 = (res2 && res2.Results) ? getBestAndPopular(res2.Results, movie) : { ukr: false };
                    renderUator(cont, data2);
                }, function() { renderUator(cont, data); });
            } else {
                renderUator(cont, data);
            }
        }, function() { renderUator(cont, { ukr: false }); });
    }

    Lampa.Listener.follow('full', function(e) {
        if (e.type === 'complite' || e.type === 'ready') {
            // Tagline visibility is owned by the Card Fusion detail-card controller.
        }
        if (e.type === 'complite' || e.type === 'complete') {
            if (window.CardFusionYmod) window.CardFusionYmod.lastEvent = e;
            var render = e.object && e.object.activity ? e.object.activity.render() : null;
            if(render) {
                if (render.data('ymod_processed')) return;
                render.data('ymod_processed', true);
            }

            if (isEnabled('logo')) handleLogo(e);
            if (isEnabled('hybrid')) handleHybridTitle(e);
            if (isEnabled('uator')) handleUatorFull(e);
        }
    });

    function createSettings() {
        var MAIN_C = 'yariks_mod_main';
        Lampa.SettingsApi.addComponent({ component: 'ym_logo', name: 'Лого / Постер' });
        Lampa.SettingsApi.addComponent({ component: 'ym_title', name: 'Додаткова назва' });
        Lampa.SettingsApi.addComponent({ component: 'ym_buttons', name: 'Кнопки карток' });
        Lampa.SettingsApi.addComponent({ component: 'ym_uator', name: 'Uator' });

        function addStatic(comp, name, title, desc, onClick) {
            Lampa.SettingsApi.addParam({ component: comp, param: { name: name, type: "static" }, field: { name: title, description: desc }, onRender: function (item) { item.on("hover:enter", onClick); } });
        }
        function addToggle(comp, modName, title, desc) {
            Lampa.SettingsApi.addParam({ component: comp, param: { name: YMOD + 'enable_' + modName, type: "trigger", default: true }, field: { name: title, description: desc }, onChange: function(val) { Lampa.Storage.set(YMOD + 'enable_' + modName, val); updateBodyClasses(); } });
        }
        function addSelect(comp, name, title, desc, values, def, onChange) {
            Lampa.SettingsApi.addParam({ component: comp, param: { name: name, type: "select", values: values, default: def }, field: { name: title, description: desc }, onChange: onChange });
        }
        function backTo(comp, target) {
            addStatic(comp, comp+'_back', "Назад", "Повернутися", function() { Lampa.Settings.create(target); });
        }
        function clearCacheBtn(comp, title, prefix) {
            addStatic(comp, comp+'_clear', title, "Очистити кеш плагіну", function() {
                for (var i = 0; i < localStorage.length; i++) {
                    var key = localStorage.key(i);
                    if (key && key.indexOf(prefix) !== -1) { localStorage.removeItem(key); i--; }
                }
                Lampa.Noty.show("Кеш очищено. Перезавантаження...");
                setTimeout(function() { window.location.reload(); }, 1000);
            });
        }

        
        backTo('ym_logo', 'card_fusion_main');
        addToggle('ym_logo', 'logo', "Показувати графічний логотип", "Логотип із TMDB або постер");
        Lampa.SettingsApi.addParam({ component: 'ym_logo', param: { name: "logo_move", type: "trigger", default: false }, field: { name: "Перенести назву", description: "Перемістити назву в лівий верхній кут (гориз. екрани)" } });
        addSelect('ym_logo', "logo_glav", "Режим заміни", "", { 1: "Текст (вимкнути картинку)", 0: "Картинка (Лого/Постер)" }, "0");
        
        addSelect('ym_logo', "logo_type", "Що показувати?", "Логотип або постер фільму", { 
            "logo": "Логотип (текстовий дизайн)", 
            "poster_ua": "Вертикальний постер (UA -> EN)", 
            "poster_en": "Вертикальний постер (Тільки EN)",
            "backdrop_ua": "Горизонтальний постер (UA -> EN)",
            "backdrop_en": "Горизонтальний постер (Тільки EN)"
        }, "logo");
        
        addSelect('ym_logo', "logo_custom_text_size", "Розмір назви (текст)", "Якщо вибрано 'Текст'", extSizes, '3.0em');
        addSelect('ym_logo', "logo_lang", "Мова логотипа", "Пріоритет мови", { "": "Як у Lampa", en: "English", uk: "Українська" }, "uk");
        addSelect('ym_logo', "logo_size", "Якість TMDB", "", { w300: "w300", w500: "w500", w780: "w780", original: "Оригінал" }, "original");
        addSelect('ym_logo', "logo_custom_width", "Обмеження по ширині (vw)", "Відносно ширини екрану", imgWidths, "auto");
        addSelect('ym_logo', "logo_custom_height", "Обмеження по висоті (vh)", "Відносно висоти екрану", imgHeights, "auto");
        addSelect('ym_logo', "logo_margin_left", "Зсув ліворуч", "Зсув назви або лого", extMarginsLeft, "0px");
        clearCacheBtn('ym_logo', "Очистити кеш логотипів", "img_cache_v3_");

        backTo('ym_title', 'cf_titles');
        addSelect('ym_title', "hybrid_title_mode", "Режим відображення", "", { "smart": "Smart (EN якщо є лого, UA якщо немає)", "uk": "Завжди українська назва", "en": "Завжди англійська назва" }, "smart");
        addSelect('ym_title', "hybrid_title_size", "Розмір шрифту", "", { 'xs': 'Маленький (XS)', 's': 'Нижче середнього (S)', 'm': 'Середній (M)', 'l': 'Більше середнього (L)', 'xl': 'Великий (XL)', 'xxl': 'Дуже великий (XXL)', 'giant': 'Гігантський' }, "m");
        addSelect('ym_title', "hybrid_title_margin_left", "Зсув ліворуч", "", extMarginsLeft, "0px");
        clearCacheBtn('ym_title', "Очистити кеш назв", "title_cache_hybrid_v3");

        backTo('ym_buttons', 'card_fusion_main');
        addSelect('ym_buttons', "ym_button_style", "Стиль кнопок", "", { "normal": "Стандартний Lampa", "apple": "Apple Glass (Затемнений ефект)", "apple_lite": "Apple Glass Lite (Суцільний фон)" }, "normal", updateBodyClasses);
        addSelect('ym_buttons', "ym_button_size", "Розмір кнопок", "", extSizes, "1.0em", updateBodyClasses);
        addSelect('ym_buttons', "ym_button_margin_top", "Відступ зверху", "", extMargins, "1.0em", updateBodyClasses);

        backTo('ym_uator', 'card_fusion_main');
        addToggle('ym_uator', 'uator', "Показувати якість Uator", "Інформація про доступні українські роздачі");
        addSelect('ym_uator', "uator_style", "Стиль бейджів", "", { "normal": "Звичайний", "apple": "Apple Glass (Прозорий)", "apple_lite": "Apple Glass Lite (Темний)" }, "normal");
        addSelect('ym_uator', "uator_rating_size", "Розмір шрифту та іконок", "", extSizes, "1.1em");
        addSelect('ym_uator', "uator_gap", "Відстань між елементами", "", extGaps, "0.45em");
        addSelect('ym_uator', "uator_margin_left", "Зсув ліворуч", "", extMarginsLeft, "0px");
        addSelect('ym_uator', "uator_saturation", "Насиченість кольорів", "", { "0%": "Чорно-білі", "50%": "50%", "100%": "100% (Кольорові)" }, "100%");
    }

    window.CardFusionYmod = {
        refreshLogo: function () {
            var e = this.lastEvent;
            if (e && e.object && e.object.activity) handleLogo(e);
        },
        refreshHybrid: function () {
            var e=this.lastEvent;
            if(e&&e.data&&e.data.movie&&e.object&&e.object.activity) handleHybridTitle(e);
        },
        refreshUator: function () {
            var e=this.lastEvent;
            if(e&&e.object&&e.object.activity&&cfLastUator){
                var cont=$(e.object.activity.render()).find('.quality-badges-container').first();
                if(cont.length)renderUator(cont,cfLastUator);
            }
        },
        positionUator: function () {
            var e=this.lastEvent;
            if(!e||!e.object||!e.object.activity)return;
            var root=e.object.activity.render(),cont=$(root).find('.quality-badges-container').first();
            if(!cont.length)return;
            var info=$(root).find('.full-start-new__details,.full-start__details').first();
            var rating=$(root).find('.full-start-new__rate-line.rate-fix,.full-start__rate-line').first();
            var p=Lampa.Storage.get('cf_uator_position','standard');
            if(p==='above'&&info.length)info.before(cont);
            else if((p==='below'||document.body.classList.contains('cardify-ratings-corner'))&&info.length)info.after(cont);
            else if(rating.length)rating.after(cont);
            else if(info.length)info.after(cont);
        }
    };

    if (window.appready) createSettings();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') createSettings();
        });
    }
})();


/* ========= MDB RATINGS ========= */
/* 
 * author: '@bodya_elven' 
 */

(function() {
  'use strict';
  /*
  |==========================================================================
  | localStorage shim & Promise & Fetch Polyfills
  |==========================================================================
  */
  (function() {
    var ok = true;
    try {
      var t = '__lmp_test__';
      window.localStorage.setItem(t, '1');
      window.localStorage.removeItem(t);
    } catch (e) { ok = false; }
    if (!ok) {
      var mem = {};
      window.localStorage = {
        getItem: function(k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[mem[k]] : null; },
        setItem: function(k, v) { mem[k] = String(v); },
        removeItem: function(k) { delete mem[k]; },
        clear: function() { mem = {}; }
      };
    }
  })();

  (function(global) {
    if (global.Promise) return;
    var PENDING = 0, FULFILLED = 1, REJECTED = 2;
    function asap(fn) { setTimeout(fn, 0); }
    function MiniPromise(executor) {
      if (!(this instanceof MiniPromise)) return new MiniPromise(executor);
      var self = this; self._state = PENDING; self._value = void 0; self._handlers = [];
      function resolve(value) {
        if (self._state !== PENDING) return;
        if (value && (typeof value === 'object' || typeof value === 'function')) {
          var then;
          try { then = value.then; } catch (e) { return reject(e); }
          if (typeof then === 'function') return then.call(value, resolve, reject);
        }
        self._state = FULFILLED; self._value = value; finale();
      }
      function reject(reason) {
        if (self._state !== PENDING) return;
        self._state = REJECTED; self._value = reason; finale();
      }
      function finale() { asap(function() { var q = self._handlers; self._handlers = []; for (var i = 0; i < q.length; i++) handle(q[i]); }); }
      function handle(h) {
        if (self._state === PENDING) { self._handlers.push(h); return; }
        var cb = self._state === FULFILLED ? h.onFulfilled : h.onRejected;
        if (!cb) { (self._state === FULFILLED ? h.resolve : h.reject)(self._value); return; }
        try { var ret = cb(self._value); h.resolve(ret); } catch (e) { h.reject(e); }
      }
      this.then = function(onFulfilled, onRejected) {
        return new MiniPromise(function(resolve, reject) { handle({ onFulfilled: onFulfilled, onRejected: onRejected, resolve: resolve, reject: reject }); });
      };
      this.catch = function(onRejected) { return this.then(null, onRejected); };
      try { executor(resolve, reject); } catch (e) { reject(e); }
    }
    MiniPromise.resolve = function(v) { return new MiniPromise(function(res) { res(v); }); };
    MiniPromise.reject = function(r) { return new MiniPromise(function(_, rej) { rej(r); }); };
    global.Promise = MiniPromise;
  })(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));

  (function(global) {
    if (global.fetch) return;
    function Response(body, init) {
      this.status = init && init.status || 200;
      this.ok = this.status >= 200 && this.status < 300;
      this._body = body == null ? '' : String(body);
      this.headers = (init && init.headers) || {};
    }
    Response.prototype.json = function() {
      var self = this;
      return Promise.resolve().then(function() { return JSON.parse(self._body || 'null'); });
    };
    global.fetch = function(input, init) {
      init = init || {};
      var url = (typeof input === 'string') ? input : (input && input.url) || '';
      var method = (init.method || 'GET').toUpperCase();
      var headers = init.headers || {};
      if (global.Lampa && Lampa.Reguest) {
        return new Promise(function(resolve) {
          new Lampa.Reguest().native(url, function(data) {
            var text = (typeof data === 'string') ? data : (data != null ? JSON.stringify(data) : '');
            resolve(new Response(text, { status: 200, headers: headers }));
          }, function() { resolve(new Response('', { status: 500, headers: headers })); }, false, { dataType: 'text', method: method, headers: headers });
        });
      }
    };
  })(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));

  if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = function(callback, thisArg) {
      thisArg = thisArg || window;
      for (var i = 0; i < this.length; i++) callback.call(thisArg, this[i], i, this);
    };
  }

  /*
  |==========================================================================
  | КОНФІГУРАЦІЯ ТА ЗМІННІ
  |==========================================================================
  */
  var LMP_ENH_CONFIG = { apiKeys: { mdblist: '' } };

  var ICONS_BASE_URL = 'https://raw.githubusercontent.com/P1cas5o/lampa/main/assets/RatingsIcons/';
  var ICONS_BW_URL = 'https://raw.githubusercontent.com/P1cas5o/lampa/main/assets/RatingsIcons/bw/';
  var ICONS_WIDE_URL = 'https://raw.githubusercontent.com/P1cas5o/lampa/main/assets/RatingsIcons/wide/';

  var ICONS = {
    imdb: ICONS_BASE_URL + 'imdb.svg',
    tmdb: ICONS_BASE_URL + 'tmdb.svg',
    tmdb_poster: 'https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_1-5bdc75aaebeb75dc7ae79426ddd9be3b2be1e342510f8202baf6bffa71d7f5c4.svg',
    trakt: ICONS_BASE_URL + 'trakt.svg',
    letterboxd: ICONS_BASE_URL + 'letterboxd.svg',
    metacritic: ICONS_BASE_URL + 'metacritic.svg',
    rotten_good: ICONS_BASE_URL + 'rt.svg',
    rotten_bad: ICONS_BASE_URL + 'rt-bad.svg',
    popcorn: ICONS_BASE_URL + 'popcorn.svg',
    popcorn_bad: ICONS_BASE_URL + 'popcorn-bad.svg',
    mdblist: ICONS_BASE_URL + 'mdblist.svg',
    mal: ICONS_BASE_URL + 'mal.svg'
  };

  var ICONS_BW = {
    imdb: ICONS_BW_URL + 'imdb-bw.png',
    tmdb: ICONS_BW_URL + 'tmdb-bw.png',
    trakt: ICONS_BW_URL + 'trakt-bw.png',
    letterboxd: ICONS_BW_URL + 'letterboxd-bw.png',
    metacritic: ICONS_BW_URL + 'metacritic-bw.png',
    rotten_good: ICONS_BW_URL + 'rt-bw.png',
    rotten_bad: ICONS_BW_URL + 'rt-bad-bw.png',
    popcorn: ICONS_BW_URL + 'popcorn-bw.png',
    popcorn_bad: ICONS_BW_URL + 'popcorn-bad-bw.png',
    mdblist: ICONS_BW_URL + 'mdblist-bw.png',
    mal: ICONS_BW_URL + 'mal-bw.png'
  };

  var ICONS_WIDE = {
    imdb: ICONS_WIDE_URL + 'imdb-wide.webp',
    tmdb: ICONS_WIDE_URL + 'tmdb-wide.webp',
    trakt: ICONS_WIDE_URL + 'trakt-wide.webp',
    letterboxd: ICONS_WIDE_URL + 'letterboxd-wide.webp',
    metacritic: ICONS_WIDE_URL + 'metacritic-wide.webp',
    rotten_good: ICONS_WIDE_URL + 'rt-wide.webp',
    rotten_bad: ICONS_WIDE_URL + 'rt-bad-wide.webp',
    popcorn: ICONS_WIDE_URL + 'popcorn-wide.webp',
    mdblist: ICONS_WIDE_URL + 'mdblist-wide.webp',
    mal: ICONS_WIDE_URL + 'mal-wide.webp'
  };

var ICONS_WIDE_NB = {
    imdb: ICONS_WIDE_URL + 'imdb-wide-nb.webp',
    tmdb: ICONS_WIDE_URL + 'tmdb-wide-nb.webp',
    trakt: ICONS_WIDE_URL + 'trakt-wide-nb.webp',
    letterboxd: ICONS_WIDE_URL + 'letterboxd-wide-nb.webp',
    metacritic: ICONS_WIDE_URL + 'metacritic-wide-nb.webp',
    rotten_good: ICONS_WIDE_URL + 'rt-wide-nb.webp',
    rotten_bad: ICONS_WIDE_URL + 'rt-bad-wide-nb.webp',
    popcorn: ICONS_WIDE_URL + 'popcorn-wide-nb.webp',
    mdblist: ICONS_WIDE_URL + 'mdblist-wide-nb.webp',
    mal: ICONS_WIDE_URL + 'mal-wide-nb.webp'
};
  
  var pluginStyles = "<style>" +
    ":root{" +
    "  --lmp-logo-offset: 0px;" +
    "  --lmp-text-offset: 0px;" +
    "  --lmp-rate-spacing: 0px;" +
    "  --lmp-bg-opacity: 0;" +
    "}" +
    ".loading-dots-container { display: inline-flex; align-items: center; font-size: 0.85em; color: #ccc; padding: 0.6em 1em; border-radius: 0.5em; margin-right: 0.5em; margin-bottom: 0.4em; }" +
    ".loading-dots__text { margin-right: 1em; }" +
    ".loading-dots__dot { width: 0.5em; height: 0.5em; border-radius: 50%; background-color: currentColor; animation: loading-dots-bounce 1.4s infinite ease-in-out both; }" +
    ".loading-dots__dot:nth-child(1) { animation-delay: -0.32s; }" +
    ".loading-dots__dot:nth-child(2) { animation-delay: -0.16s; }" +
    "@keyframes loading-dots-bounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.6; } 40% { transform: translateY(-0.5em); opacity: 1; } }" +
    
    ".lmp-custom-rate { display: inline-flex !important; align-items: center; justify-content: center; gap: 0.3em; padding: 0.2em 0.4em; border-radius: 0.4em; transition: background 0.2s, border 0.2s, box-shadow 0.2s; margin-right: calc(0.25em + var(--lmp-rate-spacing)) !important; margin-bottom: calc(0.2em + (var(--lmp-rate-spacing) / 2)) !important; border: 1px solid transparent; background: rgba(0, 0, 0, var(--lmp-bg-opacity)); }" +
    ".lmp-custom-rate .source--name { display: flex !important; align-items: center; justify-content: center; margin: 0; position: relative; height: calc(22px + var(--lmp-logo-offset)); width: auto; }" +
    ".lmp-custom-rate .source--name img { display: block !important; position: relative; z-index: 1; object-fit: contain; height: 100% !important; filter: drop-shadow(0px 0px 4px rgba(0,0,0,0.8)); }" +
    
    ".lmp-custom-rate .rate--text-block { display: flex; align-items: baseline; text-shadow: 0 0 5px rgba(0,0,0,1), 0 0 2px rgba(0,0,0,0.8); z-index: 1; }" +
    ".lmp-custom-rate .rate--value { font-weight: bold; line-height: 1; font-size: calc(1.1em + var(--lmp-text-offset)); transition: color 0.2s; }" +
    ".lmp-custom-rate .rate--votes { font-size: calc(0.6em + (var(--lmp-text-offset) / 2)); opacity: 0.8; margin-left: 0.25em; line-height: 1; }" +
    
    ".lmp-dir-right { flex-direction: row-reverse; }" +
    ".lmp-dir-left { flex-direction: row; }" +
    ".lmp-dir-top { flex-direction: column-reverse; }" +
    ".lmp-dir-bottom { flex-direction: column; }" +
    ".lmp-dir-top .rate--text-block { flex-direction: column-reverse; align-items: center; }" +
    ".lmp-dir-bottom .rate--text-block { flex-direction: column; align-items: center; }" +
    ".lmp-dir-top .rate--votes, .lmp-dir-bottom .rate--votes { margin-left: 0; margin-top: 0.15em; margin-bottom: 0.15em; line-height: 0.8; }" +
    
    ".lmp-color-green { color: #2ecc71 !important; }" +
    ".lmp-color-blue { color: #60a5fa !important; }" +
    ".lmp-color-orange { color: #f59e0b !important; }" +
    ".lmp-color-red { color: #ef4444 !important; }" +
    
    "body.lmp-enh--rate-border .lmp-custom-rate { border-color: rgba(255, 255, 255, 0.3); }" +
    "body.lmp-enh--glow .lmp-glow-green { border-color: rgba(46,204,113,0.6) !important; box-shadow: 0 0 8px rgba(46,204,113,0.4) !important; }" +
    "body.lmp-enh--glow .lmp-glow-blue { border-color: rgba(96,165,250,0.6) !important; box-shadow: 0 0 8px rgba(96,165,250,0.4) !important; }" +
    "body.lmp-enh--glow .lmp-glow-orange { border-color: rgba(245,158,11,0.6) !important; box-shadow: 0 0 8px rgba(245,158,11,0.4) !important; }" +
    "body.lmp-enh--glow .lmp-glow-red { border-color: rgba(239,68,68,0.6) !important; box-shadow: 0 0 8px rgba(239,68,68,0.4) !important; }" +
    
    ".menu-edit-list .selector { background: transparent !important; transition: background 0.2s ease; outline: none; border-radius: 6px; }" +
    ".menu-edit-list .selector.focus, .menu-edit-list .selector:hover { background: rgba(255, 255, 255, 0.15) !important; }" +
    
    ".omdb-custom-rate { position: absolute; right: 0.4em; bottom: 0.4em; background: rgba(0,0,0,0.75); color: #fff; padding: 0.2em 0.5em; border-radius: 1em; display: flex; align-items: center; z-index: 10; font-family: 'Segoe UI', sans-serif; font-size: 0.9em; line-height: 1; pointer-events: none; border: none; transition: box-shadow 0.2s; }" +
    ".omdb-custom-rate span { font-weight: bold; font-size: 1em; }" +
    ".omdb-custom-rate img { width: 1.2em; height: 1.2em; margin-left: 0.3em; object-fit: contain; filter: drop-shadow(0px 0px 2px rgba(0,0,0,0.5)); }" +
    
    "body.omdb-enh--glow .omdb-glow-green { box-shadow: 0 0 8px rgba(46,204,113,0.6) !important; }" +
    "body.omdb-enh--glow .omdb-glow-blue { box-shadow: 0 0 8px rgba(96,165,250,0.6) !important; }" +
    "body.omdb-enh--glow .omdb-glow-orange { box-shadow: 0 0 8px rgba(245,158,11,0.6) !important; }" +
    "body.omdb-enh--glow .omdb-glow-red { box-shadow: 0 0 8px rgba(239,68,68,0.6) !important; }" +
        /* CSS для динамічних кольорів */
    ".mdb-dynamic-color-wrapper { display: inline-block; position: relative; background-color: var(--mdb-icon-color, #ffffff); -webkit-mask-size: contain; -webkit-mask-repeat: no-repeat; -webkit-mask-position: center; width: 100%; height: 100%; transition: background-color 0.4s ease; }" +
    ".mdb-color-multiply .mdb-dynamic-color-wrapper { filter: drop-shadow(0px 0px 3px rgba(0,0,0,0.6)); }" +
    ".mdb-color-multiply .mdb-dynamic-icon { mix-blend-mode: multiply; filter: none; opacity: 1; display: block; width: 100%; height: 100%; }" +
    ".mdb-color-invert .mdb-dynamic-color-wrapper { filter: drop-shadow(0px 0px 3px rgba(255,255,255,0.4)); }" +
    ".mdb-color-invert .mdb-dynamic-icon { mix-blend-mode: screen; filter: invert(1); opacity: 1; display: block; width: 100%; height: 100%; }" +
    "</style>";
  /*
  |==========================================================================
  | БАЗОВІ ФУНКЦІЇ ТА АПІ MDBLIST
  |==========================================================================
  */
  var RATING_CACHE_KEY = 'lmp_enh_rating_cache';

  var RCFG_DEFAULT = {
    ratings_mdblist_key: '',
    ratings_cache_days: '3',
    ratings_text_position: 'right',
    ratings_show_votes: true,
    ratings_logo_scale_val: 's_0', 
    ratings_text_scale_val: 's_0',
    ratings_spacing_val: 's_0',
    ratings_wide_logos: false,
    ratings_bw_logos: false,
    ratings_bg_opacity: 'v_0',
    ratings_colorize_all: true,
    ratings_rate_border: false,
    ratings_glow_border: false
  };

  var currentRatingsData = null;

  function getCardType(card) {
    var type = card.media_type || card.type;
    if (type === 'movie' || type === 'tv') return type;
    return card.name || card.original_name ? 'tv' : 'movie';
  }

  function iconImg(url, alt) {
    return '<img src="' + url + '" alt="' + (alt || '') + '">';
  }

  function getPrimaryRateLine(render){
    if (!render || !render.length) return $();
    var $nativeRate = render.find('.full-start__rate, .rate--imdb, .rate--tmdb, .rate--kp').first();
    if ($nativeRate.length && $nativeRate.parent().length) return $nativeRate.parent();

    var $left = $('.cardify__left .full-start-new__rate-line:not([data-lmp-fake]), .cardify__left .full-start__rate-line:not([data-lmp-fake])', render).first();
    if ($left.length) return $left;
    var $any = $('.full-start-new__rate-line:not([data-lmp-fake]), .full-start__rate-line:not([data-lmp-fake])', render).first();
    return $any;
  }

  function cleanupRtgInjected(render){
    if (!render || !render.length) return;
    var rateLine = getPrimaryRateLine(render);
    rateLine.find('.full-start__rate, .rate--imdb, .rate--tmdb, .rate--kp, .b-rating').not('.lmp-custom-rate').each(function () {
      var el = $(this);
      if (!el.data('cfNativeDisplaySaved')) {
        el.data('cfNativeDisplaySaved', true);
        el.data('cfNativeStyle', el.attr('style') || '');
      }
      el.hide();
    });
    rateLine.find('.lmp-custom-rate').remove(); 
  }

  function lmpToast(msg) {
    try {
      if (Lampa && typeof Lampa.Noty === 'function') return Lampa.Noty(msg);
      if (Lampa && Lampa.Noty && Lampa.Noty.show) return Lampa.Noty.show(msg);
    } catch (e) {}
  }

  function lmpRatingsClearCache() {
    Lampa.Storage.set(RATING_CACHE_KEY, {});
    lmpToast('Кеш рейтингів успішно очищено');
  }

  function fetchMdbListRatings(card, callback) {
    var rawKeys = LMP_ENH_CONFIG.apiKeys.mdblist;
    var keys = rawKeys.split(',').map(function(k) { return k.trim(); }).filter(Boolean);
    
    if (keys.length === 0) return callback(null);

    var currentKeyIndex = 0;

    function makeRequest() {
      var key = keys[currentKeyIndex];
      var typeSegment = (card.type === 'tv') ? 'show' : card.type;
      var url = 'https://api.mdblist.com/tmdb/' + typeSegment + '/' + card.id + '?apikey=' + encodeURIComponent(key);

      var network = new Lampa.Reguest();
      network.silent(url, function(response) {
        if (response) {
          handleSuccess(response);
        } else {
          tryNextKey();
        }
      }, function(error) {
        tryNextKey();
      });
    }

    function tryNextKey() {
      currentKeyIndex++;
      if (currentKeyIndex < keys.length) {
        makeRequest();
      } else {
        callback(null);
      }
    }

    function handleSuccess(response) {
      var res = {
        mdblist: null, imdb: null, tmdb: null, trakt: null,
        letterboxd: null, metacritic: null,
        rottentomatoes: null, popcorn: null, mal: null
      };

      var mdbScore = response.score;
      if (mdbScore) {
          var normMdb = parseFloat(mdbScore);
          if (normMdb > 10) normMdb = normMdb / 10;
          res.mdblist = {
              display: normMdb.toFixed(1),
              avg: normMdb,
              votes: response.score_votes || 0,
              fresh: normMdb >= 6.0
          };
      }

      if (!response.ratings || !response.ratings.length) {
          if (res.mdblist) return callback(res);
          return callback(null);
      }

      response.ratings.forEach(function(r) {
        var src = (r.source || '').toLowerCase();
        var valText = String(r.value || '').replace(/[^0-9.]/g, '');
        var val = parseFloat(valText);
        if (isNaN(val)) return;
        
        var normalized = val;
        
        if (src === 'letterboxd') {
            normalized = val * 2; 
        } else if (val > 10) {
            normalized = val / 10; 
        }

        normalized = Math.max(0, Math.min(10, normalized));
        var displayVal = normalized.toFixed(1);

        var item = { display: displayVal, avg: normalized, votes: r.votes || 0, fresh: normalized >= 6.0 };

        if (src === 'imdb') res.imdb = item;
        else if (src === 'tmdb') res.tmdb = item;
        else if (src === 'trakt') res.trakt = item;
        else if (src === 'letterboxd') res.letterboxd = item;
        else if (src.indexOf('metacritic') !== -1 && src.indexOf('user') === -1) res.metacritic = item;
        else if (src.indexOf('rotten') !== -1 || src.indexOf('tomato') !== -1) res.rottentomatoes = item;
        else if (src.indexOf('popcorn') !== -1 || src.indexOf('audience') !== -1) res.popcorn = item;
        else if (src.indexOf('myanimelist') !== -1 || src === 'mal') res.mal = item;
      });

      callback(res);
    }

    makeRequest();
  }

  function formatVotes(num) {
    if (!num) return '';
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return num.toString();
  }

  function insertRatings(data, targetRender) {
    if (!Lampa.Storage.get('cf_ratings_enabled', true)) return;
    var active = Lampa.Activity.active();
    if (!active || !active.activity) return;
    var render = targetRender || active.activity.render();
    if (!render) return;

    var rateLine = getPrimaryRateLine(render);
    if (!rateLine.length) return;
    
    rateLine.css({'flex-wrap': 'wrap', 'align-items': 'center'});
    cleanupRtgInjected(render);

    var cfg = getCfg();
    var elementsToInsert = [];

    var useWide = cfg.wideLogos;

    // Беремо стан нового перемикача рамок
    var useWideBorder = Lampa.Storage.get('ratings_wide_border', false);

    cfg.sourcesConfig.forEach(function(src) {
      if (!src.enabled || !data[src.id]) return;
      var itemData = data[src.id];

      var iconUrl;
      
      if (useWide) {
          if (useWideBorder) {
              // --- ОПЦІЯ: Широкі логотипи З РАМКОЮ ---
              // Якщо увімкнено рамки, беремо звичайний словник ICONS_WIDE і суфікс -wide.webp
              iconUrl = ICONS_WIDE[src.id] || (ICONS_WIDE_URL + src.id + '-wide.webp');
              if (src.id === 'rottentomatoes') {
                  iconUrl = itemData.fresh ? ICONS_WIDE.rotten_good : ICONS_WIDE.rotten_bad;
              } else if (src.id === 'popcorn') {
                  iconUrl = ICONS_WIDE.popcorn; 
              }
          } else {
              // --- БАЗА: Широкі логотипи БЕЗ РАМКИ ---
              // За замовчуванням беремо словник ICONS_WIDE_NB і суфікс -wide-nb.webp
              iconUrl = ICONS_WIDE_NB[src.id] || (ICONS_WIDE_URL + src.id + '-wide-nb.webp');
              if (src.id === 'rottentomatoes') {
                  iconUrl = itemData.fresh ? ICONS_WIDE_NB.rotten_good : ICONS_WIDE_NB.rotten_bad;
              } else if (src.id === 'popcorn') {
                  iconUrl = ICONS_WIDE_NB.popcorn; 
              }
          }
      } else {
          // --- ЛОГІКА ДЛЯ КВАДРАТНИХ ІКОНОК (без змін) ---
          iconUrl = (cfg.bwLogos && ICONS_BW[src.id]) ? ICONS_BW[src.id] : ICONS[src.id];
          if (src.id === 'rottentomatoes') {
              iconUrl = cfg.bwLogos ? (itemData.fresh ? ICONS_BW.rotten_good : ICONS_BW.rotten_bad) 
                                    : (itemData.fresh ? ICONS.rotten_good : ICONS.rotten_bad);
          } else if (src.id === 'popcorn' && itemData.avg < 6) {
              iconUrl = cfg.bwLogos ? ICONS_BW.popcorn_bad : ICONS.popcorn_bad;
          }
      }


      var colorClass = '';
      var glowClass = '';
      
      if (itemData.avg >= 7.5) { colorClass = 'lmp-color-green'; glowClass = 'lmp-glow-green'; }
      else if (itemData.avg >= 6.0) { colorClass = 'lmp-color-blue'; glowClass = 'lmp-glow-blue'; }
      else if (itemData.avg >= 4.0) { colorClass = 'lmp-color-orange'; glowClass = 'lmp-glow-orange'; }
      else { colorClass = 'lmp-color-red'; glowClass = 'lmp-glow-red'; }
      
      if (!cfg.colorizeAll) colorClass = '';
      
      var votesHtml = (cfg.showVotes && itemData.votes) ? '<span class="rate--votes">' + formatVotes(itemData.votes) + '</span>' : '';
      
      var dirClass = '';
      if (cfg.textPosition === 'left') dirClass = 'lmp-dir-right';
      else if (cfg.textPosition === 'top') dirClass = 'lmp-dir-top';
      else if (cfg.textPosition === 'bottom') dirClass = 'lmp-dir-bottom';
      else dirClass = 'lmp-dir-left';

      var cont = $(
        '<div class="lmp-custom-rate lmp-rate-' + src.id + ' ' + dirClass + ' ' + glowClass + '">' +
            '<div class="source--name" title="' + src.name + '">' + 
                '<img src="' + iconUrl + '" alt="' + src.name + '">' + 
            '</div>' +
            '<div class="rate--text-block">' + 
                '<span class="rate--value ' + colorClass + '">' + itemData.display + '</span>' + 
                votesHtml + 
            '</div>' +
        '</div>'
      );
      
      elementsToInsert.push(cont);
    });

    if (elementsToInsert.length > 0) {
        rateLine.prepend(elementsToInsert);
    }
  }


  function fetchAdditionalRatings(card) {
    if (!Lampa.Storage.get('cf_ratings_enabled', true)) return;
    var active = Lampa.Activity.active();
    if (!active || !active.activity || !card || !card.id) return;
    var render = active.activity.render();
    var activeKey = getCardType(card) + '_' + card.id;
    function stillCurrent() {
      if (!Lampa.Storage.get('cf_ratings_enabled', true)) return false;
      var a = Lampa.Activity.active();
      var e = window.CardFusionRatings && window.CardFusionRatings.lastEvent;
      if (!a || !a.activity || !e || !e.object || a.activity !== e.object.activity) return false;
      var m = e.data && e.data.movie;
      return !!m && getCardType(m) + '_' + m.id === activeKey;
    }
    if (!render) return;

    var cfg = getCfg();
    refreshConfigFromStorage();
    
    var normalizedCard = { id: card.id, type: getCardType(card) };
    var cacheKey = normalizedCard.type + '_' + normalizedCard.id;
    var cacheTimeMs = cfg.cacheDays * 24 * 60 * 60 * 1000;
    
    var cache = Lampa.Storage.get(RATING_CACHE_KEY) || {};
    var cachedItem = cache[cacheKey];
    
    if (cachedItem && (Date.now() - cachedItem.timestamp < cacheTimeMs) && cachedItem.data) {
      currentRatingsData = cachedItem.data;
      if (stillCurrent()) insertRatings(currentRatingsData, render);
      applyStylesToAll();
      $('#lmp-search-loader', render).remove();
      triggerDynamicColors(card);
      return;
    }

    var rateLine = getPrimaryRateLine(render);
    if (rateLine.length && !$('#lmp-search-loader', render).length) {
      rateLine.css({'flex-wrap': 'wrap', 'align-items': 'center'});
      rateLine.prepend('<div id="lmp-search-loader" class="loading-dots-container"><div class="loading-dots__text">MDBList...</div><div class="loading-dots__dot"></div><div class="loading-dots__dot"></div></div>');
    }

    fetchMdbListRatings(normalizedCard, function(res) {
      $('#lmp-search-loader', render).remove();

      if (res && stillCurrent()) {
        currentRatingsData = res;
        cache[cacheKey] = { timestamp: Date.now(), data: res };
        Lampa.Storage.set(RATING_CACHE_KEY, cache);
        
        if (res.imdb && res.imdb.display) {
            try {
                var omdbKey = 'omdb_ratings_cache';
                var omdbCache = JSON.parse(localStorage.getItem(omdbKey) || '{}');
                var ttlDays = parseInt(Lampa.Storage.get('omdb_cache_days', '7')) || 7;
                omdbCache[cacheKey] = {
                    rating: res.imdb.display,
                    timestamp: Date.now() + (ttlDays * 24 * 60 * 60 * 1000)
                };
                localStorage.setItem(omdbKey, JSON.stringify(omdbCache));
            } catch (e) {}
        }
        
        if (stillCurrent()) insertRatings(currentRatingsData, render);
        applyStylesToAll();
        triggerDynamicColors(card);
      }
    });
  }
  /*
  |==========================================================================
  | ЧАСТИНА 3: OMDb / TMDb ЛОГІКА (РЕАКТИВНИЙ СКАНЕР ПОСТЕРІВ)
  |==========================================================================
  */
  var OMDB_CACHE_KEY = 'omdb_ratings_cache';
  var ICON_IMDB_CARD = 'https://img.icons8.com/color/48/000000/imdb.png';
  var retryStates = {}; 

  function getOmdbCache() {
      var cache = localStorage.getItem(OMDB_CACHE_KEY);
      return cache ? JSON.parse(cache) : {};
  }

  function saveOmdbCache(id, rating) {
      var cache = getOmdbCache();
      var ttlDays = parseInt(Lampa.Storage.get('omdb_cache_days', '7'));
      if (isNaN(ttlDays) || ttlDays <= 0) ttlDays = 7; 
      
      cache[id] = {
          rating: rating,
          timestamp: Date.now() + (ttlDays * 24 * 60 * 60 * 1000)
      };
      localStorage.setItem(OMDB_CACHE_KEY, JSON.stringify(cache));
  }

  function getCachedOmdbRating(id) {
      var cache = getOmdbCache();
      if (cache[id]) {
          if (Date.now() < cache[id].timestamp) {
              return cache[id].rating;
          } else {
              delete cache[id];
              localStorage.setItem(OMDB_CACHE_KEY, JSON.stringify(cache));
          }
      }
      return null;
  }

  // Прибрали _1, щоб автоматично підхопився твій збережений ключ
  function getOmdbApiKey() {
      return (Lampa.Storage.get('omdb_api_key') || '').trim();
  }

  function getTmdbUrl(type, id) {
      var base = 'https://api.themoviedb.org/3/' + type + '/' + id + '/external_ids';
      var tmdbKey = Lampa.Storage ? Lampa.Storage.get('tmdb_api_key', '') : '';
      if (!tmdbKey || tmdbKey.trim() === '' || tmdbKey.trim() === 'c87a543116135a4120443155bf680876') {
          tmdbKey = '4ef0d7355d9ffb5151e987764708ce96';
      }
      return base + '?api_key=' + tmdbKey;
  }

  var omdbRequestQueue = [];
  var isOmdbRequesting = false;

  function setRetryState(ratingKey) {
      var state = retryStates[ratingKey] || { step: 0 };
      if (state.step === 0) {
          retryStates[ratingKey] = { step: 1, time: Date.now() + 60 * 1000 };
      } else if (state.step === 1) {
          retryStates[ratingKey] = { step: 2, time: Date.now() + 60 * 60 * 1000 };
      } else {
          saveOmdbCache(ratingKey, "N/A");
          delete retryStates[ratingKey];
      }
  }

  function processOmdbQueue() {
      if (isOmdbRequesting || omdbRequestQueue.length === 0) return;
      isOmdbRequesting = true;

      if (omdbRequestQueue.length > 20) {
          omdbRequestQueue = omdbRequestQueue.slice(-20);
      }

      var task = omdbRequestQueue.shift();
      var data = task.movie;
      var type = data.media_type || data.type || (data.name || data.original_name || data.seasons || data.first_air_date ? 'tv' : 'movie');
      var id = task.id;

      if (getCachedOmdbRating(task.ratingKey)) {
          isOmdbRequesting = false; processOmdbQueue(); return;
      }

      var tmdbReq = new Lampa.Reguest();
      tmdbReq.silent(getTmdbUrl(type, id), function (tmdbData) {
          try {
              var parsedTmdb = typeof tmdbData === 'string' ? JSON.parse(tmdbData) : tmdbData;
              var imdbId = parsedTmdb ? parsedTmdb.imdb_id : null;
              
              if (imdbId) {
                  var apiKey = getOmdbApiKey();
                  if (!apiKey) { isOmdbRequesting = false; setTimeout(processOmdbQueue, 100); return; }

                  var omdbUrl = 'https://www.omdbapi.com/?i=' + imdbId + '&apikey=' + apiKey;
                  var omdbReq = new Lampa.Reguest();

                  omdbReq.silent(omdbUrl, function (omdbData) {
                      try {
                          var res = typeof omdbData === 'string' ? JSON.parse(omdbData) : omdbData;
                          delete retryStates[task.ratingKey];
                          if (res.Response === "True" && res.imdbRating && res.imdbRating !== "N/A") {
                              saveOmdbCache(task.ratingKey, res.imdbRating);
                          } else if (res.Response === "False" && res.Error && res.Error.indexOf("limit") > -1) {
                              setRetryState(task.ratingKey);
                          } else { saveOmdbCache(task.ratingKey, "N/A"); }
                      } catch (e) { setRetryState(task.ratingKey); }
                      isOmdbRequesting = false; setTimeout(processOmdbQueue, 300);
                  }, function () {
                      setRetryState(task.ratingKey); isOmdbRequesting = false; setTimeout(processOmdbQueue, 300);
                  });
              } else { saveOmdbCache(task.ratingKey, "N/A"); isOmdbRequesting = false; setTimeout(processOmdbQueue, 100); }
          } catch (e) { setRetryState(task.ratingKey); isOmdbRequesting = false; setTimeout(processOmdbQueue, 300); }
      }, function () { setRetryState(task.ratingKey); isOmdbRequesting = false; setTimeout(processOmdbQueue, 300); });
  }

  /*
  |==========================================================================
  | ЧАСТИНА 4: НАЛАШТУВАННЯ ТА ІНІЦІАЛІЗАЦІЯ
  |==========================================================================
  */
  var DEFAULT_SOURCES_ORDER = [
    { id: 'mdblist', name: 'MDBList', enabled: true },
    { id: 'imdb', name: 'IMDb', enabled: true },
    { id: 'tmdb', name: 'TMDB', enabled: true },
    { id: 'trakt', name: 'Trakt', enabled: true },
    { id: 'letterboxd', name: 'Letterboxd', enabled: true },
    { id: 'rottentomatoes', name: 'Rotten Tomatoes', enabled: true },
    { id: 'popcorn', name: 'Popcornmeter', enabled: true },
    { id: 'metacritic', name: 'Metacritic', enabled: true },
    { id: 'mal', name: 'MyAnimeList', enabled: true }
  ];

  function getCfg() {
    var parseIntDef = function(key, def) { var v = parseInt(Lampa.Storage.get(key, def), 10); return isNaN(v) ? def : v; };
    var parseFloatDef = function(key, def) { var v = parseFloat(Lampa.Storage.get(key, def)); return isNaN(v) ? def : v; };
    
    var savedConfig = Lampa.Storage.get('ratings_sources_config', null);
    if (savedConfig && Array.isArray(savedConfig)) {
      savedConfig.forEach(function(s) {
        if (s.id === 'rt') s.id = 'rottentomatoes';
        if (s.id === 'mc') s.id = 'metacritic';
      });
      if (!savedConfig.find(function(s) { return s.id === 'mdblist'; })) savedConfig.push({ id: 'mdblist', name: 'MDBList', enabled: true });
      if (!savedConfig.find(function(s) { return s.id === 'mal'; })) savedConfig.push({ id: 'mal', name: 'MyAnimeList', enabled: true });
    } else {
      savedConfig = DEFAULT_SOURCES_ORDER;
    }

    var fullSourcesConfig = savedConfig.map(function(s) { return { id: s.id, name: s.name, enabled: s.enabled }; });
    var scaleMap = { 's_m3': -3, 's_m2': -2, 's_m1': -1, 's_0': 0, 's_p1': 1, 's_p2': 2, 's_p3': 3, 's_p4': 4 };
    
    var logoRaw = Lampa.Storage.get('ratings_logo_scale_val', 's_0');
    var textRaw = Lampa.Storage.get('ratings_text_scale_val', 's_0');
    var spaceRaw = Lampa.Storage.get('ratings_spacing_val', 's_0');
    
    var logoInput = scaleMap[logoRaw] !== undefined ? scaleMap[logoRaw] : (parseInt(logoRaw) || 0);
    var textInput = scaleMap[textRaw] !== undefined ? scaleMap[textRaw] : (parseInt(textRaw) || 0);
    var spaceInput = scaleMap[spaceRaw] !== undefined ? scaleMap[spaceRaw] : (parseInt(spaceRaw) || 0);

    var rawBgOpacity = String(Lampa.Storage.get('ratings_bg_opacity', 'v_0')).replace('v_', '');

    return {
      mdblistKey: Lampa.Storage.get('ratings_mdblist_key', ''),
      cacheDays: parseIntDef('ratings_cache_days', 3),
      textPosition: Lampa.Storage.get('ratings_text_position', 'right'),
      logoOffset: (logoInput * 2) + 'px',
      textOffset: (textInput * 2) + 'px',
      rateSpacing: ((spaceInput * 4) - 6) + 'px', 
      showVotes: !!Lampa.Storage.field('ratings_show_votes', true),
      wideLogos: !!Lampa.Storage.field('ratings_wide_logos', false),
      bwLogos: !!Lampa.Storage.field('ratings_bw_logos', false),
      bgOpacity: rawBgOpacity,
      colorizeAll: !!Lampa.Storage.field('ratings_colorize_all', true),
      rateBorder: !!Lampa.Storage.field('ratings_rate_border', false),
      glowBorder: !!Lampa.Storage.field('ratings_glow_border', false),
      sourcesConfig: fullSourcesConfig
    };
  }

  function refreshConfigFromStorage() {
    var cfg = getCfg();
    LMP_ENH_CONFIG.apiKeys.mdblist = cfg.mdblistKey || '';
    cfg.bwLogos ? document.body.classList.add('lmp-enh--mono') : document.body.classList.remove('lmp-enh--mono');
    return cfg;
  }

  function applyStylesToAll() {
    var cfg = getCfg();
    var s = document.documentElement.style;
    s.setProperty('--lmp-logo-offset', cfg.logoOffset);
    s.setProperty('--lmp-text-offset', cfg.textOffset);
    s.setProperty('--lmp-rate-spacing', cfg.rateSpacing);
    s.setProperty('--lmp-bg-opacity', cfg.bgOpacity);
    
    cfg.bwLogos ? document.body.classList.add('lmp-enh--mono') : document.body.classList.remove('lmp-enh--mono');
    cfg.rateBorder ? document.body.classList.add('lmp-enh--rate-border') : document.body.classList.remove('lmp-enh--rate-border');
    cfg.glowBorder ? document.body.classList.add('lmp-enh--glow') : document.body.classList.remove('lmp-enh--glow');
  }

  function openSourcesEditor() {
    var cfg = getCfg();
    var currentOrder = JSON.parse(JSON.stringify(cfg.sourcesConfig));
    var listContainer = $('<div class="menu-edit-list" style="padding-bottom:10px;"></div>');
    var svgUp = '<svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>';
    var svgDown = '<svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 2L11 11L20 2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>';
    var svgCheck = '<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1.89111" y="1.78369" width="21.793" height="21.793" rx="3.5" stroke="currentColor" stroke-width="3"/><path d="M7.44873 12.9658L10.8179 16.3349L18.1269 9.02588" stroke="currentColor" stroke-width="3" class="dot" stroke-linecap="round"/></svg>';

    function updateArrowsState() {
      var items = listContainer.find('.source-item');
      items.each(function(idx) {
        $(this).find('.move-up').css('opacity', idx === 0 ? '0.2' : '1');
        $(this).find('.move-down').css('opacity', idx === items.length - 1 ? '0.2' : '1');
      });
    }

    currentOrder.forEach(function(src) {
      var itemSort = $('<div class="source-item" data-id="' + src.id + '" style="display:flex; align-items:center; justify-content:space-between; padding:12px; border-bottom:1px solid rgba(255,255,255,0.1);">' +
          '<div class="source-name" style="font-size:16px; opacity: ' + (src.enabled ? '1' : '0.4') + ';">' + src.name + '</div>' +
          '<div style="display:flex; gap:10px; align-items:center;">' +
            '<div class="move-up selector" style="padding:6px 12px; border-radius:6px;">' + svgUp + '</div>' +
            '<div class="move-down selector" style="padding:6px 12px; border-radius:6px;">' + svgDown + '</div>' +
            '<div class="toggle selector" style="padding:4px; border-radius:6px; margin-left:8px;">' + svgCheck + '</div>' +
          '</div></div>');
      itemSort.find('.dot').attr('opacity', src.enabled ? 1 : 0);
      itemSort.find('.move-up').on('hover:enter', function() { var p = itemSort.prev(); if(p.length){ itemSort.insertBefore(p); updateArrowsState(); }});
      itemSort.find('.move-down').on('hover:enter', function() { var n = itemSort.next(); if(n.length){ itemSort.insertAfter(n); updateArrowsState(); }});
      itemSort.find('.toggle').on('hover:enter', function() { src.enabled = !src.enabled; itemSort.find('.source-name').css('opacity', src.enabled ? '1' : '0.4'); itemSort.find('.dot').attr('opacity', src.enabled ? 1 : 0); });
      listContainer.append(itemSort);
    });
    updateArrowsState();

    Lampa.Modal.open({ title: 'Сортування та видимість', html: listContainer, size: 'small', scroll_to_center: true, onBack: function() {
        var finalOrder = [];
        listContainer.find('.source-item').each(function() {
          var id = $(this).attr('data-id');
          var s = currentOrder.find(function(x) { return x.id === id; });
          if (s) finalOrder.push({ id: s.id, name: s.name, enabled: s.enabled });
        });
        Lampa.Storage.set('ratings_sources_config', finalOrder);
        Lampa.Modal.close(); Lampa.Controller.toggle('settings_component');
        setTimeout(function() { if (currentRatingsData) { insertRatings(currentRatingsData); applyStylesToAll(); } }, 150);
      }
    });
  }

  function addSettingsSection() {
    if (window.mdb_ratings_add_param_ready) return;
    window.mdb_ratings_add_param_ready = true;
    $('body').append('<style>div[data-component="omdb_ratings"] { display: none !important; }</style>');

    Lampa.SettingsApi.addComponent({ component: 'mdb_ratings', name: 'Рейтинги', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3l3.09 6.26L22 10.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 15.14l-5-4.87 6.91-1.01L12 3z" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round" stroke-linecap="round"/></svg>' });
    
    // Card Fusion: catalogue poster submenu excluded.

    Lampa.SettingsApi.addParam({ component: 'mdb_ratings', param: { name: 'ratings_mdblist_key', type: 'input', values: '', "default": '' }, field: { name: 'MDBList API key', description: '' } });
    Lampa.SettingsApi.addParam({ component: 'mdb_ratings', param: { type: 'button', name: 'lmp_edit_sources_btn' }, field: { name: 'Налаштувати джерела', description: 'Зміна порядку та видимості рейтингів' }, onChange: function() { openSourcesEditor(); } });

    Lampa.SettingsApi.addParam({ component: 'mdb_ratings', param: { name: 'ratings_text_position', type: 'select', values: { 'left': 'Зліва', 'right': 'Справа', 'top': 'Зверху', 'bottom': 'Знизу' }, "default": 'right' }, field: { name: 'Розташування оцінки', description: 'Розміщення оцінки відносно логотипу' } });
    Lampa.SettingsApi.addParam({ component: 'mdb_ratings', param: { name: 'ratings_show_votes', type: 'trigger', values: '', "default": true }, field: { name: 'Кількість голосів', description: 'Показувати кількість тих, хто поставив оцінку' } });

    Lampa.SettingsApi.addParam({ component: 'mdb_ratings', param: { name: 'ratings_logo_scale_val', type: 'select', values: { 's_m3': '-3', 's_m2': '-2', 's_m1': '-1', 's_0': '0', 's_p1': '1', 's_p2': '2', 's_p3': '3' }, "default": 's_0' }, field: { name: 'Розмір логотипів', description: '' } });
    Lampa.SettingsApi.addParam({ component: 'mdb_ratings', param: { name: 'ratings_text_scale_val', type: 'select', values: { 's_m2': '-2', 's_m1': '-1', 's_0': '0', 's_p1': '1', 's_p2': '2' }, "default": 's_0' }, field: { name: 'Розмір оцінки', description: '' } });
    Lampa.SettingsApi.addParam({ component: 'mdb_ratings', param: { name: 'ratings_spacing_val', type: 'select', values: { 's_m2': '-2', 's_m1': '-1', 's_0': '0', 's_p1': '1', 's_p2': '2' }, "default": 's_0' }, field: { name: 'Відступи між рейтингами', description: '' } });
    
    Lampa.SettingsApi.addParam({ 
        component: 'mdb_ratings', 
        param: { name: 'ratings_wide_logos', type: 'trigger', values: '', "default": false }, 
        field: { name: 'Широкі логотипи', description: '' },
        onChange: function(val) {
            if (val) {
                Lampa.Storage.set('ratings_bw_logos', false);
                Lampa.Storage.set('ratings_rate_border', false);
                Lampa.Storage.set('ratings_glow_border', false);
                $('.settings-param:contains("Білі логотипи")').find('.toggle').removeClass('active');
                $('.settings-param:contains("Рамка плиток рейтингів")').find('.toggle').removeClass('active');
                $('.settings-param:contains("Кольорове світіння рамки")').find('.toggle').removeClass('active');
            } else {
                // Якщо вимкнули Широкі логотипи, примусово вимикаємо і рамки
                Lampa.Storage.set('ratings_wide_border', false);
                $('.settings-param:contains("Рамки широких логотипів")').find('.toggle').removeClass('active');
            }
            updateMutualExclusions();
        }
    });

    Lampa.SettingsApi.addParam({ 
        component: 'mdb_ratings', 
        param: { name: 'ratings_wide_border', type: 'trigger', values: '', "default": false }, 
        field: { name: 'Рамки широких логотипів', description: '' },
        onChange: function() {
            updateMutualExclusions();
        }
    });


    Lampa.SettingsApi.addParam({ component: 'mdb_ratings', param: { name: 'ratings_bw_logos', type: 'trigger', values: '', "default": false }, field: { name: 'Білі логотипи', description: '' } });
    Lampa.SettingsApi.addParam({ component: 'mdb_ratings', param: { name: 'ratings_dynamic_colors', type: 'trigger', values: '', "default": false }, field: { name: 'Динамічний колір іконок', description: 'Перефарбовує іконки у домінантний колір логотипу. Працює з увімкненими білими та широкими іконками' } });
    Lampa.SettingsApi.addParam({ component: 'mdb_ratings', param: { name: 'ratings_colorize_all', type: 'trigger', values: '', "default": true }, field: { name: 'Кольорові оцінки рейтингів', description: '' } });
    Lampa.SettingsApi.addParam({ component: 'mdb_ratings', param: { name: 'ratings_bg_opacity', type: 'select', values: { 'v_0': '0%', 'v_0.1': '10%', 'v_0.2': '20%', 'v_0.3': '30%', 'v_0.4': '40%', 'v_0.5': '50%', 'v_0.6': '60%', 'v_0.8': '80%', 'v_1': '100%' }, "default": 'v_0' }, field: { name: 'Темний фон плитки', description: '' } });
    
    Lampa.SettingsApi.addParam({ 
        component: 'mdb_ratings', 
        param: { name: 'ratings_rate_border', type: 'trigger', values: '', "default": false }, 
        field: { name: 'Рамка плиток рейтингів', description: '' },
        onChange: function(val) {
            if (!val) {
                Lampa.Storage.set('ratings_glow_border', false);
                $('.settings-param:contains("Кольорове світіння рамки")').find('.toggle').removeClass('active');
                document.body.classList.remove('lmp-enh--glow');
                document.body.classList.remove('lmp-enh--rate-border');
            } else {
                document.body.classList.add('lmp-enh--rate-border');
            }
            updateMutualExclusions();
        }
    });
    
    Lampa.SettingsApi.addParam({ 
        component: 'mdb_ratings', 
        param: { name: 'ratings_glow_border', type: 'trigger', values: '', "default": false }, 
        field: { name: 'Кольорове світіння рамки', description: '' },
        onChange: function(val) {
            if (val && !Lampa.Storage.get('ratings_rate_border', false)) {
                Lampa.Storage.set('ratings_glow_border', false);
                setTimeout(function() {
                    $('.settings-param:contains("Кольорове світіння рамки")').find('.toggle').removeClass('active');
                }, 50);
            }
        }
    });

    function updateMutualExclusions() {
        var isWide = Lampa.Storage.get('ratings_wide_logos', false);
        var isBorder = Lampa.Storage.get('ratings_rate_border', false);
        
        var $bwItem = $('.settings-param:contains("Білі логотипи")');
        var $borderItem = $('.settings-param:contains("Рамка плиток рейтингів")');
        var $glowItem = $('.settings-param:contains("Кольорове світіння рамки")');
        // Шукаємо наш новий пункт
        var $wideBorderItem = $('.settings-param:contains("Рамки широких логотипів")');

        if (isWide) {
            $bwItem.css({ opacity: 0.5, 'pointer-events': 'none' });
            $borderItem.css({ opacity: 0.5, 'pointer-events': 'none' });
            $glowItem.css({ opacity: 0.5, 'pointer-events': 'none' });
            
            // Робимо активним перемикач рамок для широких лого
            $wideBorderItem.css({ opacity: 1, 'pointer-events': 'auto' });
        } else {
            $bwItem.css({ opacity: 1, 'pointer-events': 'auto' });
            $borderItem.css({ opacity: 1, 'pointer-events': 'auto' });
            
            // Блокуємо перемикач рамок, бо широкі лого вимкнені
            $wideBorderItem.css({ opacity: 0.5, 'pointer-events': 'none' });

            if (isBorder) {
                $glowItem.css({ opacity: 1, 'pointer-events': 'auto' });
            } else {
                $glowItem.css({ opacity: 0.5, 'pointer-events': 'none' });
            }
        }
    }

    
    Lampa.SettingsApi.addParam({ component: 'mdb_ratings', param: { name: 'ratings_cache_days', type: 'input', values: '', "default": '3' }, field: { name: 'Термін зберігання кешу (MDBList)', description: '' } });
    Lampa.SettingsApi.addParam({ component: 'mdb_ratings', param: { type: 'button', name: 'lmp_clear_cache_btn' }, field: { name: 'Очистити весь кеш рейтингів', description: '' }, onChange: function() { lmpRatingsClearCache(); } });


    Lampa.Listener.follow('settings', function(e) {
        if (e.name === 'main') {
            // МИТТЄВЕ ПЕРЕМІЩЕННЯ ПУНКТУ МЕНЮ
            var move = function() {
                var i = $('.settings-folder div[data-component="interface"]');
                var r = $('.settings-folder div[data-component="mdb_ratings"]');
                if (i.length && r.length) r.insertAfter(i);
            };
            move(); // Запускаємо відразу
            setTimeout(move, 10); // Страховка
        }
        if (e.type === 'create' && e.name === 'mdb_ratings') {
            updateMutualExclusions(); // Миттєве оновлення сірих пунктів
            setTimeout(updateMutualExclusions, 50); // Страховка
        }
    });
  }

  function initRatingsPluginUI() {
    addSettingsSection();
    var _set = Lampa.Storage.set;
    Lampa.Storage.set = function(k, v) {
      var out = _set.apply(this, arguments);
      if (typeof k === 'string' && k.indexOf('ratings_') === 0 && k !== 'ratings_sources_config') {
        setTimeout(function(){ if(currentRatingsData) insertRatings(currentRatingsData); applyStylesToAll(); }, 150);
      }
      return out;
    };
    applyStylesToAll();
  }

  function cleanOldCache() {
    var tenDaysMs = 10 * 24 * 60 * 60 * 1000;
    var now = Date.now();

    try {
      var mdbCache = Lampa.Storage.get(RATING_CACHE_KEY) || {};
      var mdbChanged = false;
      for (var key in mdbCache) {
        if (mdbCache.hasOwnProperty(key)) {
          if (now - mdbCache[key].timestamp > tenDaysMs) {
            delete mdbCache[key];
            mdbChanged = true;
          }
        }
      }
      if (mdbChanged) Lampa.Storage.set(RATING_CACHE_KEY, mdbCache);
    } catch (e) {}

    try {
      var omdbCacheStr = localStorage.getItem('omdb_ratings_cache');
      if (omdbCacheStr) {
        var omdbCache = JSON.parse(omdbCacheStr);
        var omdbChanged = false;
        for (var oKey in omdbCache) {
          if (omdbCache.hasOwnProperty(oKey)) {
            if (now - omdbCache[oKey].timestamp > tenDaysMs) {
              delete omdbCache[oKey];
              omdbChanged = true;
            }
          }
        }
        if (omdbChanged) localStorage.setItem('omdb_ratings_cache', JSON.stringify(omdbCache));
      }
    } catch (e) {}
  }

/* Очищення кешу кольорів логотипів */
function cleanLogoColorCache() {
    try {
        var cacheKey = 'mdb_logo_colors_cache';
        var cache = JSON.parse(localStorage.getItem(cacheKey) || '{}');
        var now = Date.now();
        var changed = false;
        var tenDaysMs = 10 * 24 * 60 * 60 * 1000;

        for (var key in cache) {
            if (now - cache[key].timestamp > tenDaysMs) {
                delete cache[key];
                changed = true;
            }
        }
        if (changed) localStorage.setItem(cacheKey, JSON.stringify(cache));
    } catch (e) {}
}

/* Синхронне отримання кольору з кешу */
function getCachedLogoColor(card) {
    var type = card.name ? 'tv' : 'movie';
    var id = card.id;
    var cacheKey = type + '_' + id;
    var storageKey = 'mdb_logo_colors_cache';
    try {
        var cache = JSON.parse(localStorage.getItem(storageKey) || '{}');
        if (cache[cacheKey] && cache[cacheKey].timestamp > Date.now()) {
            return cache[cacheKey].data;
        }
    } catch (e) {}
    return null;
}

/* Отримання домінантного кольору */
function fetchLogoColor(card, apiKey) {
    return new Promise(function(resolve) {
        var type = card.name ? 'tv' : 'movie';
        var id = card.id;
        var cacheKey = type + '_' + id;
        var storageKey = 'mdb_logo_colors_cache';

        var url = 'https://api.themoviedb.org/3/' + type + '/' + id + '/images?api_key=' + apiKey;
        
        var network = new Lampa.Reguest();
        network.silent(url, function(data) {
            if (!data || !data.logos || data.logos.length === 0) return resolve(null);

            var logo = data.logos.find(function(l) { return l.iso_639_1 === 'uk'; });
            if (!logo) logo = data.logos.find(function(l) { return l.iso_639_1 === 'en'; });
            if (!logo) logo = data.logos.find(function(l) { return l.iso_639_1 === null || l.iso_639_1 === ''; });
            if (!logo) logo = data.logos[0];

            if (!logo) return resolve(null);

            var img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = function() {
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                
                var imgData;
                try {
                    ctx.drawImage(img, 0, 0); 
                    imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                } catch (e) {
                    return resolve(null); 
                }

                var buckets = {};
                var totalPixels = 0;
                var wCount = 0, wR = 0, wG = 0, wB = 0;
                var bCount = 0, bR = 0, bG = 0, bB = 0;

                for (var i = 0; i < imgData.length; i += 16) {
                    var a = imgData[i + 3];
                    if (a < 50) continue; 

                    var r = imgData[i], g = imgData[i + 1], b = imgData[i + 2];
                    totalPixels++;

                    var isWhite = r > 230 && g > 230 && b > 230; 
                    var isBlack = r < 30 && g < 30 && b < 30;    

                    if (isWhite) { wCount++; wR += r; wG += g; wB += b; } 
                    else if (isBlack) { bCount++; bR += r; bG += g; bB += b; } 
                    else {
                        var step = 32;
                        var key = Math.floor(r / step) + ',' + Math.floor(g / step) + ',' + Math.floor(b / step);
                        if (!buckets[key]) buckets[key] = { count: 0, r: 0, g: 0, b: 0 };
                        buckets[key].count++; buckets[key].r += r; buckets[key].g += g; buckets[key].b += b;
                    }
                }

                if (totalPixels === 0) return resolve(null);

                var validBuckets = [];

                // ФАЗА 1: Шукаємо колір >= 10%
                for (var k in buckets) {
                    if ((buckets[k].count / totalPixels) * 100 >= 10) validBuckets.push(buckets[k]);
                }

                // ФАЗА 2: "План Б" (Шукаємо хоча б 3%)
                if (validBuckets.length === 0) {
                    var maxColorBkt = null;
                    for (var key in buckets) {
                        if (!maxColorBkt || buckets[key].count > maxColorBkt.count) maxColorBkt = buckets[key];
                    }
                    if (maxColorBkt && (maxColorBkt.count / totalPixels) * 100 >= 3) {
                        validBuckets.push(maxColorBkt);
                    }
                }

                // ФАЗА 3: Беремо білий або чорний
                if (validBuckets.length === 0) {
                    var wPercent = (wCount / totalPixels) * 100;
                    var bPercent = (bCount / totalPixels) * 100;

                    // Знизив поріг до 5%, щоб алгоритм ніколи не здавався
                    if (wPercent >= 5 || bPercent >= 5) {
                        if (wPercent > bPercent) validBuckets.push({ count: wCount, r: wR, g: wG, b: wB });
                        else validBuckets.push({ count: bCount, r: bR, g: bG, b: bB });
                    }
                }

                if (validBuckets.length === 0) return resolve(null);

                validBuckets.sort(function(a, b) { return b.count - a.count; });
                var best = validBuckets[0];

                var finalR = Math.floor(best.r / best.count);
                var finalG = Math.floor(best.g / best.count);
                var finalB = Math.floor(best.b / best.count);
                var brightness = (finalR * 299 + finalG * 587 + finalB * 114) / 1000;
                var colorData = { r: finalR, g: finalG, b: finalB, brightness: brightness };

                try {
                    var cache = JSON.parse(localStorage.getItem(storageKey) || '{}');
                    cache[cacheKey] = { data: colorData, timestamp: Date.now() + (10 * 24 * 60 * 60 * 1000) };
                    localStorage.setItem(storageKey, JSON.stringify(cache));
                } catch (e) {}
                
                resolve(colorData);
            };
            img.onerror = function() { resolve(null); };
            img.src = 'https://image.tmdb.org/t/p/w300' + logo.file_path;
        }, function() { 
            resolve(null); 
        });
    });
}


/* Застосування діагонального градієнта */
function applyDynamicColorToIcon($iconElement, colorData, isWide) {
    if (!colorData || !$iconElement.length || $iconElement.closest('.mdb-dynamic-color-wrapper').length || $iconElement.closest('.mdb-wide-color-wrapper').length) return;

    var r = colorData.r;
    var g = colorData.g;
    var b = colorData.b;
    
    var brightness = colorData.brightness;
    if (brightness === undefined) {
        brightness = (r * 299 + g * 587 + b * 114) / 1000;
    }

    // Захист від абсолютно чорного (якщо знайдено чорний логотип)
    if (brightness < 20) {
        r = 255; g = 255; b = 255;
        brightness = 255; 
    }

    var targetR, targetG, targetB;

    // Якщо колір в нижніх 50% (темний) -> цільовий колір на 25% світліший
    if (brightness <= 127) {
        targetR = Math.min(255, Math.floor(r + (255 - r) * 0.25));
        targetG = Math.min(255, Math.floor(g + (255 - g) * 0.25));
        targetB = Math.min(255, Math.floor(b + (255 - b) * 0.25));
    } 
    // Якщо колір у верхніх 50% (світлий) -> цільовий колір на 25% темніший
    else {
        targetR = Math.max(0, Math.floor(r * 0.75));
        targetG = Math.max(0, Math.floor(g * 0.75));
        targetB = Math.max(0, Math.floor(b * 0.75));
    }

    // Формуємо діагональний градієнт зліва-зверху вправо-вниз
    var backgroundStyle = 'linear-gradient(to bottom right, rgb(' + r + ',' + g + ',' + b + '), rgb(' + targetR + ',' + targetG + ',' + targetB + '))';

    var iconSrc = $iconElement.attr('src') || $iconElement.css('background-image').replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
    
    if (isWide) {
        // --- ЛОГІКА ДЛЯ ШИРОКИХ ЛОГО ---
        var $wideWrapper = $('<div class="mdb-wide-color-wrapper"></div>');
        $wideWrapper.css({
            'display': 'inline-block',
            'width': $iconElement.width() + 'px',
            'height': $iconElement.height() + 'px',
            'background': backgroundStyle,
            '-webkit-mask-image': 'url(' + iconSrc + ')',
            '-webkit-mask-size': 'contain',
            '-webkit-mask-repeat': 'no-repeat',
            '-webkit-mask-position': 'center',
            'opacity': '0', 
            'transition': 'opacity 0.4s ease'
        });

        $iconElement.css('opacity', '0'); 
        $iconElement.wrap($wideWrapper);

        setTimeout(function() {
            $iconElement.closest('.mdb-wide-color-wrapper').css('opacity', '1');
        }, 50);

    } else {
        // --- ЛОГІКА ДЛЯ КВАДРАТНИХ ІКОНОК ---
        var $maskWrapper = $('<div class="mdb-dynamic-color-wrapper"></div>');
        $maskWrapper.css({
            'display': 'inline-block',
            'width': $iconElement.width() + 'px',
            'height': $iconElement.height() + 'px',
            'background': backgroundStyle,
            '-webkit-mask-image': 'url(' + iconSrc + ')',
            '-webkit-mask-size': 'contain',
            '-webkit-mask-repeat': 'no-repeat',
            '-webkit-mask-position': 'center',
            'opacity': '0', 
            'transition': 'opacity 0.4s ease'
        });

        $iconElement.css('opacity', '0'); 
        $iconElement.wrap($maskWrapper);

        setTimeout(function() {
            $iconElement.closest('.mdb-dynamic-color-wrapper').css('opacity', '1');
        }, 50);
    }
}





  function triggerDynamicColors(card) {
    var isBwIconsEnabled = Lampa.Storage.get('ratings_bw_logos', false);
    var isWideLogosEnabled = Lampa.Storage.get('ratings_wide_logos', false);
    var isDynamicColorsEnabled = Lampa.Storage.get('ratings_dynamic_colors', false);

    if (!isDynamicColorsEnabled || (!isBwIconsEnabled && !isWideLogosEnabled)) return;

    // МИТТЄВО ХОВАЄМО ІКОНКИ ще до того, як Лампа їх покаже (щоб не було блимання)
    var $icons = $('.lmp-custom-rate .source--name img');
    $icons.css('opacity', '0');

    var tmdbApiKey = Lampa.Storage.get('tmdb_api_key', ''); 
    if (!tmdbApiKey || tmdbApiKey.trim() === '' || tmdbApiKey.trim() === 'c87a543116135a4120443155bf680876') {
        tmdbApiKey = '4ef0d7355d9ffb5151e987764708ce96';
    }

    setTimeout(function() {
        var cachedColor = getCachedLogoColor(card);
        
        if (cachedColor) {
            $icons.each(function() {
                applyDynamicColorToIcon($(this), cachedColor, isWideLogosEnabled);
            });
        } else {
            fetchLogoColor(card, tmdbApiKey).then(function(colorData) {
                if (colorData) {
                    $icons.each(function() {
                        applyDynamicColorToIcon($(this), colorData, isWideLogosEnabled);
                    });
                } else {
                    // Якщо кольору немає (напр. логотип не знайдено), плавно повертаємо оригінали
                    $icons.css({
                        'transition': 'opacity 0.4s ease',
                        'opacity': '1'
                    });
                }
            });
        }
    }, 400); 
}

  function startPlugin() {
    window.combined_ratings_plugin = true;
    cleanOldCache(); 
    cleanLogoColorCache(); // Чистимо кеш кольорів при старті
    
    Lampa.Listener.follow('full', function(e) {
      if (e.type === 'complite') {
        window.CardFusionRatings.lastEvent = e;
        var card = e.data.movie || e.object || {};
        setTimeout(function() { 
            if (!Lampa.Storage.get('cf_ratings_enabled', true) || window.CardFusionRatings.lastEvent !== e) return;
            fetchAdditionalRatings(card);
            setTimeout(function() {
                if (currentRatingsData && currentRatingsData.imdb && currentRatingsData.imdb.display) {
                    var k = getCardType(card) + '_' + card.id; 
                    try {
                        var OM = 'omdb_ratings_cache', c = JSON.parse(localStorage.getItem(OM) || '{}'), t = parseInt(Lampa.Storage.get('omdb_cache_days', '7')) || 7;
                        c[k] = { rating: currentRatingsData.imdb.display, timestamp: Date.now() + (t * 24 * 60 * 60 * 1000) };
                        localStorage.setItem(OM, JSON.stringify(c));
                    } catch (err) {}
                }
            }, 1000); 
        }, 500);
      }
    });
    // Card Fusion: catalogue/poster rating worker intentionally not started.
  }

  window.CardFusionRatings = {
    lastEvent: null,
    refresh: function () {
      if (this.lastEvent && this.lastEvent.data && this.lastEvent.data.movie) {
        fetchAdditionalRatings(this.lastEvent.data.movie);
      }
    },
    restoreNative: function () {
      var active = Lampa.Activity.active();
      if (!active || !active.activity) return;
      var r = active.activity.render();
      r.find('.lmp-custom-rate, #lmp-search-loader').remove();
      r.find('.full-start__rate, .rate--imdb, .rate--tmdb, .rate--kp, .b-rating').each(function () {
        var el = $(this);
        if (el.data('cfNativeDisplaySaved')) {
          var original = el.data('cfNativeStyle') || '';
          if (original) el.attr('style',original);
          else el.removeAttr('style');
        }
      });
    }
  };
  $('body').append(pluginStyles);
  initRatingsPluginUI();
  refreshConfigFromStorage();
  if (!window.combined_ratings_plugin) startPlugin();
})();


/* ========= CARD FUSION: MENU, PICKER, DETAIL-CARD CONTROLLER ========= */
(function () {
 'use strict';
 var CF_VERSION = '1.1.0-beta.2';
 var pickOpen = false, lastPick = 0, pending = 0, active = null;
 var icon = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="3" width="15" height="16" rx="2"/><rect x="7" y="6" width="14" height="15" rx="2"/><path d="M10 12h8M14 8v8"/></svg>';
 var hidden = ['cardify','ym_logo','ym_title','ym_buttons','ym_uator','mdb_ratings','cf_info','cf_titles','cf_about','cf_order','ifx_margins'];
 var stylesheet = [
   hidden.map(function(k){return '.settings-folder[data-component="'+k+'"], .settings-folder div[data-component="'+k+'"]';}).join(',')+'{display:none!important}',
   '.button--cf-logo{padding:0 .8em!important;display:inline-flex!important;align-items:center;justify-content:center}',
   '.button--cf-logo svg{width:1.3em!important;height:1.3em!important;margin:0!important}',
   '.cf-logo-picker{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.65em;padding:.6em;max-height:70vh;overflow:auto}',
   '.cf-logo-choice{display:flex;flex-direction:column;gap:.4em;align-items:center;justify-content:center;padding:.7em;border:1px solid rgba(255,255,255,.2);border-radius:.7em;min-height:5.5em}',
   '.cf-logo-choice.focus,.cf-logo-choice:hover{border-color:#fff;background:rgba(255,255,255,.13)}',
   '.cf-logo-choice img{max-width:100%;height:4em;object-fit:contain}',
   '.cf-logo-choice small{font-size:.7em;opacity:.75}',
   '.cf-title-apple,.cf-title-lite,.cf-title-info{padding:.2em .5em;max-width:100%;width:max-content;box-sizing:border-box;border-radius:.5em;flex-wrap:wrap}',
   '.cf-title-apple{background:rgba(22,24,30,.28);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.16)}',
   '.cf-title-lite{background:rgba(30,32,40,.95);border:1px solid rgba(255,255,255,.12)}',
   '.cf-title-info{background:rgba(52,152,219,.65)}',
   '.cf-info-compact{width:100%;max-width:100%;gap:0!important}',
   '.cf-info-compact>div{display:flex!important;flex-wrap:wrap!important;max-width:100%}',
   '.full-start-new .cf-hide-tagline,.full-start .cf-hide-tagline{display:none!important}',
   '.full-start-new.cf-hide-tagline .full-start-new__tagline,.full-start-new.cf-hide-tagline .full-start__tagline,.full-start.cf-hide-tagline .full-start__tagline{display:none!important}',
   '.full-start-new .cf-tagline-apple,.full-start .cf-tagline-apple{display:inline-block;max-width:100%;padding:.3em .65em;border-radius:.5em;background:rgba(22,24,30,.28);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.16)}',
   '.full-start-new .cf-tagline-lite,.full-start .cf-tagline-lite{display:inline-block;max-width:100%;padding:.3em .65em;border-radius:.5em;background:rgba(30,32,40,.94);border:1px solid rgba(255,255,255,.12)}',
   '.full-start-new .cf-tagline-mono,.full-start .cf-tagline-mono{display:inline-block;max-width:100%;padding:.3em .65em;border-radius:.5em;background:rgba(255,255,255,.10);color:#eee}',
   '.full-start-new .cf-tagline-info,.full-start .cf-tagline-info{display:inline-block;max-width:100%;padding:.3em .65em;border-radius:.5em;background:rgba(52,152,219,.65);color:#fff}',
   '.plugin-hybrid-title.cf-title-below-logo{margin-top:0!important;margin-bottom:.3em!important}',
   '.cf-title-below-logo .plugin-hybrid-title__body{display:flex;flex-wrap:wrap;align-items:baseline}',
   '.cf-year-country{display:inline-block;margin-left:6px;color:rgba(255,255,255,.55)}',
   '.cf-year-country.cf-meta-styled{border:1px solid rgba(255,255,255,.28);background:rgba(30,32,40,.6);border-radius:.3em;padding:.1em .4em;color:#fff}',
   '.cf-info-aux{display:flex;gap:.3em;flex-wrap:wrap;align-items:center;margin:.2em 0}',
   '.cf-info-aux .cf-info-extra{color:#fff;border-radius:.3em;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.1);padding:.2em .6em;white-space:nowrap;font-size:inherit}',
   '.cf-info-aux.cf-aux-color .cf-info-extra{background:rgba(52,152,219,.8);border-color:transparent}',
   '.cf-info-aux.cf-aux-apple .cf-info-extra{background:rgba(22,24,30,.3);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-radius:999px}',
   '.cf-info-aux.cf-aux-lite .cf-info-extra{background:rgba(30,32,40,.98);border-radius:999px}',
   '.cf-info-extra.cf-native-meta{background:transparent!important;border:none!important;padding:0!important}',
   '.cf-title-mono{background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.35);border-radius:.5em}',
   '.cf-native-badge-style{border-radius:.3em!important;border:1px solid rgba(255,255,255,.3)!important;background:rgba(52,152,219,.7)!important;color:#fff!important}',
   '.cf-native-badge-mono{background:rgba(255,255,255,.10)!important}',
   '.cf-native-badge-apple{background:rgba(22,24,30,.28)!important;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-radius:999px!important}',
   '.cf-native-badge-lite{background:rgba(30,32,40,.95)!important;border-radius:999px!important}',
   '.cf-moved-native{display:none!important}',
   '.cf-hide-native{display:none!important}',
   '.quality-badges-container{max-width:100%;min-width:0;box-sizing:border-box}',
   '.quality-badges-container .qb-unified-block{display:flex;flex-wrap:wrap!important;max-width:100%;row-gap:.28em}',
   '.quality-badges-container.cf-uator-standalone{width:100%;margin-top:.15em;margin-bottom:.3em}',
   '.cf-synopsis-gradient{padding:.8em 1em!important;border-radius:.6em;background:linear-gradient(90deg,rgba(0,0,0,.38),rgba(0,0,0,.18),rgba(0,0,0,.0))}',
   '.cf-synopsis-lite{padding:.8em 1em!important;border-radius:.6em;background:rgba(26,29,34,.65);border:1px solid rgba(255,255,255,.12);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}',
   '@media(max-width:767px){.cf-logo-picker{grid-template-columns:repeat(2,minmax(0,1fr))}}'
 ].join('\n');
 function injectCSS(){if(!document.getElementById('card-fusion-extra-css')) $('<style id="card-fusion-extra-css"></style>').text(stylesheet).appendTo('head');}
 function get(k,def){return Lampa.Storage.get(k,def);}
 function on(k,def){var v=get(k,def);return v===true||v==='true'||(v!==false&&v!=='false'&&!!v);}
 function root(){try{if(active&&active.object&&active.object.activity)return $(active.object.activity.render());}catch(e){}return $('.full-start-new,.full-start').first();}
 function movieKey(m){return 'cf_logo_override_'+((m.name||m.first_air_date||m.media_type==='tv')?'tv':'movie')+'_'+m.id;}
 function schedule(){if(pending)clearTimeout(pending);pending=setTimeout(function(){pending=0;refresh();},85);}
 window.CardFusionRuntime={schedule:schedule,refresh:schedule};
 function activeMovie(){return active&&active.data&&active.data.movie;}
 function filePicker(movie){
   if(!movie||!movie.id||pickOpen||Date.now()-lastPick<900)return;
   pickOpen=true;
   var key=movieKey(movie),old=get(key,''),closed=false;
   var panel=$('<div class="cf-logo-picker"></div>'),loading=$('<div style="padding:1em">Завантаження логотипів TMDB…</div>');
   panel.append(loading);
   function close(file,doSave){
     if(closed)return;
     closed=true;pickOpen=false;lastPick=Date.now();
     if(doSave)Lampa.Storage.set(key,file);
     Lampa.Modal.close();
     if(doSave&&window.CardFusionYmod)window.CardFusionYmod.refreshLogo();
     if(Lampa.Controller&&Lampa.Controller.toggle)Lampa.Controller.toggle('full_start');
   }
   function choice(file,label){
     var cell=$('<div class="cf-logo-choice selector"></div>');
     if(file){var url=Lampa.TMDB.image('/t/p/w500'+file.replace(/\.svg$/i,'.png'));cell.append($('<img>').attr('src',url));}
     else cell.append('<div style="font-size:1.6em">↺</div>');
     cell.append($('<small></small>').text(label+(file===old?' ✓':'')));
     cell.on('hover:enter click',function(ev){if(ev){ev.preventDefault();ev.stopPropagation();}close(file,true);});
     panel.append(cell);
   }
   Lampa.Modal.open({title:'Вибір логотипа TMDB',html:panel,size:'large',onBack:function(){close('',false);}});
   var type=(movie.name||movie.first_air_date||movie.media_type==='tv')?'tv':'movie';
   var url=Lampa.TMDB.api(type+'/'+movie.id+'/images?api_key='+Lampa.TMDB.key());
   $.getJSON(url,function(data){
     if(closed)return;
     loading.remove();choice('','Автоматичний вибір');
     var logos=(data&&data.logos)||[];
     logos.sort(function(a,b){var p=function(x){return x.iso_639_1==='uk'?0:x.iso_639_1==='en'?1:x.iso_639_1==null?2:3;};return p(a)-p(b)||(b.vote_average||0)-(a.vote_average||0);});
     logos.forEach(function(x){if(x.file_path)choice(x.file_path,(x.iso_639_1||'без мови').toUpperCase());});
     if(!logos.length)panel.append('<div>На TMDB немає доступних логотипів.</div>');
   }).fail(function(){if(!closed)loading.text('Не вдалося отримати логотипи. Перевір мережу.');});
 }
 function insertPencil(){
   var r=root(),bar=r.find('.full-start-new__buttons,.full-start__buttons').first();
   if(!bar.length)return;
   if(!on('cf_logo_picker_enabled',false)){bar.find('.button--cf-logo').remove();return;}
   if(bar.find('.button--cf-logo').length)return;
   var m=activeMovie();if(!m)return;
   var pencil=$('<div class="full-start__button selector button--cf-logo" title="Вибір логотипа" aria-label="Вибір логотипа"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L9 17l-4 1 1-4z"/></svg><span style="display:none">Вибір логотипа</span></div>');
   pencil.on('hover:enter click',function(ev){if(ev){ev.preventDefault();ev.stopPropagation();}filePicker(m);});
   bar.append(pencil);
   // Refresh navigation for remotes when inserted after the original action bar.
   try {var c=Lampa.Controller.enabled();if(c&&c.name==='full_start'&&Lampa.Controller.collection)Lampa.Controller.collection(r.find('.selector'));}catch(e){}
 }
 var metaNames=['episodes','seasons','duration','next','genres','year','country','age','status'];
 var labels={episodes:'Серії',seasons:'Сезони',duration:'Тривалість',next:'Наступна серія',genres:'Жанри',year:'Рік',country:'Країна',age:'Віковий рейтинг',status:'Статус'};
 function ordered(){var arr=get('cf_info_order',metaNames.slice());if(!Array.isArray(arr))arr=metaNames.slice();return metaNames.filter(function(x){return arr.indexOf(x)>=0;}).sort(function(a,b){return arr.indexOf(a)-arr.indexOf(b);});}
 function refresh(){
   var r=root();if(!r.length)return;
   if(window.CardFusionInterface)window.CardFusionInterface.refresh();
   // Depending on asynchronous original module updates, apply again at card completion only.
   extras(r);
   insertPencil();
   if(window.CardFusionYmod)window.CardFusionYmod.positionUator();
   r.find('.quality-badges-container').toggleClass('cf-uator-standalone',get('cf_uator_position','standard')!=='standard' || document.body.classList.contains('cardify-ratings-corner'));
 }
 function extras(r){
   var info=r.find('.full-start-new__details,.full-start__details').first();
   var hybrid=r.find('.plugin-hybrid-title').first();
   var original=r.find('.full-start-new__title,.full-start__title').not('.ymod-moved-title').first();
   if(hybrid.length){
     hybrid.removeClass('cf-title-below-logo');
     var below=get('cf_title_position','standard')==='below';
     if(below&&original.length){original.after(hybrid);hybrid.addClass('cf-title-below-logo');}
     hybrid.css('text-align',below&&get('cf_title_align','left')==='center'?'center':'left');
     hybrid.find('.plugin-hybrid-title__body').css('justify-content',below&&get('cf_title_align','left')==='center'?'center':'flex-start');
     hybrid.find('.cf-secondary-title').css('margin-right',below?0:'');
     var titleStyle=get('cf_secondary_title_style','normal');
     if(titleStyle==='info'){
       var panelStyle=get('cf_info_style','legacy');
       titleStyle=panelStyle==='apple'?'apple':panelStyle==='apple_lite'?'lite':panelStyle==='mono'?'mono':'info';
     }
     // Style the secondary title itself, not its independent year/country metadata.
     hybrid.find('.plugin-hybrid-title__body').removeClass('cf-title-apple cf-title-lite cf-title-info cf-title-mono');
     hybrid.find('.cf-secondary-title')
       .removeClass('cf-title-apple cf-title-lite cf-title-info cf-title-mono')
       .addClass(titleStyle==='normal'?'':'cf-title-'+titleStyle);
     hybrid.find('.cf-secondary-title').css('text-transform',below?'uppercase':'none');
     hybrid.toggle(on('ymod_enable_hybrid',true));
     hybrid.find('.cf-secondary-metadata').remove();
     var metas=$('<span class="cf-secondary-metadata"></span>');
     var yr=hybrid.attr('data-cf-year')||'',cn=hybrid.attr('data-cf-country')||'';
     [{key:'year',value:yr},{key:'country',value:cn}].forEach(function(x){
       var placement=get('cf_'+x.key+'_position','original');
       if(x.value&&placement==='original' && get('cf_info_visible',{})[x.key]!==false && get('cf_info_visible',{})[x.key]!=='false'){
         var s=$('<span class="cf-year-country"></span>').text(x.value);
         if(on('cf_'+x.key+'_styled',false))s.addClass('cf-meta-styled');
         metas.append(s);
       }
     });
     hybrid.find('.plugin-hybrid-title__body').append(metas);
     if(below){var gap=get('cf_title_gap','standard');hybrid.css('margin-top',gap==='compact'?'0':gap==='spacious'?'.7em':'.25em');}
   }
   // Tagline is a separately styled detail-card element, independent of additional title.
   r.find('.full-start-new,.full-start').addBack('.full-start-new,.full-start').toggleClass('cf-hide-tagline',!on('cf_tagline_show',false));
   var tagStyle=get('cf_tagline_style','normal');
   r.find('.full-start-new__tagline,.full-start__tagline,.full--tagline').removeClass('cf-tagline-apple cf-tagline-lite cf-tagline-mono cf-tagline-info').addClass(tagStyle==='normal'?'':'cf-tagline-'+tagStyle);
   // Native age / status stay in their original DOM positions unless explicitly moved.
   var aux=r.find('.cf-info-aux').first();if(aux.length)aux.remove();
   if(info.length){
     var style=get('cf_info_style','legacy');
     var color=style==='color'||style==='legacy';
     aux=$('<div class="cf-info-aux"></div>');
     if(color)aux.addClass('cf-aux-color');else if(style==='apple')aux.addClass('cf-aux-apple');else if(style==='apple_lite')aux.addClass('cf-aux-lite');
     var entries=[];
     [{key:'year',value:hybrid.attr('data-cf-year')||''},{key:'country',value:hybrid.attr('data-cf-country')||''}].forEach(function(x){
       if(x.value&&get('cf_'+x.key+'_position','original')==='panel')entries.push({key:x.key,value:x.value});
     });
     [{key:'age',sel:'.full-start__pg,.full-start-new__pg'},{key:'status',sel:'.full-start__status,.full-start-new__status'}].forEach(function(x){
       var pos=get('cf_'+x.key+'_position','original');
       var el=r.find(x.sel).not('.cf-info-extra').first();
       if(!el.length)return;
       var visible=pos!=='hidden';
       // Retain Cardify compatibility: mirrored toggles (under main Cardify page).
       var cardifyFlag=get(x.key==='age'?'cardify_show_pg':'cardify_show_status',true);if(cardifyFlag===false||cardifyFlag==='false')visible=false;
       var shown=get('cf_info_visible',{});if(!shown||typeof shown!=='object')shown={};
       el.toggleClass('cf-moved-native',pos==='panel'||pos==='hidden'||shown[x.key]===false||shown[x.key]==='false');
       el.removeClass('cf-native-badge-style cf-native-badge-apple cf-native-badge-lite cf-native-badge-mono');
       if(pos==='original'&&on('cf_'+x.key+'_styled',true)){
         el.addClass('cf-native-badge-style');
         var activeStyle=get('cf_info_style','legacy');
         if(activeStyle==='apple')el.addClass('cf-native-badge-apple');
         if(activeStyle==='apple_lite')el.addClass('cf-native-badge-lite');
         if(activeStyle==='mono')el.addClass('cf-native-badge-mono');
       }
       if(pos==='panel'&&visible)entries.push({key:x.key,value:el.text().trim()});
     });
     var display=get('cf_info_visible',{});if(!display||typeof display!=='object')display={};
     ordered().forEach(function(k){
       entries.filter(function(x){return x.key===k&&x.value&&display[k]!==false&&display[k]!=='false';}).forEach(function(x){
         var badge=$('<span class="cf-info-extra"></span>').attr('data-cf-meta',x.key).text(x.value);
         if((x.key==='age'||x.key==='status')&&!on('cf_'+x.key+'_styled',true))badge.addClass('cf-native-meta');
         aux.append(badge);
       });
     });
     if(aux.children().length){
       var line=info.find('.cf-info-compact-line').first();
       if(line.length){
         line.append(aux.children());
         aux.remove();
         var all=line.children('[data-cf-meta]').detach(),groups={};
         all.each(function(){var key=$(this).attr('data-cf-meta');(groups[key]||(groups[key]=[])).push($(this));});
         ordered().forEach(function(key){(groups[key]||[]).forEach(function(el){line.append(el);});delete groups[key];});
         Object.keys(groups).forEach(function(key){groups[key].forEach(function(el){line.append(el);});});
       } else {
         var inside=info.children().first();if(inside.length)inside.append(aux);else info.append(aux);
       }
     }
   }
   // Right-side synopsis only; body synopsis is deliberately untouched.
   var summary=get('cf_synopsis_style','none');
   r.find('.full-descr__text').add($('.custom-ghost-main .full-descr__text')).each(function(){
     var el=$(this),onRight=el.closest('.cardify__right-box,.custom-ghost-main,.full-start-new__right').length>0 || el.closest('.full-descr').hasClass('custom-ghost-main');
     el.removeClass('cf-synopsis-gradient cf-synopsis-lite');
     if(onRight&&window.innerWidth>window.innerHeight&&summary!=='none')el.addClass('cf-synopsis-'+summary);
   });
 }
 // Root settings helpers. SettingsApi params are still stored in Lampa Storage so old values remain compatible.
 function component(id,title){Lampa.SettingsApi.addComponent({component:id,name:title,icon:icon});}
 function link(comp,key,name,desc,target){
   Lampa.SettingsApi.addParam({component:comp,param:{name:key,type:'static'},field:{name:name,description:desc||''},onRender:function(item){item.on('hover:enter',function(){Lampa.Settings.create(target);});}});
 }
 function select(comp,key,name,values,def,cb){
   Lampa.SettingsApi.addParam({component:comp,param:{name:key,type:'select',values:values,default:def},field:{name:name},onChange:function(v){Lampa.Storage.set(key,v);if(cb)cb(v);schedule();}});
 }
 function toggle(comp,key,name,def,cb){
   Lampa.SettingsApi.addParam({component:comp,param:{name:key,type:'trigger',default:def},field:{name:name},onChange:function(v){Lampa.Storage.set(key,v);if(cb)cb(v);schedule();}});
 }
 function button(comp,key,name,cb){
   Lampa.SettingsApi.addParam({component:comp,param:{name:key,type:'button'},field:{name:name},onChange:cb});
 }
 function visibility(key,v){var old=get('cf_info_visible',{});if(!old||typeof old!=='object')old={};old[key]=v;Lampa.Storage.set('cf_info_visible',old);}
 function setPlace(k,p){Lampa.Storage.set('cf_'+k+'_position',p);schedule();}
 function openOrderEditor(){
   var state=ordered();
   var visibility=get('cf_info_visible',{});if(!visibility||typeof visibility!=='object')visibility={};
   var shown={};metaNames.forEach(function(k){shown[k]=visibility[k]!==false&&visibility[k]!=='false';});
   var list=$('<div class="cf-order-editor"></div>').css({'padding-bottom':'1em'});
   var up='<svg width="24" height="18" viewBox="0 0 24 18" fill="none" stroke="currentColor" stroke-width="3"><path d="M3 15L12 5L21 15"/></svg>';
   var down='<svg width="24" height="18" viewBox="0 0 24 18" fill="none" stroke="currentColor" stroke-width="3"><path d="M3 3L12 13L21 3"/></svg>';
   function render(){
     list.empty();
     state.forEach(function(key,index){
       var row=$('<div class="cf-order-row"></div>').css({display:'flex',gap:'.4em',padding:'.5em .2em','align-items':'center','border-bottom':'1px solid rgba(255,255,255,.10)'});
       var name=$('<div></div>').text(labels[key]).css({flex:'1',opacity:shown[key]?1:.45});
       var u=$('<div class="selector" title="Вгору"></div>').html(up).css({padding:'.5em',opacity:index===0?.3:1});
       var d=$('<div class="selector" title="Вниз"></div>').html(down).css({padding:'.5em',opacity:index===state.length-1?.3:1});
       var t=$('<div class="selector" title="Показувати / приховати"></div>').text(shown[key]?'☑':'☐').css({padding:'.5em','font-size':'1.3em'});
       u.on('hover:enter click',function(ev){if(ev){ev.preventDefault();ev.stopPropagation();}if(index>0){state.splice(index,1);state.splice(index-1,0,key);render();}});
       d.on('hover:enter click',function(ev){if(ev){ev.preventDefault();ev.stopPropagation();}if(index<state.length-1){state.splice(index,1);state.splice(index+1,0,key);render();}});
       t.on('hover:enter click',function(ev){if(ev){ev.preventDefault();ev.stopPropagation();}shown[key]=!shown[key];render();});
       row.append(name,u,d,t);list.append(row);
     });
   }
   render();
   var closed=false;
   Lampa.Modal.open({title:'Порядок і видимість плашок',html:list,size:'medium',onBack:function(){
     if(closed)return;closed=true;
     var actual={};metaNames.forEach(function(k){actual[k]=shown[k];});
     Lampa.Storage.set('cf_info_visible',actual);
     Lampa.Storage.set('cf_info_order',state.slice());
     Lampa.Modal.close();
     if(Lampa.Controller&&Lampa.Controller.toggle)Lampa.Controller.toggle('settings_component');
     schedule();
   }});
 }
 function buildSettings(){
   if(window.CardFusionMenuReady)return;window.CardFusionMenuReady=true;
   injectCSS();
   component('card_fusion_main','Card Fusion');
   component('cf_info','Інформаційна панель');
   component('cf_titles','Додаткова назва та слоган');
   component('cf_about','Про Card Fusion');
   component('cf_order','Порядок плашок');
   link('card_fusion_main','cf_layout','Cardify','Фон, компонування картки, слайдшоу, рейтинг у куті','cardify');
   link('card_fusion_main','cf_logo','Логотип / Постер','Вигляд логотипа, ручний вибір, мова та масштаб','ym_logo');
   link('card_fusion_main','cf_title','Додаткова назва та слоган','Розташування, підкладки, слоган','cf_titles');
   link('card_fusion_main','cf_info_entry','Інформаційна панель','Компактний режим, плашки, рік, країна, статус','cf_info');
   link('card_fusion_main','cf_rating','Рейтинги','Рейтинги, джерела, порядок та іконки','mdb_ratings');
   link('card_fusion_main','cf_btn','Кнопки','Стиль і масштаб кнопок','ym_buttons');
   link('card_fusion_main','cf_uator','Uator / Якість','Місце, стиль, розмір значків','ym_uator');
   link('card_fusion_main','cf_about_entry','Про плагін',CF_VERSION,'cf_about');
   link('cf_about','cf_about_back','← Card Fusion','','card_fusion_main');
   link('cf_about','cf_version','Версія '+CF_VERSION,'Тестова збірка. Оригінальні чотири плагіни слід вимкнути.','card_fusion_main');
   // Logo menu: keep source sizing controls, replace obsolete saturation.
   select('ym_logo','cf_logo_style','Колір логотипа',{original:'Оригінальний TMDB',mono:'Біло-сірий'},'original');
   toggle('ym_logo','cf_logo_halo','Підсвічувати темні логотипи',true);
   toggle('ym_logo','cf_logo_picker_enabled','Показувати кнопку «Вибір логотипа»',false);
   // Titles, no duplicated source title.
   link('cf_titles','cf_title_back','← Card Fusion','','card_fusion_main');
   toggle('cf_titles','ymod_enable_hybrid','Показувати додаткову назву',true);
   link('cf_titles','cf_title_source','Мова, масштаб та зсув назви','','ym_title');
   select('cf_titles','cf_title_position','Положення додаткової назви',{standard:'Стандартне',below:'Під логотипом'},'standard');
   select('cf_titles','cf_title_align','Вирівнювання під логотипом',{left:'Ліворуч',center:'По центру'},'left');
   select('cf_titles','cf_title_gap','Відстань під логотипом',{compact:'Компактно',standard:'Стандартно',spacious:'Просторо'},'standard');
   select('cf_titles','cf_secondary_title_style','Підкладка додаткової назви',{normal:'Без підкладки',apple:'Apple Glass',lite:'Apple Lite',info:'Як інформаційна панель'},'normal');
   toggle('cf_titles','cf_tagline_show','Показувати слоган',false);
   select('cf_titles','cf_tagline_style','Оформлення слогану',{normal:'Штатне',mono:'Монохромне',info:'Як інформаційна панель',apple:'Apple Glass',lite:'Apple Lite'},'normal');
   // Info panel.
   link('cf_info','cf_info_back','← Card Fusion','','card_fusion_main');
   select('cf_info','cf_info_layout','Компонування',{native:'Штатна Lampa',original:'Original',compact:'Compact'},'original');
   select('cf_info','cf_info_style','Стиль плашок',{legacy:'Поточний стиль',color:'Кольоровий',mono:'Монохромний',apple:'Apple Glass',apple_lite:'Apple Lite'},'legacy');
   select('cf_info','cf_info_scale','Масштаб',{ '0.7':'70%','0.8':'80%','0.9':'90%','1':'100%','1.1':'110%','1.2':'120%','1.3':'130%'},'1');
   select('cf_info','cf_info_gap','Відстань між плашками',{'0em':'0','0.1em':'0.1em','0.2em':'0.2em','0.3em':'0.3em','0.4em':'0.4em','0.6em':'0.6em','0.8em':'0.8em'},'0.2em');
   button('cf_info','cf_margins','Відступи панелі',function(){Lampa.Settings.create('ifx_margins',{template:'settings_ifx_margins',onBack:function(){Lampa.Settings.create('cf_info');}});});
   link('cf_info','cf_order_entry','Порядок і видимість плашок','Показувати / приховувати, переставляти','cf_order');
   select('cf_info','cf_year_position','Рік: розташування',{original:'Звичайне',panel:'У панелі',hidden:'Приховати'},'original');
   toggle('cf_info','cf_year_styled','Рік: стиль інформаційної панелі',false);
   select('cf_info','cf_country_position','Країна: розташування',{original:'Звичайне',panel:'У панелі',hidden:'Приховати'},'original');
   toggle('cf_info','cf_country_styled','Країна: стиль інформаційної панелі',false);
   select('cf_info','cf_age_position','Віковий рейтинг: розташування',{original:'Звичайне',panel:'У панелі',hidden:'Приховати'},'original');
   toggle('cf_info','cf_age_styled','Віковий рейтинг: стиль панелі',true);
   select('cf_info','cf_status_position','Статус: розташування',{original:'Звичайне',panel:'У панелі',hidden:'Приховати'},'original');
   toggle('cf_info','cf_status_styled','Статус: стиль панелі',true);
   toggle('cf_info','cf_hide_genre_animation','Приховати жанр «Мультфільм»',false);
   // Source defaults/status visibility are preserved through Cardify's own menu.
   link('cf_order','cf_order_back','← Інформаційна панель','','cf_info');
   button('cf_order','cf_open_editor','Змінити порядок і видимість',openOrderEditor);
   button('cf_order','cf_order_reset','Відновити стандартний порядок',function(){Lampa.Storage.set('cf_info_order',metaNames.slice());schedule();Lampa.Noty.show('Стандартний порядок відновлено');});
   // Uator location is independent from rating area.
   select('ym_uator','cf_uator_position','Розташування Uator',{standard:'Стандартне',above:'Над інформаційною панеллю',below:'Під інформаційною панеллю'},'standard',function(){if(window.CardFusionYmod)window.CardFusionYmod.positionUator();});
   // Synopsis on right in Cardify.
   select('cardify','cf_synopsis_style','Підкладка опису праворуч',{none:'Без підкладки',gradient:'М’який градієнт',lite:'Apple Lite'},'none');
   // Primary rating module remains with existing source editing and cache.
   toggle('mdb_ratings','cf_ratings_enabled','Показувати рейтинги в картці',true,function(v){
     if(window.CardFusionRatings){if(v)window.CardFusionRatings.refresh();else window.CardFusionRatings.restoreNative();}
   });
 }
 function init(){
   buildSettings();
   Lampa.Listener.follow('full',function(e){
     if(e.type==='complite'||e.type==='complete'){
       active=e;
       setTimeout(schedule,220);
       setTimeout(schedule,550);
     }
   });
   // Live application of settings without reloading or re-fetching metadata.
   if(!window.__cf_storage_hook){
     window.__cf_storage_hook=true;
     var originalSet=Lampa.Storage.set;
     Lampa.Storage.set=function(key,val){
       var res=originalSet.apply(this,arguments);
       if(typeof key==='string' && (/^cf_/.test(key)||/^interface_mod_new_m[bt]$/.test(key)||/^hybrid_/.test(key)||/^ym_button_/.test(key)||/^logo_/.test(key)||/^uator_/.test(key)||/^ymod_enable_/.test(key)||/^cardify_ratings_position$/.test(key))){
         if(key==='cf_logo_style'||key==='cf_logo_halo'||/^logo_/.test(key)){
           if(window.CardFusionYmod)window.CardFusionYmod.refreshLogo();
         }
         if((/^hybrid_/.test(key)||key==='ymod_enable_hybrid')&&window.CardFusionYmod)window.CardFusionYmod.refreshHybrid();
         if(/^uator_/.test(key)&&window.CardFusionYmod&&window.CardFusionYmod.refreshUator)window.CardFusionYmod.refreshUator();
         if(/^ym_button_/.test(key)&&window.CardFusionYmod&&window.CardFusionYmod.refreshButtons)window.CardFusionYmod.refreshButtons();
         if(/^interface_mod_new_m[bt]$/.test(key)&&window.CardFusionInterface)window.CardFusionInterface.margins();
         schedule();
       }
       return res;
     };
   }
 }
 if(window.appready)init();else Lampa.Listener.follow('app',function(e){if(e.type==='ready')init();});
})();


} // End Card Fusion bundle guard

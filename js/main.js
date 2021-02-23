// (function() {
	
	var _root, CW, CH;
	var queue, preloader;
	var stats;
	
	function start(root, lib) {
		// console.log("[", canvas.width, "x", canvas.height, "]");
		Math.hypot = Math.hypot || function(x, y){ return Math.sqrt(x*x + y*y); }
		_root = root;
		CW = canvas.width;
		CH = canvas.height;
		
		// cui = window.cui = window.cui || {};
		// window.cui.lib = lib;
		// addStats();
		
		var bg = new createjs.Shape();
		bg.graphics.lf(["#9cf","#fff"], [0, 1], 0, 8, 0, 320).dr(0, 0, CW, CH).ef();
		_root.addChild(bg);
		
		preloader = newPreloader(400, 40, '#00c', '#00c');
		_root.addChild(preloader).set({x: (CW-400)/2, y: (CH-40)/2});
		// updatePreloader(.25);
		
		stage.enableMouseOver(15);
		stage.mouseMoveOutside = true; 
		
		createjs.Sound.initializeDefaultPlugins();
		queue = new createjs.LoadQueue();
		this.queue.installPlugin(createjs.Sound);
		
		queue.on("complete", addAssets);
        queue.on('progress', updatePreloader);
		//console.log("Progress:", queue.progress, event.progress);
		// queue.on("error", handleError);
		createjs.Sound.alternateExtensions = ["ogg"];
		
		queue.loadManifest([
			// {id:"boom",   src:"sounds/explosion.mp3"},
			{id:"plane",  src:"sounds/plane.mp3" },
			{id:"data",   src:"js/data.json"     },
			{id:"btnDn",  src:"images/btnDn.png" },
			{id:"btnUp",  src:"images/btnUp.png" },
			{id:"film",   src:"images/film.png"  },
			{id:"map",    src:"images/map.png"   },
			{id:"panel",  src:"images/panel.png" },
			{id:"pic",    src:"images/pic.png"   },
			{id:"pilot",  src:"images/pilot.png" },
			{id:"plane",  src:"images/plane.png" },
			{id:"plane2", src:"images/plane2.png"},
			{id:"title",  src:"images/title.png" }
		]);
	}
	
	var state, data, rndArr;
	var scene0, scene1;
	var button, btnText, btnGlow;

    function newPreloader(ww, hh, strokeColor, fillColor) 
	{
		var cont = new createjs.Container();
        var outline = new createjs.Shape();
        outline.graphics.s(strokeColor).dr(0, 0, ww, hh);
        cont.bar = new createjs.Shape();
		cont.bar.graphics.lf(["#00c","#fff", "#00c"], [0, .3, 1], 0, 0, 0, hh).dr(0, 0, ww, hh).ef();
        cont.bar.scaleX = 0;
        cont.addChild(cont.bar, outline);
		return cont;
    }

    function updatePreloader() {
        var perc = queue.progress > 1 ? 1 : queue.progress;
        preloader.bar.scaleX = perc;
    }

	function addAssets()
	{
		_root.removeChild(preloader); preloader = null;
		data = queue.getResult("data");
		// createjs.Sound.play("boom");
		// createjs.Sound.play("plane",0,0,0,10,.5);
		
		addScene0();
		addScene1();
		addScene2();
		addScene3();
		
		updateAll();
		
		var panel = new createjs.Bitmap(queue.getResult("panel"));
		_root.addChild(panel).set({y: CH - 41});
		
		var btnSheet = new createjs.SpriteSheet({
			images: [queue.getResult("btnUp"), queue.getResult("btnDn")],
			frames: {width: 139, height: 40},
			animations: { out: 0, over: 1, down: 1 }
		});
		button = new createjs.Sprite(btnSheet);
		var buttonHelper = new createjs.ButtonHelper(button);
		_root.addChild(button).set({x: 50, y: CH - 40});
		
		btnGlow = new createjs.Shape();
		btnGlow.graphics.s("#999").dc(0, 0, 20).es();
		_root.addChild(btnGlow).set({x: 70, y: CH - 20});
		
		btnText = new createjs.Text("СТАРТ", "18px Arial", "#999");
		_root.addChild(btnText).set({
			textAlign: "center",
			textBaseline: "middle",
			maxWidth: 80,
			x: 142,
			y: CH - 19,
			mouseEnabled: false
		});
		
        button.on("rollover", function () {
			btnText.set({ color: "#0c0" });
		});
        button.on("rollout",  function () {
			btnText.set({ color: "#999" });
		});
		button.on("click", buttonClick);
		
		state = 0;
	}
	
	function addInfo(ww, hh, cfg)
	{
		var cont = new createjs.Container(); cont.regX = ww/2;
		
		var bg = new createjs.Shape();
		bg.graphics.lf([cfg.f0,cfg.f1], [.1, .9], 0, 0, 0, hh).dr(0, 0, ww, hh).ef();
		bg.graphics.ss(2).s(cfg.s).dr(0, 0, ww, hh).es();
		cont.addChild(bg);
		
		var font = "" + (cfg.fs || 18) + "px " + (cfg.ff || "Courier");
		
		var t = new createjs.Text("t", font, "#000"); // "18px Courier"
		cont.addChild(t).set({x: cfg.dx, y: cfg.dy, lineWidth: (cfg.lw || ww-2*cfg.dx), lineHeight: 20});
		cont.txt = t;
		
		return cont;
	}
	
	function randomArray(n) {
		var i, a = [];
		for (i = 0; i < n; ++i) a.push(i);
		for (i = n; i; --i) {
			a.push(a.splice(Math.random() * i | 0, 1)[0]);
			// console.log('--', i, '->', a[n-1]);
		}
		// console.log("random Array:");
		// console.log(a);
		return a;
	}
	
	function updateAll()
	{
		rndArr = randomArray(10);
		var i, dot, task = data.texts[0] + "\n";
		
		for (i = 0; i < allDots.length; ++i) {
			allDots[i].mouseEnabled = true;
			allDots[i].visible = false;
		}
		
		for (i = 0; i < 5; ++i) {
			// console.log(i, rndArr[i], data.coord[rndArr[i]], data.tasks[rndArr[i]].substr(0, 12));
			task += "\n    " + data.tasks[rndArr[i]];
			allDots[rndArr[i]].visible = true;
			bars[i].setH(data.coord[rndArr[i]].h);
		}
		
		info1.txt.text = task;
		dots = [];
	}
	
	//=============================================================================================================
	//											SCENE # 0
	//=============================================================================================================
	
	var plane, planeM, dx = 0, planeW = 170, planeH = 170;
	function addScene0()
	{
		scene0 = new createjs.Container();
		_root.addChild(scene0);
		
		var pilot = new createjs.Bitmap(queue.getResult("pilot"));
		scene0.addChild(pilot).set({y: CH - 347});
		
		var title = new createjs.Bitmap(queue.getResult("title"));
		scene0.addChild(title).set({x: 75, y: 50});
		
		planeM = new createjs.Shape();
		// planeM.graphics.f("#000").dr(-CW-planeW, 0, CW, 300).ef();
		planeM.graphics.f("#000").dr(0, 0, CW + planeW, 300).ef();
		planeM.x = -planeW + dx;
		title.mask = planeM;
		// scene0.addChild(planeM); planeM.alpha = .5;
		
		plane = new createjs.Bitmap(queue.getResult("plane"));
		scene0.addChild(plane).set({
			regX: 170, regY: 170,
			x: -planeW, y: planeH
		});
		
	}
	
	//=============================================================================================================
	//											SCENE # 1
	//=============================================================================================================
	
	var info1;
	function addScene1()
	{
		scene1 = new createjs.Container(); scene1.visible = false;
		_root.addChild(scene1);
		
		info1 = addInfo(700, 550+40, {f0:"#fff", f1:"#edc", s:"#c99", dx:30, dy:20, fs:16});
		scene1.addChild(info1).set({x: 750/2, y: 50-40});
		
		// console.log(data, data.texts, data.tasks);
		
		// var task = data.texts[0] + "\n";
		// console.log("tasks:", rndArr);
		// for (var i = 0; i < 5; ++i) task += "\n    " + data.tasks[rndArr[i]];
		// info.txt.text = task;
	}
	
	//=============================================================================================================
	//											SCENE # 2
	//=============================================================================================================
	
	var tableInfo, plane2, dotPath, xA = 694, yA = 112;
	function addScene2()
	{
		scene2 = new createjs.Container(); scene2.visible = false;
		_root.addChild(scene2);
		
		var map = new createjs.Bitmap(queue.getResult("map"));
		scene2.addChild(map).set({regX:690/2, x: 750/2, y: 8});
		
		var info = addInfo(550, 75, {f0:"#fff", f1:"#edc", s:"#c99", dx:50, dy:16});
		scene2.addChild(info).set({x: 750/2, y: 530});
		info.txt.text = data.texts[1];
		
		dotPath = new createjs.Shape();
		scene2.addChild(dotPath);
		
		var t = new createjs.Text("Аэродром", "bold italic 16px Arial", "#00c");
		scene2.addChild(t).set({x: xA-60, y: yA-30});
		
		var dot = new createjs.Shape();
		dot.graphics.f("#00c").dc(0, 0, 10).ef().ss(2).s("#fff").dc(0, 0, 8).es();
		scene2.addChild(dot).set({x: xA, y: yA});
		
		var i, dot, dotCont = new createjs.Container();
		scene2.addChild(dotCont);
		for (i = 0; i < 10; ++i) { //nDots
			dotCont.addChild(addDot(i));
		}
		dots = [];
		
		plane2 = new createjs.Bitmap(queue.getResult("plane2"));
		scene2.addChild(plane2).set({
			regX: 34, regY: 34, x: xA, y: yA,
			visible:false
		});
		
		tableInfo = addInfo(700, 550, {f0:"#fff", f1:"#edc", s:"#c99", dx:100, dy:30, lw:350});
		tableInfo.visible = false;
		scene2.addChild(tableInfo).set({x: 750/2, y: 50});
		//lineWidth: ww-2*cfg.dx, lineHeight: 20
		tableInfo.txt.text = data.texts[2];
		
		var pic = new createjs.Bitmap(queue.getResult("pic"));
		tableInfo.addChild(pic).set({x: 350, y: 30});
		
		for (i = 0; i < 6; ++i) {
			tableInfo.addChild(addBar(i, 100, 180, {})).set({x: 25+(100+10)*i, y: 350});
		}
	}
	
	//=============================================================================================================
	//											SCENE # 3
	//=============================================================================================================
	
	var shots, film, info3, infoShot;
	function addScene3()
	{
		scene3 = new createjs.Container(); scene3.visible = false;
		_root.addChild(scene3);
		
		info3 = addInfo(700, 550, {f0:"#fff", f1:"#edc", s:"#c99", dx:30, dy:20});
		scene3.addChild(info3).set({x: 750/2, y: 50, visible: false}); 
		// info3.txt.text = data.results[0] + "\n\n" + data.texts[3];
		
		infoShot = addInfo(700, 550, {f0:"#fff", f1:"#edc", s:"#c99", dx:30, dy:350});
		scene3.addChild(infoShot).set({x: 750/2, y: 50, visible: false}); 
		// infoShot.txt.text = data.results[0] + "\n\n" + data.texts[3];
		
		film = new createjs.Bitmap(queue.getResult("film"));
		scene3.addChild(film).set({regX:696/2, x: 750/2, y: CH - 170});
		
		shots = new createjs.Container();
		scene3.addChild(shots).set({regX:(125*5 + 10*4)/2, x: 750/2, y: CH - 170});
	}
	
	//=============================================================================================================
	//											STUFF
	//=============================================================================================================
	
	function moveAt(obj, tgt)
	{
		obj.x = (tgt.x - 299.40 + 287.05) * 1.241 + 15;
		obj.y = (tgt.y - 207.35 + 215.05) * 1.241 -  8;
	}
	
	var allDots = [], dots = [], nDots = 5, xx = xA, yy = yA;
	function addDot(i)
	{
		var dot = new createjs.Shape();
		dot.graphics.f("#f00").dc(0, 0, 10).ef().ss(2).s("#fff").dc(0, 0, 8).es();
		dot.set({name: "dot_" + i, cursor: "pointer", visible: false});
		
		// console.log("add dots:");
		// moveAt(dot, data.coord[rndArr[i]]);
		moveAt(dot, data.coord[i]);
		allDots.push(dot);
		// dots.push(dot);
		
        dot.on("click", function (e) {
			var t = e.target;
			t.mouseEnabled = false;
			dots.push(t);
			dotPath.graphics.ss(3).s("#f00").mt(xx, yy).lt(t.x, t.y).es();
			xx = t.x; yy = t.y;
			if (5 == dots.length) {
				dotPath.graphics.ss(3).s("#f00").mt(xx, yy).lt(xA, yA).es();
				xx = xA; yy = yA;
				createjs.Tween.get(this).wait(1000).call(function(){
					buttonShow(true);
					tableInfo.visible = true;
				});
			}
		});
		return dot;
	}
	
	function testDots(dot_x, dot_y)
	{
		if (Math.hypot(xA - dot_x, yA - dot_y) < 100) return true;
		for (var i = 0; i < dots.length; ++i) {
			if (Math.hypot(dots[i].x - dot_x, dots[i].y - dot_y) < 100) return true;
		}
		return false;
	}
	
	function moveDot(dot)
	{
		var cnt = 0;
		do {
			dot.x = Math.random() * 650 + 50;
			dot.y = Math.random() * 425 + 50;
			if (++cnt > 1000) break;
		}
		while (testDots(dot.x, dot.y));
	}
	
	function buttonShow(value)
	{
		button.visible  = value;
		btnText.visible = value;
		btnGlow.visible = value;
	}
	
	function buttonClick()
	{
		switch (state) {
			case 0:
				buttonShow(false);
				createjs.Sound.play("plane"/* ,0,0,0,10,.5 */);
				createjs.Tween.get(planeM).to({x:CW + planeW + dx}, 3000);
				createjs.Tween.get(plane).to({x:CW + planeW}, 3000).wait(1000).call(function(){
					scene0.visible = false;
					scene1.visible = true;
					btnText.set({ text: "ДАЛЬШЕ" });
					planeM.x = plane.x = -planeW; //plane.y = planeH;
					buttonShow(true);
					state = 1;
				});
			break;
			case 1:
				scene1.visible = false;
				dotPath.graphics.c();
				x0 = xA; y0 = yA;
				scene2.visible = true;
				buttonShow(false);
				state = 2;
			break;
			case 2:
				// scene2.visible = false;
				film.x = -350;
				buttonShow(false);
				btnText.set({ text: "ПОВТОРИТЬ" });
				tableInfo.visible = false;
				scene3.visible = true;
				state = 3;
				createjs.Tween.get(film).to({x:375}, 1000);
				
				var i = 0, x0 = xA, y0 = yA, x1, y1;
				plane2.visible = true;
				// rndArr = randomArray(5);
				shotsReady = false;
				movePlane();
				
				function movePlane(){
					if (planeSound) { planeSound.stop(); planeSound = null; }
					if (i > nDots) { stopPlane(); return; }
					
					// Play the sound: play(src, interrupt, delay, offset, loop, volume, pan)
					planeSound = createjs.Sound.play("plane",0,0,0,10,.5);
					
					if (i) {
						addShot(i - 1);
						x0 = x1; y0 = y1;
					}
					if (i < nDots) {
						x1 = dots[i].x; y1 = dots[i].y;
					}
					else {
						x1 = xA; y1 = yA;
					}
					plane2.x = x0; plane2.y = y0;
					plane2.rotation = Math.atan2(y1-y0, x1-x0) * 180 / Math.PI;
					var dt = 10 * Math.hypot(x1-x0, y1-y0); ++i;
					createjs.Tween.get(plane2).to({x: x1, y: y1}, dt).wait(50).call(movePlane);
				}
				
				function stopPlane(){
					plane2.visible = false;
					
					for (var avg = 0, i = 0; i < 5; ++i) {
						avg += bars[i].task.r();
						// console.log('.', i, bars[i].task.r(), avg);
					}
					avg = Math.round(avg / 5);
					// console.log('=', avg);
					
					info3.txt.text = data.results[avg] + "\n\n" + data.texts[3];
					info3.visible = true;
					shotsReady = true;
					buttonShow(true);
				}
				
			break;
			default:
				scene2.visible = false;
				scene3.visible = false;
				info3.visible = false;
				infoShot.visible = false;
				shots.removeAllChildren();
				
				updateAll();
				
				// resetBars();
				
				// rndArr = randomArray(10);
				// dots.forEach(function(t){
					// t.mouseEnabled = true;
					// moveDot(t);
				// });
				// dots = [];
				
				scene0.visible = true;
				btnText.set({ text: "СТАРТ" });
				state = 0;
		}
	}
	var planeSound;
	
	var shotsReady;
	function addShot(i)
	{
		var j = bars[i].task.r();
		console.log('$', i, j);
		var src = "images/shots/shot" + rndArr[i] + "" + j + ".jpg";
		var img = new Image();
		img.onload = function() {
			var bmp = new createjs.Bitmap(img);
			bmp.name = "shot_" + i;
			bmp.id = i; bmp.rank = j; bmp.path = src;
			// bmp.regX = bmp.image.width/2;
			// bmp.regY = bmp.image.height/2;
			var k = 125 / bmp.image.width;
			bmp.scaleX = bmp.scaleY = k;
			
			shots.addChild(bmp).set({
				x: (125 + 10) * i, y: 25, cursor: "pointer"
			});
			// createjs.Sound.play("boom");
			
			bmp.on("click", function (e) {
				if (! shotsReady) return;
				var t = e.target;
				// console.log(t.name, t.rank);
				info3.visible = false;
				
				var task = bars[t.id].task;
				// console.log('@', task.h, task.x);
				var tmp = data.texts[4].split('#');
				infoShot.txt.text = data.shots[t.rank] + "\n" 
					+ tmp[0] + task.h + tmp[1] + task.x + tmp[2];
				infoShot.visible = true;
				
				var bigImg = new Image();
				bigImg.onload = function() {
					var bigBmp = new createjs.Bitmap(bigImg);
					if (infoShot.bigBmp) infoShot.removeChild(infoShot.bigBmp);
					
					infoShot.addChild(bigBmp).set({
						regX: bigBmp.image.width/2, x: 750/2-25, y: 16
					});
					infoShot.bigBmp = bigBmp;
				}
				bigImg.src = src;
				
			});
		}
		img.onerror = function() {
			console.log('load error:', src);
		} 
		try { img.src = src; } 
		catch (e) { console.log(e); }
	}
	
	var bars = [];
	// function resetBars()
	// {
		// for (var i = 0; i < 5; ++i) bars[i].task = addTaskObj(i);
	// }
	
	function addBar(id, ww, hh, cfg)
	{
		var cont = new createjs.Container();
		cont.id = id;
		var task = addTaskObj(id);
		// console.log(id, task);
		if (id) bars.push(cont);
		cont.task = task;
		
		var bg = new createjs.Shape();
		bg.graphics.s("#999").dr(.5, .5, ww, hh/2-4).es();
		bg.graphics.s("#999").dr(.5, .5+hh/2+8, ww, hh/2-4).es();
		if (id) bg.graphics.f("#fff").dr(8, 30+hh/2+8, ww-16, hh/2-64).ef();
		cont.addChild(bg);
		
		var tt = new createjs.Text("t", "18px Courier", "#000");
		cont.addChild(tt).set({
			x: (id?35:10), y: (id?45:20), lineWidth: ww-20, lineHeight: 20,
			// textAlign: "center", 
			textBaseline: "middle",
			text: id? cont.task.h: "Высота, м"
		});
		
		cont.task.x = 0;
		// cont.task.x = cont.task.x0; // TEST !!!
		
		var t = new createjs.Text("t", "18px Courier", "#000");
		cont.addChild(t).set({
			x: (id?30:10), y: hh/2+(id?53:22), lineWidth: ww-20, lineHeight: 20,
			// textAlign: "center", 
			textBaseline: "middle",
			text: id? format(cont.task.x): "Сдвиг объек- тива, мм"
		});
		cont.txt = t;
		
		cont.setH = function (h) {
			cont.task.setH(h);
			tt.text = h;
			t.text = format(0);
		}
		
		cont.on("click", function (e) {
			var t = e.target;
			// console.log(cont.txt.text);
			if (! id) return;
			if (hasInput) return;
			addInput(cont.x + 36, cont.y + 182, cont.txt.text);
			// curTF = cont.txt;
			curBar = cont;
		});
		
		return cont;
	}
	
	var curBar, hasInput = false;
	
	function addInput(x, y, value) {
		var input = document.createElement('input');

		input.type = "text"; //"number"
		input.style.position = 'fixed';
		input.style.left = (x - 4) + 'px';
		input.style.top = (y - 4) + 'px';
		
		input.style.fontFamily = "Courier";
		input.style.fontSize = "18px";
		input.style.width = "80px";
		
		// console.log("->", value, parseFloat(value));
		input.value = parseFloat(value) || 0;
		
		input.onkeydown = handleEnter;
		document.body.appendChild(input);
		input.focus();
		hasInput = true;
	}
	
	function handleEnter(e) {
		var keyCode = e.keyCode;
		if (keyCode === 13) {
			// console.log(this.value);
			var v = parseFloat(this.value.replace(',','.')) || 0;
			curBar.txt.text = format(v);
			curBar.task.x = v;
			// console.log('$', curBar.task.r());
			document.body.removeChild(this);
			hasInput = false;
		}
	}
	
	function format(v) { return (v < 0? '': '+') + v.toFixed(1); }
	
	function addTaskObj(i) {
		var o = {h: 0, x: 0};
		
		o.setH = function (h) {
			o.h = h;
			o.x0 = -640 / (h - 0.8);
			if (i) console.log('H', h, 'x', o.x0.toFixed(1));
		}
		
		o.r = function () {
			var d = Math.abs(o.x - o.x0);
			if (d < .1) return 0;
			if (d < .3) return 1;
			if (d < .6) return 2;
			return 3;
		}
		
		return o;
	}
	
	// window.cui.init2 = init2;
// }());
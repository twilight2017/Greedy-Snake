var sw=20,//一个方块的宽
    sh=20,//一个方块的高
    tr=30,//行数
    td=30;//列数
var snake=null;//生成蛇的实例
var food=null;//生成食物的实例
var game=null;//生成游戏实例
    
//创建方块的构造函数,classname用于设定单个小方块不同的样式：snakeHead,snakeBody,food
function Square(x,y,classname){//x,y是每个小方块的坐标，设计为从0-19
	this.x=x*sw;//布局时使用的真实坐标，用户传入坐标的数字只对应“个
	this.y=y*sh;
	this.class=classname;
	
	this.viewContent = document.createElement('div')//每个小方块对应的元素，创建div
	this.viewContent.className=this.class;//此处的classname对应html语言中的属性
	this.parent=document.getElementById('snakeWrap')//绑定父级,使之成为父级下的div元素
	
}

//编写用于创建方块的函数
Square.prototype.create=function(){
	this.viewContent.style.position="absolute";
	this.viewContent.style.width=sw+"px";
	this.viewContent.style.height=sh+"px";
	this.viewContent.style.left = this.x+"px";
	this.viewContent.style.top = this.y+"px";
	
	//添加方块到页面当中
	this.parent.appendChild(this.viewContent);

};//用于给对象的构造函数添加方法

//在当前页面中删除方块，如改变食物当前位置
Square.prototype.remove = function(){
	this.parent.removeChild(this.viewContent);
};

//蛇
function Snake(){
	this.head=null;//存储蛇头信息
	this.tail=null;//存储蛇尾信息
	this.pos=[];//存储蛇身上每一个方块的位置,二维数组
	
	this.directionNum={//存储蛇走的方向，用一个对象来表示
		//向左走
		left:{
			x:-1,
			y:0,
			rotate:180//蛇头需要翻转180度
		},
		//向右走
		right:{
			x:1,
			y:0,
			rotate:0
		},
		//向下走
		down:{
			x:0,
			y:1,
			rotate:90
		},
		//向上走
		up:{
			x:0,
			y:-1,
			rotate:-90
		}
	}	
}
Snake.prototype.init=function(){
	//创建属于一条蛇的三个部分
	//1.创建蛇头
	 var snakeHead=new Square(2,0,'snakeHead');
	 snakeHead.create();
	 this.head=snakeHead;//存储蛇头信息
	 this.pos.push([2,0]);//在方块位置数组中存储蛇头信息
	 
	 //2.创建蛇身体第一部分
	 var snakeBody1=new Square(1,0,'snakeBody');
	 snakeBody1.create();//生成对象创建到页面之中
	 this.pos.push([1,0]);//存入蛇身体第一部分的坐标
	 
	 //3.创建蛇身体第二部分
	 var snakeBody2=new Square(0,0,'snakeBody');
	 snakeBody2.create();//生成对象创建到页面之中
	 this.tail=snakeBody2;//存储蛇尾信息
	 this.pos.push([0,0]);//存入蛇身体第一部分的坐标
	 
	 //让蛇成为一个整体，便于移动，利用双向链表关系
	 snakeHead.last=null;
	 snakeHead.next=snakeBody1;
	 
	 snakeBody1.last=snakeHead;
	 snakeBody1.next=snakeBody2;
	 
	 snakeBody2.last=snakeBody1;
	 snakeBody2.next=null;
	 
	 //给蛇添加一个属性，表示蛇走的默认的方向,右
	 this.direction=this.directionNum.right;
}

//添加方法用来获取蛇头下一个位置对应的元素，要根据元素类型做不同的事情
Snake.prototype.getNextPos=function(){
	var nextPos=[//蛇头要走的下一个点的坐标
	    this.head.x/sw+this.direction.x,
	    this.head.y/sh+this.direction.y
	]
	//根据下一位置的不同类型做运算
	
	//1.下个点是身体的某一部分：结束游戏。pos二维数组进行遍历
	var selfcollied=false;//默认情况下是否撞到自己
	this.pos.forEach(function(value){//value表示数组中的某一项
		if(value[0]==nextPos[0]&&value[1]==nextPos[1]){
			//数组总有一个数据等于nextPos,说明撞到自己
			selfcollied=true;
		}
	})
	if(selfcollied){
		this.strategies.die.call(this);
		return;//阻止函数继续运行
	}
	
	//2.下个点是墙，结束游戏
	 if(nextPos[0]<0||nextPos[1]<0||nextPos[0]>29||nextPos[1]>29){
		this.strategies.die.call(this);//让方法中的this仍旧指向实例
		return;//不再往下继续进行判断
	}

	//3.下个点是食物，吃掉后自身长度变大,要判断下个点是否是食物
	if(food && food.pos[0]==nextPos[0] && food.pos[1]==nextPos[1]){
		//说明蛇头要走的下一个点是食物
		this.strategies.eat.call(this);
		return;//结束判断
	}
	//4.下个点空白，可继续移动
	this.strategies.move.call(this);
	
};

//用来处理碰撞后要做的事
Snake.prototype.strategies={
	//走，只需关注蛇头和蛇尾
	move:function(format){//format参数用于决定是否需要删除蛇尾
		//1.创建一个新的身体填补旧蛇头的位置
		var newBody = new Square(this.head.x/sw,this.head.y/sh,'snakeBody');
		//2.更新链表的关系
		newBody.last=null;//新的蛇头暂未创建
		newBody.next=this.head.next;//通过head获取snakeBody1,因为snakeBody1变量的作用域不在该函数中
		newBody.next.last=newBody;
		//3.从原位置删除旧蛇头
		this.head.remove();
		newBody.create();
		//3.创建新的蛇头:nextPos
		var newHead = new Square(this.head.x/sw+this.direction.x,this.head.y/sh+this.direction.y,'snakeHead');
		//4.再次更新链表关系
		newHead.next=newBody;
		newHead.last=null;
		newBody.last=newHead;
		newHead.viewContent.style.transform='rotate('+this.direction.rotate+'deg)';
        newHead.create();//放在页面中
		//5.更新蛇身上每一个方块的坐标,在数组前插入新蛇头(即nextPos)的位置，在数组末位删除newBody2
		this.pos.splice(0,0,[this.head.x/sw+this.direction.x,this.head.y/sh+this.direction.y])//从第0位替换0个，即在最前方插入一个
		this.head=newHead;//更新蛇头的信息
		//6.删除newBody2,若nextPos是food时则不进行删除
		if(!format){//若format值为flase，则需要删除
			this.tail.remove();
			this.tail=this.tail.last;//更新蛇尾
			
			this.pos.pop();//从数组尾端删除
		}
	},
	//吃
	eat:function(){
	  this.strategies.move.call(this,true);
	  createFood();//重新出现食物位置
	  game.score++;
	},
	//死
	die:function(){
	 game.over();	
	}
}

snake=new Snake();

//创建食物
function createFood(){
	var x=null;
	var y=null;//食物小方块的随机坐标
	//食物随机出现原则：不许上墙，不许在蛇身上
	var include=true;//循环跳出的条件，true表示随机食物坐标在蛇身上，要继续进行循环
	while(include){
		x=Math.round(Math.random()*(td-1));
		y=Math.round(Math.random()*(tr-1));//round表示采用四舍五入原则
		
		snake.pos.forEach(function(value){
			if(value[0]!=x&&value[1]!=y){
				//说明随机坐标不在蛇身上
				include=false;
			}
		});

	}
	//生成食物
	food=new Square(x,y,'food');
	food.pos=[x,y];//存储生成食物的坐标，用于根蛇头要走的下一个点做对比
	
	var foodDom=document.querySelector('.food');
	if(foodDom){//成功在页面中获取dom,改变食物坐标而不创建新的食物
		foodDom.style.left=x*sw+'px';
		foodDom.style.top=y*sh+'px';
	}else{
	food.create();
	}
}

//控制游戏逻辑，给玩家提供操作方法
function Game(){
	this.timer=null;//计时器属性
	this.score=0;//得分属性
}

Game.prototype.init=function(){
	snake.init();//初始化蛇
    //snake.getNextPos();
    createFood();//创建食物
    
    //设置键盘事件
    document.onkeydown=function(ev){
    	if(ev.which==37 && snake.direction!=snake.directionNum.right){//37代表左键
    		snake.direction=snake.directionNum.left;   		
    	}else if(ev.which==38 && snake.direction!=snake.directionNum.down){//38为向上走
    		snake.direction=snake.directionNum.up;
    	}else if(ev.which==39 && snake.direction!=snake.directionNum.left){//39为向右走
            snake.direction=snake.directionNum.right;
    	}else if(ev.which==40 && snake.direction!=snake.directionNum.up){//40为向下走
            snake.direction=snake.directionNum.down;
    	}
    }
    this.start();
}
Game.prototype.start=function(){
	//开启游戏，开启定时器
	this.timer=setInterval(function(){
		snake.getNextPos();
	},200);
}
Game.prototype.pause=function(){
	clearInterval(this.timer);
}
Game.prototype.over=function(){
	clearInterval(this.timer);
	alert('你的得分为：'+this.score);
	//游戏回到最初始的状态，蛇和食物均需清空
	var snakeWrap=document.getElementById('snakeWrap');
	snakeWrap.innerHTML='';//清空dom元素
	
	//重新创建蛇和游戏的实例以达到清空的目的
	snake=new Snake();
	game=new Game();
	
	var startBtnWrap=document.querySelector('.startBtn');
    startBtnWrap.style.display='block';
}

//开启游戏
game = new Game();
var startBtn=document.querySelector('.startBtn button');
startBtn.onclick=function(){
	startBtn.parentNode.style.display='none';
	game.init();
};

//暂停游戏
var startBtnWrap=document.querySelector('.startBtn');
var pauseBtn=document.querySelector('.pauseBtn button');
snakeWrap.onclick=function(){
	game.pause();
	pauseBtn.parentNode.style.display='block';
}

pauseBtn.onclick=function(){
	game.start();
	pauseBtn.parentNode.style.display='none';
}

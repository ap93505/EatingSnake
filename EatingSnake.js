﻿$(function() {
    let gameTimer;
    let snake;
    let obstacle;

    document.addEventListener('keydown', keyDownCheck, false);
    $("#gameStart").click(function () {
        beginGame($("input[name=level]:checked").val());
    });

    function beginGame(level) {
        let gameSpeed = [240, 210, 180, 150, 120, 90, 60, 30];
        console.log('gameTimer: '+gameTimer);

        //if (gameTimer) {
            clearInterval(gameTimer);
        //}
    
        snake = new Snake();
        obstacle = new Obstacle();
    
        gameTimer = setInterval(function () {
            console.log('level: '+level)
            //if (level) {
                snake.move(level);
            //}
            draw(snake, obstacle, level);
            $("#score").val(snake.score);
            $("#level").val(level);
        }, gameSpeed[level - 1]);
    }
    
    function draw(snake, obstacle, level) {
        let canvas = document.getElementById('canvas');
        let ctx = canvas.getContext('2d');
        // 画布大小 720 x 480， 每个元素半径12
        // X = 0 ~ 29 , Y = 0 ~ 19
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.closePath();
        ctx.fill();
    
        for (i = 0; i < snake.body.length; i++) {
            ctx.beginPath();
            //arc(X,Y,Radius,StartAngle,endAngle,anticlockwise)
            ctx.arc(snake.body[i].x * 24 + 12, snake.body[i].y * 24 + 12, 0, 0, Math.PI * 2, true);
            ctx.fillStyle = "#F6AE2D";
            ctx.closePath();
            ctx.fill();
        }
    
        for (i = 0; i < obstacle.body.length; i++) {
            ctx.beginPath();
            ctx.arc(obstacle.body[i].x * 24 + 12, obstacle.body[i].y * 24 + 12, 12, 0, Math.PI * 2, true);
            if (obstacle.body[i].num == 6) {
                ctx.fillStyle = "#55DDE0";
            }
            else if (obstacle.body[i].num == 4) {
                ctx.fillStyle = "#33658A";
            } 
            else {
                ctx.fillStyle = "#2F4858";
            }
            ctx.closePath();
            ctx.fill();
        }
    }
    
    function keyDownCheck(event) {
        let e = event || window.event || arguments.callee.caller.arguments[0];
    
        //取消上下鍵卷軸移動功能
        if (e.preventDefault()) {
            e.preventDefault(); //for Chrome
        } 
        else {
            e.returnValue = false; //for IE
        }
    
        //alert(e.keyCode);
        if (e.keyCode == 87 || e.keyCode == 38) { // up
            if (snake.dir == 2)
                return;
            snake.dir = 1;
        }
        else if (e.keyCode == 83 || e.keyCode == 40) { // down
            if (snake.dir == 1)
                return;
            snake.dir = 2;
        }
        else if (e.keyCode == 65 || e.keyCode == 37) { // left
            if (snake.dir == 4)
                return;
            snake.dir = 3;
        }
        else if (e.keyCode == 68 || e.keyCode == 39) { //right
            if (snake.dir == 3)
                return;
            snake.dir = 4;
        }
    }
    
    // 0 ~ 29 , 0 ~ 20
    function Snake() {
        this.dir = 3; // 初始向左
        this.body = [new Pos(20, 15), new Pos(21, 15), new Pos(22, 15), new Pos(23, 15), new Pos(24, 15), new Pos(25, 15)];
        this.eat = false;
        this.score = 0;
        this.dead = false;
        this.move = function (level) {
            let isEat = false;
            let head;
            if (this.dir == 1)
                head = new Pos(this.body[0].x, this.body[0].y - 1);
            else if (this.dir == 2)
                head = new Pos(this.body[0].x, this.body[0].y + 1);
            else if (this.dir == 3)
                head = new Pos(this.body[0].x - 1, this.body[0].y);
            else if (this.dir == 4)
                head = new Pos(this.body[0].x + 1, this.body[0].y);
    
            //判定是否死亡
            if (level == 1)
            { //可以穿墙
                if (head.x < 0) head.x = 29;
                if (head.x > 29) head.x = 0;
                if (head.y < 0) head.y = 19;
                if (head.y > 19) head.y = 0;
            }
            else if (head.x < 0 || head.x > 29 || head.y < 0 || head.y > 20)
            {
                this.dead = true;
            }
    
            //吃到自身
            if (!this.dead) { 
                for (i = 0; i < snake.body.length; i++) {
                    if (snake.body[i].x == head.x && snake.body[i].y == head.y) {
                        this.dead = true;
                        break;
                    }
                }
            }
    
            if (this.dead) {
                GameOver(); return;
            }
    
            //判定是否吃到食物
            for (i = 0; i < obstacle.body.length; i++) {
                if (head.x == obstacle.body[i].x && head.y == obstacle.body[i].y) {
                    this.score += obstacle.body[i].num * level;
                    this.body.splice(0, 0, obstacle.body[i]);
                    obstacle.body.splice(i, 1); // 删除i位置的一个元素
                    isEat = true;
                }
            }
    
            if (!isEat) { //没有吃到就每个蛇身往前移动一步，直接用前一个蛇身赋值即可。
                for (i = this.body.length - 1; i >= 0; i--) {
                    if (i == 0)
                        this.body[i].x = head.x, this.body[i].y = head.y;
                    else
                        this.body[i].x = this.body[i - 1].x, this.body[i].y = this.body[i - 1].y;
                }
                /*  另一种移动方法     this.body.splice(0,0,head); // 吃掉头
                          this.body.pop(); // 删除尾部 ，这样就移动了!*/
            }
    
            if (isEat) { // 添加食物
                let isOcupy = false;
                let tmp;
                do {
                    isOcupy = false;
                    tmp = createObstacle();
                    for (i = 0; i < snake.body.length; i++) {
                        if (snake.body[i].x == tmp.x && snake.body[i].y == tmp.y) {
                            isOcupy = true;
                            break;
                        }
                    }
                    if (!isOcupy) {
                        for (i = 0; i < obstacle.body.length; i++) {
                            if (obstacle.body[i].x == tmp.x && obstacle.body[i].y == tmp.y) {
                                isOcupy = true;
                                break;
                            }
                        }
                    }
                } while (isOcupy);
                obstacle.body.push(tmp);
            }
        }
    }
    
    function Obstacle() {
        this.body = [new Pos(0, 0), new Pos(3, 2), new Pos(5, 8)
        , new Pos(6, 9), new Pos(29, 19), new Pos(10, 10), new Pos(11, 11)];
    }
    
    function createObstacle() {
        let tmp = new Pos(Math.floor(Math.random() * 30), Math.floor(Math.random() * 20));
        tmp.num = Math.random() < 0.1 ? 4 : 2; // 出现4和2的比例 1 ： 9
        return tmp;
    }
    
    function Pos(x, y) {
        this.x = x;
        this.y = y;
        this.num = 2;
    }
    
    function GameOver() {
        alert('GameOver!');
        clearInterval(gameTimer);
        $("#score").val(0);
        snake.body = null;
    }
});
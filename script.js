window.addEventListener('load',function(){ //window = se refere a tela inteira
  //Configurações da tela
  const canvas = document.getElementById('canvas1');
  const ctx = canvas.getContext('2d'); //Contexto da orientação do game
  canvas.width = 1000  //Largura máxima
  canvas.height = 500 //Altura máxima

  //class = palavra reservada para a criação de objetos no JS
  class InputHandler{ //Configurações dos inputs do teclado
    constructor(game){
      
      this.game=game //this é uma palavra reservada para algo que será substituido por um argumento e utilizado ou modificado de acordo com o escopo de função inserido
      
      window.addEventListener('keydown',e => {  
        if(((e.key === 'ArrowUp') ||
           (e.key === 'ArrowDown'))
           && this.game.keys.indexOf(e.key) === -1){
          this.game.keys.push(e.key)
        } else if(e.key === ' '){
          this.game.player.shootTop() //executa a função se a tecla espaço for utilizada
        } else if(e.key === 'd'){
          this.game.debug = !this.game.debug
        }
      })
      window.addEventListener('keyup',e =>{
        if(this.game.keys.indexOf(e.key) > -1){
          this.game.keys.splice(this.game.keys.indexOf(e.key),1)
        }
      })
      
    }
  }
  
  class Projectile{ // Configurações dos projeteis
    constructor(game, x, y){ //além de ter um link com o jogo, também precisa das posições iniciais
      this.game = game
      this.x = x
      this.y = y
      this.width = 10
      this.height = 3
      this.speed = 3
      this.markedForDeletion = false
      this.image = document.querySelector("#projectile")
    }
    update(){
      this.x+= this.speed
      if(this.x > (this.game.width)){
        this.markedForDeletion = true
      }
    }
    draw(context){
      context.drawImage(this.image,this.x, this.y) //Rect = Rectangle = retangulo
      
    }
  }
  
  class Particle{ //Configurações das particulas
    constructor(game, x, y){
      this.game = game
      this.y = y
      this.x = x
      this.image = document.querySelector('#gears')
      this.frameX = Math.floor(Math.random() * 3)
      this.frameY = Math.floor(Math.random() * 3)
      this.spriteSize = 50
      this.sizeModifier = (Math.random() * 0.5 + 0.5).toFixed(1)
      this.size = this.spriteSize * this.sizeModifier
      this.speedX = Math.random() * 6 - 3
      this.speedY = Math.random() * -15
      this.gravity = 0.5
      this.markedForDeletion = false
      this.angle = 0
      this.va = Math.random() * 0.2 - 0.1 //velocidade do angulo
      this.bounced = 0
      this.bottomBounceBoundary = Math.random() * 80 + 60
              
    }
    update(){
      this.angle += this.va
      this.speedY += this.gravity
      this.x += this.speedX + this.game.speed
      this.y += this.speedY
      if(this.y > this.game.height + this.size || this.x < 0 - this.size){
        this.markedForDeletion = true
      }
      if((this.y > this.game.height - this.bottomBounceBoundary) && this.bounced < 2){
        this.bounced ++
        this.speedY *= -0.5
      }
    }

    draw(context){
      context.save()
      context.translate(this.x, this.y)
      context.rotate(this.angle)
      context.drawImage(this.image, this.frameX * this.spriteSize, this.frameY * this.spriteSize, this.spriteSize, this.spriteSize, this.size*-0.5, this.size*-0.5, this.size, this.size)
      context.restore()
    }
  }
  
  class Player{ // Configurações do jogador
    constructor(game){ //Constructor = cria um objeto em branco para ser usado e utiliza um argumento para ser utilizado, sendo externo ou de outro objeto, com o objetivo de dar propriedades específicas à algo
      
      this.game = game  //chama as propriedades contidas na class game
      
      //especificações do tamanho, da posição e da velocidade do objeto Player
      this.width = 120
      this.height = 190
      this.x = 20
      this.y = 100
      this.frameX = 0
      this.frameY = 0
      this.maxFrame = 37
      this.speedY = 0
      this.MaxSpeedY = 5 //define a velocidade maxima do jogador
      this.projectiles = [] //define um array de projéteis, identificando e guardando as ocorrências
      this.image = document.querySelector('#player')
      this.powerUp = false
      this.powerTimer = 0
      this.powerLimit = 5000
      
    }
      update(deltaTime){ // atualizações que são feitas a cada ação tomada pelo jogador
        if(this.game.keys.includes('ArrowUp')){ // includes = Boolean que diz se contém ou não o argumento
          this.speedY = -this.MaxSpeedY 
        }
        else if(this.game.keys.includes('ArrowDown')){
          this.speedY = this.MaxSpeedY 
        }  
        else{
          this.speedY = 0
        }
        this.y += this.speedY
        //Vertical boundaries
        if(this.y > this.game.height - this.height*0.5) this.y = this.game.height - this.height*0.5
        else if(this.y < - this.height*0.5) this.y = - this.height*0.5
        
        
        //handle projectiles
        this.projectiles.forEach(projectile =>{
          projectile.update()
          
        })
        this.projectiles=this.projectiles.filter(projectile => !projectile.markedForDeletion) //função filter = metodo que cria um novo array que subscreve o array antigo com todos os elementos que passaram pelo parâmetro da função especificada como argumento
        
        //sprite animation
        if(this.frameX < this.maxFrame){
          this.frameX++
        } else {
          this.frameX=0
        }
        //power up

        if(this.powerUp){
          if(this.powerTimer > this.powerLimit){
            this.powerTimer = 0
            this.powerUp = false
            this.frameY = 0
          } else {
            this.powerTimer += deltaTime
            this.frameY = 1
            this.game.ammo += 0.1
          }
        }

        
        
      }               
      
      draw(context){ //Especifica em qual contexto vão ser feitas as alterações em relação a quantidade de dimensões e layers
        this.projectiles.forEach(projectile => { projectile.draw(context) })
        
        if(this.game.debug) context.strokeRect(this.x,this.y,this.width-20,this.height)
        context.drawImage(this.image, this.frameX * this.width-10 , this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height) //1- a imagem, 2 e 3- o frame da imagem * o tamanho, 4 e 5 - o tamanho de cada frame, 6 e 7 - a posição na tela de cada frame, 8 e 9 - o espaço ocupado pela imagem        
      }
    shootTop(){
      if(this.game.ammo > 0){
      this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 30)) //define a posição inicial do projétil em relação a posição do jogador, as constantes são para ajustar a posição de acordo com a preferência
        }    
      this.game.ammo--
      if(this.game.ammo < 0){
        this.game.ammo=0       
       }
      if(this.powerUp) this.shootBottom()
    
     }
    shootBottom(){
      if(this.game.ammo > 0){
        this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 175)) 
      }
    }
    enterPowerUp(){
      this.powerTimer = 0 
      this.powerUp = true
      if(this.game.ammo < this.game.maxAmmo) this.game.ammo = this.game.maxAmmo
    }
  }
  
  class Enemy{ //Configurações dos inimigos, classe "pai", a super classe dos inimigos
   constructor(game){
     this.game = game;
     this.x = this.game.width
     this.speedX = Math.random() * -1.5 - 0.5
     this.markedForDeletion = false //para os inimigos desaparecerem ou não 
     this.frameX = 0
     this.frameY = 0
     this.maxFrame = 37
   }
   update(){
     this.x += this.speedX - this.game.speed
     if(this.x + this.width < 0){ //condição para eles desaparecerem antes de sair da tela
       this.markedForDeletion = true
     }
     if(this.frameX < this.maxFrame){
       this.frameX++
     } else{
       this.frameX = 0
     }
   }
    draw(context){
      if(this.game.debug) context.strokeRect(this.x,this.y,this.width,this.height) // tamanho e posição dos inimigos
      context.drawImage(this.image, this.frameX * this.width , this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height)
      if(this.game.debug){
      context.font = '20px Helvetica'
      context.fillText(this.lives, this.x, this.y)
      }
  
    }
  }

  class Angler1 extends Enemy{ //extends = referenciação e criação de subclasses "filhas" de uma super classe
    constructor(game){
      super(game); //Função utilizada para os parâmetros herdados serem utilizados antes dos parâmetros 'filhos'
      this.width = 228
      this.height = 169
      this.y = Math.random() * (this.game.height * 0.95 - this.height)
      this.image = document.getElementById('angler1')
      this.frameY = Math.floor(Math.random() * 3)
      this.lives = 5
      this.score = this.lives
    }
  }

  class Angler2 extends Enemy{ //extends = referenciação e criação de subclasses "filhas" de uma super classe
    constructor(game){
      super(game); //Função utilizada para os parâmetros herdados serem utilizados antes dos parâmetros 'filhos'
      this.width = 213
      this.height = 165
      this.y = Math.random() * (this.game.height * 0.95 - this.height)
      this.image = document.getElementById('angler2')
      this.frameY = Math.floor(Math.random() * 2)
      this.lives = 6
      this.score = this.lives
    }
  }

  class LuckyFish extends Enemy{ //extends = referenciação e criação de subclasses "filhas" de uma super classe
    constructor(game){
      super(game); //Função utilizada para os parâmetros herdados serem utilizados antes dos parâmetros 'filhos'
      this.width = 99
      this.height = 95
      this.y = Math.random() * (this.game.height * 0.9 - this.height)
      this.image = document.getElementById('lucky')
      this.frameY = Math.floor(Math.random() * 2)
      this.lives = 5
      this.score = 15
      this.type = 'lucky'
    }
  }
  
  class HiveWhale extends Enemy{ //extends = referenciação e criação de subclasses "filhas" de uma super classe
    constructor(game){
      super(game); //Função utilizada para os parâmetros herdados serem utilizados antes dos parâmetros 'filhos'
      this.width = 400
      this.height = 227
      this.y = Math.random() * (this.game.height * 0.95 - this.height)
      this.image = document.getElementById('hivewhale')
      this.frameY = 0
      this.lives = 20
      this.score = this.lives
      this.type = 'hive'
      this.speedX = Math.random() * -1.2 - 0.2
    }
  }

   class Drone extends Enemy{ //extends = referenciação e criação de subclasses "filhas" de uma super classe
    constructor(game, x, y){
      super(game); //Função utilizada para os parâmetros herdados serem utilizados antes dos parâmetros 'filhos'
      this.width = 115
      this.height = 95
      this.y = y
      this.x = x
      this.image = document.getElementById('drone')
      this.frameY = Math.floor(Math.random() * 2)
      this.lives = 3
      this.score = this.lives
      this.type = 'drone'
      this.speedX = Math.random() * -4.2 - 0.5
    }
  }

  class Layer {//Configurações das imagens de fundo e posição delas
    constructor(game, image, speedModifier){
      this.game = game
      this.image = image
      this.speedModifier = speedModifier
      this.width = 1768
      this.height = 500
      this.x = 0
      this.y = 0
    }
    update(){
      if(this.x <= -this.width){
        this.x = 0
      }else{
        this.x -= this.game.speed * this.speedModifier
      }
    }
    draw(context){
      context.drawImage(this.image, this.x, this.y)
      context.drawImage(this.image, this.x + this.width, this.y)
    }
  }
  
  
  class Background{//Configurações do plano de fundo
    constructor(game){
      this.game = game;
      this.image1 = document.getElementById("layer1");
      this.layer1 = new Layer(this.game, this.image1, 0.2);
      this.image2 = document.getElementById("layer2");
      this.layer2 = new Layer(this.game, this.image2, 0.4);
      this.image3 = document.getElementById("layer3");
      this.layer3 = new Layer(this.game, this.image3, 1);
      this.image4 = document.getElementById("layer4");
      this.layer4 = new Layer(this.game, this.image4, 1.5);
      this.layers = [this.layer1, this.layer2, this.layer3];
    }
    update(){
      this.layers.forEach(layer => layer.update())
    }
    draw(context){
      this.layers.forEach(layer => layer.draw(context))
    }
  }

  class Explosion{
    constructor(game, x, y){
      this.game = game
      this.x = x
      this.y = y
      this.frameX = 0
      this.spriteHeight = 200
      this.fps = 30
      this.timer = 0
      this.interval = 1000/this.fps
      this.markedForDeletion = false
      this.maxFrame = 8
      
    }
    update(deltaTime){
      this.x -= this.game.speed
      if(this.timer > this.interval){
        this.frameX++      
        this.timer = 0
        } else {
        this.timer += deltaTime
        }
      if(this.frameX > this.maxFrame) this.markedForDeletion = true
    }
    draw(context){
      context.drawImage(this.image, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height)
    }
  }

  class smokeExplosion extends Explosion{
    constructor(game, x, y){
      super(game, x, y)
      this.image = document.getElementById('smokeExplosion')
      this.spriteWidth = 200
      this.width = this.spriteWidth
      this.height = this.spriteHeight
      this.x = x - this.width * 0.5
      this.y = y - this.height * 0.5
    }
  }

  class fireExplosion extends Explosion{
     constructor(game, x, y){
      super(game, x, y)
      this.image = document.getElementById('fireExplosion') 
      this.spriteWidth = 200
      this.width = this.spriteWidth
      this.height = this.spriteHeight
      this.x = x - this.width * 0.5
      this.y = y - this.height * 0.5
    }
    
  }
  
  class UI{//Configurações da interface vista pelo usuário
    constructor(game){
      this.game = game
      this.fontFamily = 'Bangers'
      this.fontSize = 25
      this.color = 'red'
      
    }    
    draw(context){
      context.save() //salva todo o contexto dentro desse espaço
      context.fillStyle = this.color
      //posicionamento/tamanho e cor da sombra
      context.shadowOffsetX = 2 
      context.shadowOffsetY = 2
      context.shadowColor = 'black'
      context.font = this.fontSize + 'px ' + this.fontFamily
      //score
      context.fillText('Score: ' + this.game.score, 20, 40)      
     
      //temporizador do jogo
      const formattedTime = (this.game.gameTime * 0.001).toFixed(1)
      context.fillText('Timer:' + formattedTime, 20, 100)
            
      // mensagens de game over 
      
      if(this.game.gameOver){
        context.textAlign = 'center'
        let message1, message2
        if(this.game.score >= this.game.WinningScore){
          message1 = 'VOCE VENCEU ‼'
          message2 = 'Bom trabalho explorador'  
        } else if(this.game.score < this.game.WinningScore) {
          message1 = 'Y O U  D I E D'
          message2 = 'Tente de novo'
        }
        context.font = '150px ' + this.fontFamily
        context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5 - 40)
        context.font = '50px ' + this.fontFamily
        context.fillText(message2, this.game.width * 0.5, this.game.height * 0.5 + 40)
      }
      
       //ammo
      if(this.game.player.powerUp) context.fillStyle = 'yellow'
      for(let i=0; i < this.game.ammo; i++){   
        context.fillRect(20 + 5* i, 50, 3, 28) //retangulos que representam a qntd de munição
      }
      
      context.restore() // encerra o save, deixando todas as alterações e estilos dentro desse bloco
    }
    
  }
  
  class Game{ // Configurações do jogo inteiro, onde vão ocorrer todas as alterações, mudanças de estado de inimigos e jogadores e como vai ser o andamento do jogo e suas interações 
    constructor(width, height){ // O argumento utilizado vai ser da tela utilizada para o jogo
      this.width = width
      this.height = height
      this.background = new Background(this) //cria o bg no game
      this.player = new Player(this) //cria um jogador na tela
      this.input = new InputHandler(this) // Reconhece e faz ações de acordo com as teclas utilizadas
      this.ui= new UI(this)//importa pro game as informações da ui
      this.keys = [] //guarda todas as ocorrencias de teclas utilizadas
      this.enemies = [] //guarda todas as ocorrencias de inimigos
      this.particles = [] //guarda todas as ocorrencias de partículas
      this.explosions = [] //guarda todas as ocorrencias de explosões
      this.enemyTimer = 0 //contador de tempo para aparecimento dos inimigos
      this.enemyInterval = 2000;// a cada x segundos nasce um novo inimigo
      this.ammo = 20 //guarda a quantidade de munição atual
      this.maxAmmo = 50 //Quantidade de munição máxima
      this.ammoTimer = 0 //inicio da contagem da recarga da munição
      this.ammoInterval = 350 //final da contagem da recarga, voltando o tempo para o inicial após
      this.gameOver = false; //boolean para o fim de jogo
      this.score = 0  //pontuação
      this.WinningScore = 100 //pontuação para a vitória
      this.gameTime = 0
      this.timeLimit = 30000
      this.speed = 1
      this.debug = false
      
    }
    update(deltaTime){
      if(!this.gameOver){
        this.gameTime += deltaTime
      }
      if(this.gameTime > this.timeLimit){
        this.gameOver = true
      }
      this.background.update()// atualiza o bg
      this.background.layer4.update()
      this.player.update(deltaTime) //importa as atualizações do jogador      
      if(this.ammoTimer > this.ammoInterval ){ //se o timer passar do intervalo recarrega uma munição
        if(this.ammo < this.maxAmmo){ //se a munição for menor que o máximo
          this.ammo++;
          this.ammoTimer=0; //zera o contador
        }      
      } else{
        this.ammoTimer += deltaTime //define o tempo de recarga de acordo com o delta
      }
      this.particles.forEach(particle => particle.update())
      this.particles = this.particles.filter(particle => !particle.markedForDeletion)
      this.explosions.forEach(explosion => explosion.update(deltaTime))
      this.explosions = this.explosions.filter(explosion => !explosion.markedForDeletion)
      this.enemies.forEach( enemy => { //atualiza cada inimigo
        enemy.update();
        if(this.checkCollision(this.player, enemy)){ //se o inimigo colidir com o player, ele desaparece
          
          if(enemy.type === 'lucky'){
            this.player.enterPowerUp()
          } else {
            if(enemy.type === 'hive'){
                  for(let i=0; i<5; i++)
                  this.enemies.push(new Drone(this, enemy.x + Math.random()*enemy.width, enemy.y + Math.random()*enemy.height*0.5))
                }
            this.score--
          }
          enemy.markedForDeletion = true
          this.addExplosion(enemy)
          for(let i=0; i<3; i++){
               this.particles.push(new Particle(this, (enemy.x + enemy.width*0.5), (enemy.y+ enemy.height*0.5)))
             }
        }
        this.player.projectiles.forEach(projectile => {
          if(this.checkCollision(projectile, enemy)){ //configurações de colisão com o projétil com os inimigos         
            if(!this.gameOver)enemy.lives--
            projectile.markedForDeletion = true;
            this.particles.push(new Particle(this, (enemy.x + enemy.width*0.5), (enemy.y+ enemy.height*0.5)))
             
              if(enemy.lives<=0){
               for(let i=0; i<enemy.score; i++){
                 this.particles.push(new Particle(this, (enemy.x + enemy.width*0.5), (enemy.y+ enemy.height*0.5)))
             }
                enemy.markedForDeletion = true
                this.addExplosion(enemy)
                this.expl
                if(enemy.type === 'hive'){
                  for(let i=0; i<5; i++)
                  this.enemies.push(new Drone(this, enemy.x + Math.random()*enemy.width, enemy.y + Math.random()*enemy.height*0.5))
                }
       
                 if(!this.gameOver)this.score += enemy.score
                  if(this.score >= this.WinningScore){
                    this.gameOver = true
                  }
              }
            
          }
       })
      })
      
      this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion) //mesma coisa dos projéteis, deleta o inimigo se markForDeletion for true
      if(this.enemyTimer > this.enemyInterval && !this.gameOver){
        this.addEnemy()
        this.enemyTimer = 0
      } else {
        this.enemyTimer+= deltaTime
      }
    }
    draw(context){  
      
      this.background.draw(context) // desenha o bg   
      this.ui.draw(context)// desenha a ui na tela
      this.player.draw(context) //desenha o player     
      this.particles.forEach(particle => particle.draw(context))
      this.enemies.forEach( enemy =>{ //desenha os inimigos
        enemy.draw(context);
      })
      this.explosions.forEach( explosion =>{ //desenha as explosões
        explosion.draw(context);
      })
      this.background.layer4.draw(context) // desenha o bg
    }
    
    addEnemy(){ //adiciona um inimigo
      const randomize = Math.random();
      if(randomize < 0.3) this.enemies.push(new Angler1(this))
      else if(randomize < 0.6) this.enemies.push(new Angler2(this))
      else if(randomize < 0.7) this.enemies.push(new HiveWhale(this))
      else this.enemies.push(new LuckyFish(this))
      
    }
    addExplosion(enemy){
      const randomize = Math.random();
      if(randomize < 0.5){
       this.explosions.push(new smokeExplosion(this, enemy.x + enemy.width*0.5, enemy.y + enemy.height*0.5))
      } else {
        this.explosions.push(new fireExplosion(this, enemy.x + enemy.width*0.5, enemy.y + enemy.height*0.5))
      }
    }
    checkCollision(rect1,rect2){ //função que identifica se um retângulo colidiu com outro, retornando true ou false
      return( rect1.x < rect2.x + rect2.width &&
              rect1.x + rect1.width > rect2.x &&
              rect1.y < rect2.y + rect2.height &&
              rect1.y + rect1.height > rect2.y
        
      );
    }
  }
  
  const game = new Game(canvas.width, canvas.height) //cria o jogo
  let LastTime = 0
  //animation loop
  function animate(timeStamp){ //função que cria e atualiza o jogo de acordo com a relação entre o tempo e o framerate
    const deltaTime = timeStamp - LastTime //diferença entre o tempo do loop atual pro tempo do loop anterior
    
    LastTime = timeStamp // define o loop anterior com o mesmo valor do atual, para a próxima verificação
    ctx.clearRect(0,0,canvas.width,canvas.height) //Limpa o estado anterior para uma sensação de movimento contínuo
    game.draw(ctx) // desenha no ctx, que é a tela selecionada
    game.update(deltaTime)//atualiza o jogo em tempo real de acordo com o framerate    
    requestAnimationFrame(animate) //Recursividade para o loop não ter fim e para calcular o framerate de acordo com o argumento da função
  }
   
   animate(0)//inicia a animação
  
    
})


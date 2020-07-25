const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 800, // задаем размер нашего окна
  heigth: 640, // высота нашего окна
  scale: {
    mode: Phaser.Scale.RESIZE,  // может изменять размер изображения
    autoCenter: Phaser.Scale.CENTER_BOTH // центрируется
  },
  scene: {
    preload, // функции, которые будут исполняться у нас на сцене
    create, // создание
    update, // обновление
  },
  physics: {
    default: 'arcade', // аркадная физика
    arcade: { 
      gravity: { y: 500 }, // размер нашей гравитации
    },
  }
};

const game = new Phaser.Game(config); // создаем экземпляр нашей игры

function preload() {
 // добавляем наши бекраунд изображения по отдельности
  this.load.image('background', 'assets/images/background.png');
// добавляем  наши spritesheet
  this.load.image('tiles', 'assets/tilesets/platformPack_tilesheet.png');
  //отдельно наш spike загружаем
  this.load.image('spike', 'assets/images/spike.png');
  // загружаем загруженный JSON
  this.load.tilemapTiledJSON('map', 'assets/tilemaps/level1.json');
  // Загрузка анимации игрока из спрайт-листа игрока и атласа JSON
  this.load.atlas('player', 'assets/images/kenney_player.png',
    'assets/images/kenney_player_atlas.json');
}

function create() {
  // создаем карту из нашего tilemap
  const map = this.make.tilemap({ key: 'map' });
  // Add the tileset to the map so the images would load correctly in Phaser
  const tileset = map.addTilesetImage('kenney_simple_platformer', 'tiles');
  // помещаем наше изображение в наш игровой мир
  const backgroundImage = this.add.image(0, 0, 'background').setOrigin(0, 0);
  // изменяем размер нашего изображения для лучшего resolution
  backgroundImage.setScale(2, 0.8);
  //Добавляем платформы как статик слой
  const platforms = map.createStaticLayer('Platforms', tileset, 0, 200);
  // There are many ways to set collision between tiles and players
  // As we want players to collide with all of the platforms, we tell Phaser to
  // set collisions for every tile in our platform layer whose index isn't -1.
  // Tiled indices can only be >= 0, therefore we are colliding with all of
  // the platform layer
  // существуем массу путей установить  столкновения между платформами и игроком
  // сталкиваемся епе со статичным объектом если индекс больше 1
  platforms.setCollisionByExclusion(-1, true);

  // добавляем нашего игрока в мир игры
  this.player = this.physics.add.sprite(50, 300, 'player');
  this.player.setBounce(0.1); // наш игрок будет отскакивать от платфор
  this.player.setCollideWorldBounds(true); // и нельзя будем выходить за карту
  this.physics.add.collider(this.player, platforms);


  // создаем анимацию хождения которая использует последние 2 кадра из нашего атласа первого списка
  this.anims.create({
    key: 'walk',
    frames: this.anims.generateFrameNames('player', {
      prefix: 'robo_player_',
      start: 2,
      end: 3,
    }),
    frameRate: 10,
    repeat: -1
  });

  // Create an idle animation i.e the first frame
  this.anims.create({
    key: 'idle',
    frames: [{ key: 'player', frame: 'robo_player_0' }],
    frameRate: 10,
  });

  // Use the second frame of the atlas for jumping
  this.anims.create({
    key: 'jump',
    frames: [{ key: 'player', frame: 'robo_player_1' }],
    frameRate: 10,
  });

  // вводим способность вводить с помощью стрелочек
  this.cursors = this.input.keyboard.createCursorKeys();

  //Создаем группу из spikes, после этого делаем добавляем им способность не двигаться  
  this.spikes = this.physics.add.group({
    allowGravity: false,
    immovable: true
  });

  // Get the spikes from the object layer of our Tiled map. Phaser has a
  // createFromObjects function to do so, but it creates sprites automatically
  // for us. We want to manipulate the sprites a bit before we use them
  const spikeObjects = map.getObjectLayer('Spikes')['objects'];
  spikeObjects.forEach(spikeObject => {
    //  добавляем новые острия в нашу группу
    const spike = this.spikes.create(spikeObject.x, spikeObject.y + 200 - spikeObject.height, 'spike').setOrigin(0, 0);
    // по умолчанию в нащих тилмапах у нас есть белое пространство, так  что изменим размер установим отступы
    spike.body.setSize(spike.width, spike.height - 20).setOffset(0, 20);
  });

  // добавляем столкновения между игроком и пиками
  this.physics.add.collider(this.player, this.spikes, playerHit, null, this);
}

function update() {
  // контролируем перемещение с помощью 
  if (this.cursors.left.isDown) {
    this.player.setVelocityX(-200);
    if (this.player.body.onFloor()) {
      this.player.play('walk', true);
    }
  } else if (this.cursors.right.isDown) {
    this.player.setVelocityX(200);
    if (this.player.body.onFloor()) {
      this.player.play('walk', true);
    }
  } else {
    //если кнопки не нажата, тогда наш игрок стоит спокойно
    this.player.setVelocityX(0);
    // Only show the idle animation if the player is footed
    // If this is not included, the player would look idle while jumping
    if (this.player.body.onFloor()) {
      this.player.play('idle', true);
    }
  }

 // игрок может прыгать, каждый раз когда он стоит на полу, и нажата клавиша вверх
  if ((this.cursors.space.isDown || this.cursors.up.isDown) && this.player.body.onFloor()) {
    this.player.setVelocityY(-350);
    this.player.play('jump', true);
  }

  // если игрок у нас двигается направо, тогда у нас он смотрит направо
  if (this.player.body.velocity.x > 0) {
    this.player.setFlipX(false);
  } else if (this.player.body.velocity.x < 0) {
    // в другом случае, его лицо смотрит направо
    this.player.setFlipX(true);
  }
}


function playerHit(player, spike) {
  // Set velocity back to 0
  player.setVelocity(0, 0);
  // Возвращаем игрока к изначальной позиции
  player.setX(50);
  player.setY(300);
  // используем изначальную idle анимацию 
  player.play('idle', true);
  // Set the visibility to 0 i.e. hide the player
  player.setAlpha(0);
  // Добавляем анимацию, которая мигает, пока игрок не станет виден
  let tw = this.tweens.add({
    targets: player,
    alpha: 1,
    duration: 100,
    ease: 'Linear',
    repeat: 5,
  });
}

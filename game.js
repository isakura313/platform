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
    create, // создание основной карты
    update, // обновление событий 
  },
  physics: {
    default: 'arcade', // аркадная физика
    arcade: { 
      gravity: { y: 650 }, // размер нашей гравитации
    },
  }
};

const game = new Phaser.Game(config); // создаем экземпляр нашей игры

function preload(){
  // будем добавлять туда наши бекрангд изображения по отдельности
  this.load.image("background", 'assets/images/background.png');

  this.load.image("tiles", 'assets/tilesets/platformPack_tilesheet.png');

  this.load.image('spike', 'assets/images/spike.png')

  this.load.tilemapTiledJSON("map", 'assets/tilemaps/level1.json');

  this.load.atlas('player', 'assets/images/kenney_player.png', 
  'assets/images/kenney_player_atlas.json');
}

function create(){
  const map = this.make.tilemap({key: 'map'});
  const tileset = map.addTilesetImage('kenney_simple_platformer', 'tiles')
  //помещаем наше изображение заднего фона в игровой мир
  const backgroundImage = this.add.image(0,0, 'background').setOrigin(0, 0 )

  backgroundImage.setScale(2, 0.8)
  const platforms = map.createStaticLayer('Platforms', tileset, 0, 200)
  platforms.setCollisionByExclusion(-1, true)

  //добавляем игрока в наш игровой мир

  this.player = this.physics.add.sprite(50, 300, 'player')
  this.player.setBounce(0.1)
  this.play.setCollideWorldBounds(true);
  this.physics.add.collider(this.player, platforms)

  //здесь у нас будет работа с анимацией персонажа

  //делаем управление с помошью стрелочек
  this.cursors = this.input.keyboard.createCursorKeys()

  this.spikes = this.physics.add.group({
    allowGravity: false,
    immovable: true
  })

}




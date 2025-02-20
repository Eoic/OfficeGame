import Multiplayer from './game/managers/multiplayer';
import View3D from './game/managers/view3d';
import Menu from './gui/menu';

enum OS_TYPE {
    GAME,
    MENU
}

class Main {
    constructor(controller_type: OS_TYPE) {
        console.log('Game is starting...');
        switch (controller_type) {
            case OS_TYPE.GAME:
                this.initializeComponents3D();
                break;
            case OS_TYPE.MENU:
                this.initializeComponents();
                break;
        }
    }

    initializeComponents3D() {
        Multiplayer.player = (document.getElementById('player') as HTMLInputElement).value;
        Multiplayer.room = (document.getElementById('room') as HTMLInputElement).value;
        Multiplayer.connect();
        new View3D('layer3D');
    }

    initializeComponents() {
        new Menu('layer2D');
    }
}

window.onload = () => new Main(window.location.href.includes('game') ? OS_TYPE.GAME : OS_TYPE.MENU);

if (module.hot)
    module.hot.accept();

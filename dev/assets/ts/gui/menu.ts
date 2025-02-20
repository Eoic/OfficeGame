import Component from './core/component';

export default class Menu extends Component {
    constructor (elmID: string) {
        super(elmID, ['click']);
        console.log(this)
    }

    on_menuSelect(event: Event) {
        if (event.target instanceof HTMLElement) {
            let elm = document.getElementById(event.target.dataset.panel);
            let others = elm.parentElement.children;
            let currentDisplay = elm.classList.contains('hidden');

            for (let i = 0; i < others.length; i++) {
                others[i].classList.toggle('hidden', true);
            }

            elm.classList.toggle('hidden', !currentDisplay);
        }
    }

    on_createRoom(event: Event) {
        let target = event.target as HTMLElement
        let inputs = target.parentElement.getElementsByTagName('input');

        if (inputs.length > 0) {
            let passcode = inputs[0].value;
            window.location.href = `/room/${passcode}/create/`;
        }
    }

    on_joinRoom(event: Event) {
        let target = event.target as HTMLElement
        let inputs = target.parentElement.getElementsByTagName('input');

        if (inputs.length > 0) {
            let passcode = inputs[0].value;
            window.location.href = `/room/${passcode}/join/`;
        }
    }

    on_updatePlayer(event: Event) {
        let target = event.target as HTMLElement
        let inputs = target.parentElement.getElementsByTagName('input');

        if (inputs.length > 0) {
            let name = inputs[0].value;
            window.location.href = `/player/${name}/`;
        }
    }
}
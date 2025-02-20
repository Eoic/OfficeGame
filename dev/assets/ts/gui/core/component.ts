export default class Component {
    elm: HTMLElement;

    constructor (id: string, events: Array<string>) {
        const elm = document.getElementById(id);
        if (!elm) throw Error(`${id} was not found in the document`);

        this.elm = elm;

        events.forEach(evt => {
            this.elm.addEventListener(evt, e => this.handleEvents(e));
        });
    }

    private handleEvents(event: Event) {
        if ((event.target as HTMLElement).hasAttribute('evt')) {
            const action = `on_${(event.target as HTMLElement).getAttribute('evt')}`;
            const method = this[action as keyof Component];

            if (typeof method === 'function') {
                (method as Function).bind(this)(event);
            } else {
                console.error(`[${this.constructor.name}] method '${action}' is not implemented...`);
            }
        }
    }
}
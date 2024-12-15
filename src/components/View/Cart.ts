import { Component } from '../base/Component';
import { IEvents } from '../base/events';
import { ensureElement } from '../../utils/utils';

interface ICart {
	selectedList: HTMLElement[];
	total: number | null;
}

export class Cart extends Component<ICart> {
  protected _button: HTMLButtonElement;
  protected _total: HTMLSpanElement;
  protected _list: HTMLElement;

  constructor(container: HTMLElement, protected events: IEvents){
    super(container);
    this._list = ensureElement<HTMLElement>('.basket__list', container);
    this._button = ensureElement<HTMLButtonElement>('.basket__button', container);
    this._button.disabled = true;
    this._button.addEventListener('click', (evt) => {
      evt.preventDefault();
      events.emit(`order:open`);
    })
    this._total = ensureElement<HTMLSpanElement>('.basket__price', container);
  }

  set selectedList(items: HTMLElement[]){
    this._list.replaceChildren(...items);
  }

  set total(value: number | null) {
    if (value !== 0) {
        this.setText(this._total, `${value} синапсов`);
        this.setDisabled(this._button, false);
    } else {
        this.setText(this._total, 'Бесценно');
        this.setDisabled(this._button, true);
    }
}
}
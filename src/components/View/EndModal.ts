import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';

interface IEndModal {
	total: number;
}

interface IActions {
	onClick: () => void;
}

export class EndModal extends Component<IEndModal> {
	protected _button: HTMLButtonElement;
	protected _total: HTMLElement;

	constructor(container: HTMLElement, actions: IActions) {
		super(container);
        this._button = ensureElement<HTMLButtonElement>('.order-success__close', this.container);
		this._total = ensureElement<HTMLElement>('.order-success__description', this.container);

		if (actions?.onClick) {
			this._button.addEventListener('click', actions.onClick);
		}
	}

	set total(value: number) {
		this.setText(this._total, `Списано ${value} синапсов`);
	}
}
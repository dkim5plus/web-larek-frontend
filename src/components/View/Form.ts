import { Component } from '../base/Component';
import { IEvents } from '../base/events';
import { IOrderInfo } from '../../types';
import { ensureElement } from '../../utils/utils';

interface IFormState {
    valid: boolean;
    errors: string[];
}

export class Form<T> extends Component<IFormState> {
    protected _submit: HTMLButtonElement;
    protected _errors: HTMLElement;

    constructor(protected container: HTMLFormElement, protected events: IEvents) {
        super(container);

        this._submit = ensureElement<HTMLButtonElement>('button[type=submit]', this.container);
        this._errors = ensureElement<HTMLElement>('.form__errors', this.container);

        this.container.addEventListener('input', (e: Event) => {
            const target = e.target as HTMLInputElement;
            const field = target.name as keyof T;
            const value = target.value;
            this.onInputChange(field, value);
        });

        this.container.addEventListener('submit', (e: Event) => {
            e.preventDefault();
            this.events.emit(`${this.container.name}:submit`);
        });
    }

    protected onInputChange(field: keyof T, value: string) {
        this.events.emit(`${this.container.name}.${String(field)}:change`, {
            field,
            value
        });
    }

    set valid(value: boolean) {
        this._submit.disabled = !value;
    }

    set errors(value: string) {
        this.setText(this._errors, value);
    }

    render(state: Partial<T> & IFormState) {
        const {valid, errors, ...inputs} = state;
        super.render({valid, errors});
        Object.assign(this, inputs);
        return this.container;

    }
}

export class FormContact extends Form<IOrderInfo> {
	protected _email: HTMLInputElement;
	protected _phone: HTMLInputElement;

	constructor(container: HTMLFormElement, protected events: IEvents) {
		super(container, events);
        this._email = ensureElement<HTMLInputElement>('input[name="email"]', this.container);
		this._phone = ensureElement<HTMLInputElement>('input[name="phone"]', this.container);
	}

    set email(value: string) {
		this._email.value = value;
	}

	set phone(value: string) {
		this._phone.value = value;
	}
}

export class FormDelivery extends Form<IOrderInfo> {
	protected _cash: HTMLButtonElement;
	protected _address: HTMLInputElement;
    protected _card: HTMLButtonElement

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this._card = ensureElement<HTMLButtonElement>('button[name="card"]', this.container);
		this._address = ensureElement<HTMLInputElement>('input[name="address"]', this.container);
        this._cash = ensureElement<HTMLButtonElement>('button[name="cash"]', this.container);
		

		this._card.addEventListener('click', () => (this.payment = 'card'));
		this._cash.addEventListener('click', () => (this.payment = 'cash'));
	}

	set payment(method: 'card' | 'cash') {
		if (method) this.onInputChange('payment', method);
		this.setDisabled(this._card, method === 'card');
		this.setDisabled(this._cash, method === 'cash');
        this.events.emit('payment:choosed', { payment: method });
	}

	set address(value: string) {
		this._address.value = value;
	}
}

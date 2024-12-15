import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';
import { IProduct } from  '../../types/index';

export interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

const category: Record<string, string> = {
    'софт-скил': 'soft',
    'другое': 'other',
    'дополнительное': 'additional',
    'кнопка': 'button',
    'хард-скил': 'hard'
}

export class Card extends Component<IProduct> {
    protected _title: HTMLElement;
    protected _category: HTMLElement;
    protected _description:HTMLElement;
    protected _image: HTMLImageElement;
    protected _price: HTMLElement;
    protected _button: HTMLButtonElement;
    
    constructor(container: HTMLElement, actions?: ICardActions) {
        super(container)
    
        this._title = ensureElement<HTMLElement>('.card__title', container)
        this._category = container.querySelector('.card__category')
        this._description = container.querySelector('.card__text')
        this._image = container.querySelector('.card__image')
        this._price = ensureElement<HTMLElement>('.card__price', container)
        this._button = container.querySelector('.card__button')
    
        if (actions?.onClick) {
            if (this._button) {
                this._button.addEventListener('click', actions.onClick);
            } else {
                container.addEventListener('click', actions.onClick);
            }
        }
    }

    set id(value: string) {
        this.container.dataset.id = value;
    }
    
    get id(): string {
        return this.container.dataset.id || '';
    }
    
    set title(value: string) {
        this._title.textContent = value;
    }
    
    set image(value: string) {
		this.setImage(this._image, value, this.title);
	}
    
    set category(value: string) {
        this.setText(this._category, value);
        if (this._category) {
        this._category.classList.add(`card__category_${category[value]}`)
        }
    }

    set description(value: string) {
        this.setText(this._description, value);
    }

    set price(value: number) {
        if (value !== null) {
            this.setText(this._price, `${value} синапсов`);
        } else {
            this.setText(this._price, 'бесценно')
            this.setDisabled(this._button, true)
        }
    }
    
    set button(value: string) {
        this.setText(this._button, value)
    }
}
import { IEvents } from '../components/base/events'
import { IProduct, IOrderInfo, TFormErrors, IOrderForm } from  '../types/index';

interface ICardData {
    preview: IProduct | null;
    setCatalog(data: IProduct[]): void;
    getCatalog(): IProduct[];
    setCardPreview(item: IProduct): void;
    getProduct(cardId: string): void;
}

export class CardData implements ICardData {
    protected _items: IProduct[];
    protected _previewCard: IProduct | null;

    constructor (protected events: IEvents) {
        this.events = events
    }

    getProduct(id: string) {
		return this._items.find((item) => item.id === id);
	}

    setCatalog(data: IProduct[]) {
        this._items = data;
        this.events.emit('cards:changed', { _items: this._items });;
    }

    getCatalog(): IProduct[] {
        return this._items;
    }

    setCardPreview(item: IProduct) {
        this._previewCard = item;
        this.events.emit('preview:open', item)
    }

    get preview(): IProduct | null {
		return this._previewCard;
	}
}

interface ICartData {
    cart: IProduct[];
    clearCart(): void;
    getCartSize(): void;
    getTotal(): void;
    addCart(product: IProduct): void;
    removeCart(id: string): void;
}

export class CartData implements ICartData {
	protected _cart: IProduct[] = [];

    constructor (protected events: IEvents) {
        this.events = events
    }
    
    set cart(data: IProduct[]) {
        this._cart = data;
      }
    
    get cart() {
        return this._cart;
      }
	
    clearCart() {
        this._cart = [];
        this.events.emit('cart:changed');
    }

    getCartSize() {
        return this._cart.length;
    }

    getTotal() {
        let summ = 0;
        this._cart.forEach(item => {
          summ = summ + item.price;
        });
        return summ;
    }

    addCart(product: IProduct): void {
		this._cart.push(product);
        this.events.emit('cart:changed');
	}

	removeCart(id: string): void {
		this._cart = this._cart.filter((item) => item.id !== id);
        this.events.emit('cart:changed');
	}

}

interface IOrderData {
    getOrder(): IOrderInfo;
    clearOrder(): void;
    validateOrder(): void;
    setOrder(field: keyof IOrderForm, value: string): void;

}

export class OrderData implements IOrderData {
    protected _order: IOrderInfo = {
        payment: '',
		email: '',
		phone: '',
		address: '',
		total: 0,
        items: [],
	};
    protected formErrors: TFormErrors;

	constructor(protected events: IEvents) {
		this.events = events;
	}

    getOrder(): IOrderInfo {
		return this._order;
	}

    clearOrder() {
		this._order = {
			payment: '',
		    email: '',
		    phone: '',
		    address: '',
		    total: 0,
            items: [],
		};
	}

    validateOrder() {
		const error: typeof this.formErrors = {};
		if (!this._order.payment) {
			error.payment = 'Укажите способ оплаты';
		}
		if (!this._order.email) {
			error.email = 'Укажите ваш e-mail';
		}
		if (!this._order.address) {
			error.address = 'Укажите адрес доставки';
		}
		if (!this._order.phone) {
			error.phone = 'Укажите номер телефона';
		}
		this.formErrors = error;
		this.events.emit('errors:changed', this.formErrors);
		return Object.keys(error).length === 0;
    }

    setOrder(field: keyof IOrderForm, value: string) {
		this._order[field] = value;
        if (this.validateOrder()) {
			this.events.emit('order:ready', this._order);
		}
	}
}
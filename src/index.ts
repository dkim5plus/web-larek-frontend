import './scss/styles.scss';
import { EventEmitter } from './components/base/events';
import { cloneTemplate, ensureElement } from './utils/utils';
import { API_URL, CDN_URL } from './utils/constants';
import { AppApi } from './components/AppApi';

import { IProduct, IOrderInfo, IOrderForm } from  './types/index';

import { CardData, CartData, OrderData } from './components/Model';

import { Card } from './components/View/Card';
import { Cart } from './components/View/Cart';
import { EndModal } from './components/View/EndModal';
import { Form, FormContact, FormDelivery } from './components/View/Form';
import { Modal } from './components/View/Modal';
import { Page } from './components/View/Page';

const api = new AppApi(API_URL, CDN_URL);
const events = new EventEmitter();

const cardData = new CardData(events);
const cartData = new CartData(events);
const orderData = new OrderData(events);

const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const cartTemplate = ensureElement<HTMLTemplateElement>('#basket');
const contactTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const deliveryTemplate = ensureElement<HTMLTemplateElement>('#order');
const endModalTemplate = ensureElement<HTMLTemplateElement>('#success');

const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const cart = new Cart(cloneTemplate(cartTemplate), events);
const formDelivery = new FormDelivery(cloneTemplate(deliveryTemplate), events);
const formContact = new FormContact(cloneTemplate(contactTemplate), events);



api
	.getCards()
	.then((items) => {
		cardData.setCatalog(items);
	})
	.catch((err) => {
		console.error(err);
	});

events.on('cards:changed', () => {
	page.catalog = cardData.getCatalog().map((item) => {
		const card = new Card(cloneTemplate(cardCatalogTemplate), {
			onClick: () => {
				events.emit('card:selected', item);
			},
		});
		return card.render(item);
	});
});

events.on('modal:open', () => {
	page.block = true; 
});

events.on('modal:close', () => {
	page.block = false;
});

events.on('card:selected', (item: IProduct) => {
	cardData.setCardPreview(item);
});

events.on('preview:open', (item: IProduct) => {
    const selectedCard = cardData.getProduct(item.id);
	const preview = new Card(cloneTemplate(cardPreviewTemplate), {
		onClick: () => {
			if (cartData.cart.includes(item)) {
				preview.button = 'В корзину';
				events.emit('cart:delete', item);
			} else {
				events.emit('cart:add', item);
				preview.button = 'Удалить из корзины';
			}
		},
	});

	if (!cartData.cart.includes(item)) {
		preview.button = 'В корзину';
	} else {
		preview.button = 'Удалить из корзины';
	}

	modal.render({
		content: preview.render({
            id: item.id,
			description: item.description,
			image: item.image,
			title: item.title,
			category: item.category,
			price: item.price,
		}),
	})
});

events.on('cart:add', (item: IProduct) => {
	cartData.addCart(item);
	page.counter = cartData.getCartSize();
	events.emit('cart:changed');
});

events.on('cart:delete', (item: IProduct) => {
	cartData.removeCart(item.id);
	page.counter = cartData.getCartSize();
	events.emit('cart:changed');
});

events.on('cart:changed', () => {
	const products = cartData.cart.map((item, index) => {
		const card = new Card(cloneTemplate(cardBasketTemplate), {
			onClick: () => {
				events.emit('cart:delete', item);
			},
		});

		return card.render({
			price: item.price,
			title: item.title,
			id: item.id,
			index: (index += 1),
		});
	});

	cart.render({
		selectedList: products,
		total: cartData.total,
	});
});

events.on('cart:open', () => {
	modal.render({
		content: cart.render({
			total: cartData.total,
		}),
	});
});

events.on('order:open', () => {
	modal.render({
		content: formDelivery.render({
			payment: '',
			address: '',
			valid: false,
			errors: [],
		}),
	});
});

events.on('order:submit', () => {
	modal.render({
		content: formContact.render({
			email: '',
			phone: '',
			valid: false,
			errors: [],
		}),
	});
});

events.on('errors:changed', (errors: Partial<IOrderInfo>) => {
	const { address, payment } = errors;
	formDelivery.valid = !address && !payment;
	formDelivery.errors = Object.values({ address, payment })
		.filter((i) => !!i)
		.join('; ');
});

events.on('errors:changed', (errors: Partial<IOrderForm>) => {
	const { phone, email } = errors;
	formContact.valid = !phone && !email;
	formContact.errors = Object.values({ phone, email })
		.filter((i) => !!i)
		.join('; ');
});

events.on('payment:choosed', (data: { payment: string }) => {
	orderData.setOrder('payment', data.payment);
});

events.on(
	/^order\..*:change/,
	(data: { field: keyof IOrderForm; value: string }) => {
		orderData.setOrder(data.field, data.value);
	}
);

events.on(
	/^contacts\..*:change/,
	(data: { field: keyof IOrderForm; value: string }) => {
		orderData.setOrder(data.field, data.value);
	}
);

events.on('contacts:submit', () => {
	api
		.postOrder({
			payment: orderData.order.payment,
			address: orderData.order.address,
			phone: orderData.order.phone,
			email: orderData.order.email,
			items: cartData.cart.map(item => {
				if (!(item.price === null)) {
					return item.id;
				}
			}).filter(Boolean),
			total: cartData.total})
		.then((result) => {
			const success = new EndModal(cloneTemplate(endModalTemplate), {
				onClick: () => {
					modal.close();
				},
			});

			modal.render({
				content: success.render({
					total: cartData.total,
				}),
			});

			cartData.clearCart();
			page.counter = cartData.getCartSize();
			events.emit('cart:changed');
			orderData.clearOrder();
		})
		.catch((err) => console.log(err));
});


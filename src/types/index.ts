export interface IProduct {
    id: number;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null
}

export interface IOrderInfo {
	payment: string;
	email: string;
	phone: string;
	address: string;
	total: number;
	items: string[];
}

export interface ICart {
    items: IProduct[];
    total: number;
}

export interface IPage {
    items: IProduct[];
    counter: number;
}

export type TCart = Pick<IProduct, 'id' | 'title' | 'price'>;
export type TCard = Pick<IProduct, 'description'| 'image' | 'category' | 'title' |'price'>;
export type TFormDelivery = Pick<IOrderInfo, 'payment' | 'address' >;
export type TFormContact = Pick<IOrderInfo, 'email' | 'phone'>;


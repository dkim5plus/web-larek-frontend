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
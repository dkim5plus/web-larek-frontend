import { Api, ApiListResponse } from './base/api';
import { IOrderInfo, IProduct } from '../types';

interface IAppApi {
    getCards(): Promise<IProduct[]>,
    postOrder(order: IOrderInfo): Promise<{ id: string, total: number}>,
}

export class AppApi extends Api implements IAppApi {
    readonly cdn: string;

    constructor(baseUrl: string, cdn: string, options?: RequestInit) {
        super(baseUrl, options);
        this.cdn = cdn;
    }

    getCards(): Promise<IProduct[]> {
		return this.get('/product').then((data: ApiListResponse<IProduct>) =>
			data.items.map((item) => ({
				...item,
				image: this.cdn + item.image,
			}))
		);
	}

    postOrder(order: IOrderInfo) {
        return this.post('/order', order)
            .then((data: { id: string, total: number}) => data);
    }
}
export interface Product {
    id: number;
    name: string;
    category: string;
    brand: string;
    price: number;
    discount?: number;
    rating: number;
    images: string[];
    inStock: boolean;
    description: string;
    stockCount?: number;
}
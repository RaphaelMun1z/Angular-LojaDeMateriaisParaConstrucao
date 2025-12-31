export interface FilterState {
    categories: string[];
    brands: string[];
    minPrice: number;
    maxPrice: number;
    inStock: boolean;
    onSale: boolean;
    rating: string | number;
}
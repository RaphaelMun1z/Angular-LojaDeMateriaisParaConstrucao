import { Product } from "../interfaces/Product";

export const MOCK_PRODUCTS: Product[] = [
    {
        id: 1,
        name: 'Cimento CP II-E-32 50kg Votorantim',
        category: 'Cimento & Argamassa',
        brand: 'Votorantim',
        price: 34.90,
        rating: 4.8,
        images: ['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&auto=format&fit=crop&q=60'],
        inStock: true,
        description: 'Cimento de alta qualidade para obras em geral.',
        stockCount: 50
    },
    {
        id: 2,
        name: 'Furadeira Parafusadeira Impacto 12V',
        category: 'Ferramentas',
        brand: 'Bosch',
        price: 289.90,
        discount: 10,
        rating: 4.5,
        images: ['https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=500&auto=format&fit=crop&q=60'],
        inStock: true,
        description: 'Ideal para trabalhos domésticos e profissionais leves.',
        stockCount: 5
    },
    {
        id: 3,
        name: 'Tinta Acrílica Fosca Premium Branco 18L',
        category: 'Tintas',
        brand: 'Suvinil',
        price: 429.90,
        rating: 5.0,
        images: ['https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=500&auto=format&fit=crop&q=60'],
        inStock: true,
        description: 'Alta cobertura e rendimento para paredes internas e externas.',
        stockCount: 20
    },
    {
        id: 4,
        name: 'Piso Porcelanato Polido 60x60cm',
        category: 'Pisos & Revestimentos',
        brand: 'Portinari',
        price: 89.90,
        rating: 4.7,
        images: ['https://images.unsplash.com/photo-1620626012053-1c167f708230?w=500&auto=format&fit=crop&q=60'],
        inStock: false,
        description: 'Elegância e sofisticação para sua sala ou quarto.',
        stockCount: 0
    },
    {
        id: 5,
        name: 'Kit de Chaves de Fenda e Phillips',
        category: 'Ferramentas',
        brand: 'Tramontina',
        price: 45.50,
        rating: 4.2,
        images: ['https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500&auto=format&fit=crop&q=60'],
        inStock: true,
        description: 'Kit essencial para reparos do dia a dia.',
        stockCount: 3 
    }
];
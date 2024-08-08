export interface Product {
  name: string;
  stock: number;
  price: number;
}

export interface Category {
  name: string;
  products: Product[];
}

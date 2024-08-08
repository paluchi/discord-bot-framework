import { Category, Product } from "../domain/catalogue";

// REPOSITORIES
export interface ICatalogueRepository {
  getCatalogue(): Category[];
  getCategoriesNames(): { name: string }[];
  getProductById(categoryId: string, productId: string): Product | undefined;
  getCategoryById(id: string): Category | undefined;
}

// SERVICES
export interface ICatalogueService {
  getCategories(): { name: string }[];
  getProductsByCategory(categoryName: string): Product[];
  checkStock(productName: string, amount: number): boolean;
}

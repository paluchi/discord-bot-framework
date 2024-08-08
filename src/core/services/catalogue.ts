import { Product } from "../domain/catalogue";
import { ICatalogueRepository, ICatalogueService } from "./types";

class CatalogueService implements ICatalogueService {
  private repository: ICatalogueRepository;

  constructor(repository: ICatalogueRepository) {
    this.repository = repository;
  }

  getCategories(): { name: string }[] {
    const catalogue = this.repository.getCatalogue();
    return catalogue.map((category) => ({ name: category.name }));
  }

  getProductsByCategory(categoryName: string): Product[] {
    const catalogue = this.repository.getCatalogue();
    const category = catalogue.find((cat) => cat.name === categoryName);
    return category ? category.products : [];
  }

  checkStock(productName: string, amount: number): boolean {
    const catalogue = this.repository.getCatalogue();
    for (const category of catalogue) {
      const product = category.products.find(
        (prod) => prod.name === productName
      );
      if (product) {
        return product.stock >= amount;
      }
    }
    return false;
  }
}

export default CatalogueService;

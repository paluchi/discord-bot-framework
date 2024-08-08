import { Category, Product } from "../../core/domain/catalogue";
import { ICatalogueRepository } from "../../core/services/types";

export class CatalogueRepository implements ICatalogueRepository {
  private catalogue: Category[];

  constructor() {
    this.catalogue = [
      {
        name: "E-Liquids",
        products: [
          { name: "Strawberry Blast", stock: 120, price: 19.99 },
          { name: "Mango Tango", stock: 85, price: 17.99 },
          { name: "Cool Mint", stock: 200, price: 14.99 },
        ],
      },
      {
        name: "Vape Devices",
        products: [
          { name: "Vape Pen 22", stock: 50, price: 29.99 },
          { name: "Smok Nord 4", stock: 30, price: 39.99 },
          { name: "GeekVape Aegis", stock: 20, price: 59.99 },
        ],
      },
      {
        name: "Accessories",
        products: [
          { name: "Replacement Coils", stock: 150, price: 9.99 },
          { name: "Vape Battery", stock: 60, price: 12.99 },
          { name: "Carrying Case", stock: 40, price: 7.99 },
        ],
      },
      {
        name: "Disposable Vapes",
        products: [
          { name: "Puff Bar Plus", stock: 100, price: 12.99 },
          { name: "Hyde Edge", stock: 80, price: 15.99 },
          { name: "Cali Bars", stock: 120, price: 13.99 },
        ],
      },
    ];
  }

  getCatalogue(): Category[] {
    return this.catalogue;
  }

  getCategoriesNames(): { name: string }[] {
    return this.catalogue.map((category) => ({ name: category.name }));
  }

  getProductById(categoryId: string, productId: string): Product | undefined {
    const category = this.catalogue.find((cat) => cat.name === categoryId);
    return category
      ? category.products.find((prod) => prod.name === productId)
      : undefined;
  }

  getCategoryById(id: string): Category | undefined {
    return this.catalogue.find((cat) => cat.name === id);
  }
}

export default CatalogueRepository;

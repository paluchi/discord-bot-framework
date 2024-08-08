import client from "./client";

import CatalogueRepository from "../adapters/repositories/catalogue";
import CatalogueService from "../core/services/catalogue";

export const catalogueRepository = new CatalogueRepository();
export const catalogueService = new CatalogueService(catalogueRepository);

export default client;

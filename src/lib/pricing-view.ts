// Purchase details are fetched by service ID on the purchase page. Transport
// only the fields used by the catalog instead of duplicating descriptions,
// provider payloads and custom-field schemas inside the navigation RSC payload.
export function createPricingView(categories: any[]): any[] {
  return categories.map(category => ({
    name: category.name,
    services: category.services.map((service: any) => ({
      id: service.id, name: service.name, groupName: service.groupName,
      dhruId: service.dhruId, isActive: service.isActive, time: service.time,
      finalPrice: service.finalPrice, price: service.price,
      credit: service.credit, margin: service.margin,
    })),
  }));
}

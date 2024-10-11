// Data for generating random receipts
const stores = ['Food Lion', 'Whole Foods', 'Harris Teeter', 'Kroger', 'Target', 'Walmart', 'Costco', 'CVS', 'Office Depot', 'PetSmart', 'Home Depot', 'Shell'];
const departments = ['Produce', 'Dairy', 'Meat', 'Seafood', 'Bakery', 'Canned Goods', 'Dry Goods', 'Snacks', 'Beverages', 'Alcohol', 'Personal Care', 'Household', 'Pharmacy', 'Stationery', 'Pet Supplies', 'Clothing', 'Tools', 'Hardware', 'Electrical', 'Automotive', 'Fuel'];

const genericItems: {[key: string]: string[]} = {
  'Produce': ['Apples', 'Bananas', 'Oranges', 'Strawberries', 'Grapes', 'Blueberries', 'Kale', 'Spinach', 'Carrots', 'Tomatoes', 'Potatoes', 'Onions'],
  'Dairy': ['Milk', 'Cheese', 'Yogurt', 'Butter', 'Eggs', 'Cream'],
  'Meat': ['Ground Beef', 'Chicken Breast', 'Pork Chops', 'Bacon', 'Sausages', 'Steak'],
  'Seafood': ['Salmon', 'Shrimp', 'Cod', 'Tuna', 'Tilapia', 'Crab'],
  'Bakery': ['Bread', 'Bagels', 'Muffins', 'Cookies', 'Cake'],
  'Canned Goods': ['Canned Tomatoes', 'Canned Beans', 'Canned Corn', 'Canned Soup', 'Canned Tuna'],
  'Dry Goods': ['Pasta', 'Rice', 'Cereal', 'Flour', 'Sugar'],
  'Snacks': ['Potato Chips', 'Pretzels', 'Popcorn', 'Crackers', 'Nuts'],
  'Beverages': ['Soda', 'Water', 'Coffee', 'Tea', 'Juice'],
  'Alcohol': ['Beer', 'Wine', 'Vodka', 'Whiskey'],
  'Personal Care': ['Toothpaste', 'Shampoo', 'Deodorant', 'Soap', 'Lotion'],
  'Household': ['Toilet Paper', 'Paper Towels', 'Laundry Detergent', 'Dish Soap', 'Trash Bags'],
  'Pharmacy': ['Aspirin', 'Bandages', 'Vitamins', 'Cough Syrup', 'Allergy Medicine'],
  'Stationery': ['Notebook', 'Pens', 'Pencils', 'Stapler', 'Printer Paper'],
  'Pet Supplies': ['Dog Food', 'Cat Food', 'Cat Litter', 'Pet Toys', 'Fish Food'],
  'Clothing': ['T-shirts', 'Jeans', 'Socks', 'Underwear', 'Shoes'],
  'Tools': ['Hammer', 'Screwdrivers', 'Pliers', 'Wrench', 'Drill'],
  'Hardware': ['Nails', 'Screws', 'Duct Tape', 'Glue', 'Sandpaper'],
  'Electrical': ['Light Bulbs', 'Batteries', 'Extension Cord', 'Power Strip', 'Flashlight'],
  'Automotive': ['Motor Oil', 'Washer Fluid', 'Antifreeze', 'Car Wax', 'Air Freshener'],
  'Fuel': ['Gasoline', 'Diesel']
};

const brands: {[key: string]: string[]} = {
  'Produce': ['Dole', 'Chiquita', 'Del Monte', 'Green Giant', 'Sunkist', 'Driscoll\'s'],
  'Dairy': ['Horizon', 'Organic Valley', 'Tillamook', 'Land O\'Lakes', 'Darigold', 'Chobani'],
  'Meat': ['Tyson', 'Perdue', 'Smithfield', 'Oscar Mayer', 'Hormel', 'Boar\'s Head'],
  'Seafood': ['Bumble Bee', 'StarKist', 'Gorton\'s', 'Chicken of the Sea', 'SeaPak', 'High Liner'],
  'Bakery': ['Sara Lee', 'Pepperidge Farm', 'Entenmann\'s', 'Thomas\'', 'Nature\'s Own', 'Wonder'],
  'Canned Goods': ['Campbell\'s', 'Progresso', 'Hunt\'s', 'Del Monte', 'Green Giant', 'Bush\'s'],
  'Dry Goods': ['Barilla', 'Uncle Ben\'s', 'Quaker', 'King Arthur', 'Domino'],
  'Snacks': ['Lay\'s', 'Rold Gold', 'Orville Redenbacher\'s', 'Ritz', 'Planters'],
  'Beverages': ['Coca-Cola', 'Pepsi', 'Dasani', 'Folgers', 'Lipton', 'Tropicana'],
  'Alcohol': ['Budweiser', 'Barefoot', 'Smirnoff', 'Jack Daniel\'s'],
  'Personal Care': ['Crest', 'Pantene', 'Old Spice', 'Dove', 'Neutrogena'],
  'Household': ['Charmin', 'Bounty', 'Tide', 'Dawn', 'Glad'],
  'Pharmacy': ['Advil', 'Band-Aid', 'Nature Made', 'Robitussin', 'Claritin'],
  'Stationery': ['Five Star', 'Bic', 'Swingline', 'HP'],
  'Pet Supplies': ['Purina', 'Tidy Cats', 'KONG', 'Tetra'],
  'Clothing': ['Hanes', 'Levi\'s', 'Nike', 'Fruit of the Loom'],
  'Tools': ['Stanley', 'DeWalt', 'Craftsman', 'Black & Decker'],
  'Hardware': ['3M', 'Gorilla Glue', 'Norton'],
  'Electrical': ['Philips', 'Duracell', 'Belkin'],
  'Automotive': ['Mobil', 'Rain-X', 'Prestone', 'Turtle Wax', 'Febreze'],
  'Fuel': ['Shell', 'Exxon', 'Chevron']
};

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export function generateReceipt(id: number) {
  const store = stores[Math.floor(Math.random() * stores.length)];
  const date = randomDate(new Date(2022, 0, 1), new Date()).toISOString().split('T')[0];
  const numItems = Math.floor(Math.random() * 10) + 1;
  let total = 0;
  const items = [];

  for (let i = 0; i < numItems; i++) {
    const department = departments[Math.floor(Math.random() * departments.length)];
    const genericName = genericItems[department][Math.floor(Math.random() * genericItems[department].length)];
    const brand = brands[department][Math.floor(Math.random() * brands[department].length)];
    const price = +(Math.random() * 20 + 0.5).toFixed(2);
    total += price;

    items.push({
      name: `${brand} ${genericName}`,
      genericName,
      price,
      department
    });
  }

  return {
    id: id.toString(),
    items,
    total: +total.toFixed(2),
    store,
    date
  };
}
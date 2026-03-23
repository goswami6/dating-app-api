# E-Commerce Category Products Setup

## Overview
The e-commerce module has been enhanced with category-based product browsing. Categories include **Men**, **Women**, **Gifts**, and **Accessories** with 8 products each.

## Sample Data Structure

### Categories
- **Men** - Clothing, accessories, and gifts for men (8 products)
- **Women** - Clothing, accessories, and gifts for women (8 products)  
- **Gifts** - Perfect gifts for every occasion (8 products)
- **Accessories** - Stylish accessories for everyone (8 products)

### Product Fields
Each product includes:
- `id` - Unique identifier
- `name` - Product name
- `price` - Price in INR (Indian Rupees)
- `currency` - Currency code (default: INR)
- `icon` - Emoji/icon representation (🧥, 👗, 🎁, etc.)
- `description` - Product description
- `images` - Array of image URLs (optional)
- `categoryId` - Reference to category
- `isActive` - Product visibility status

## API Endpoints

### 1. Get All Categories
```
GET /api/shop/categories
```
Returns all shop categories with optional sub-categories.

**Response:**
```json
{
  "success": true,
  "message": "Categories retrieved",
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Men",
        "slug": "men",
        "description": "Clothing, accessories, and gifts for men",
        "isActive": true,
        "sortOrder": 1
      }
    ]
  }
}
```

### 2. Get Category with Products by ID
```
GET /api/shop/categories/{id}/products?page=1&limit=20
```
Returns category details with all its products.

**Example:**
```
GET /api/shop/categories/1/products
```

**Response:**
```json
{
  "success": true,
  "message": "Category products retrieved",
  "data": {
    "category": {
      "id": 1,
      "name": "Men",
      "slug": "men",
      "description": "Clothing, accessories, and gifts for men",
      "image": null
    },
    "products": [
      {
        "id": 1,
        "name": "Leather Jacket",
        "price": "1499.00",
        "currency": "INR",
        "icon": "🧥",
        "description": "Premium leather jacket for men",
        "image": null
      },
      {
        "id": 2,
        "name": "Casual Shirt",
        "price": "799.00",
        "currency": "INR",
        "icon": "👕",
        "description": "Comfortable casual shirt",
        "image": null
      }
    ],
    "pagination": {
      "total": 8,
      "page": 1,
      "limit": 20
    }
  }
}
```

### 3. Get Category with Products by Slug
```
GET /api/shop/categories/slug/{slug}/products?page=1&limit=20
```
Returns category with products using category slug (URL-friendly name).

**Examples:**
```
GET /api/shop/categories/slug/men/products
GET /api/shop/categories/slug/women/products
GET /api/shop/categories/slug/gifts/products
GET /api/shop/categories/slug/accessories/products
```

### 4. Get Category by ID
```
GET /api/shop/categories/{id}
```
Returns only category details.

### 5. Get Top-Level Categories
```
GET /api/shop/categories/top-level
```
Returns only root categories (useful for navbar/menu).

### 6. Get All Products with Filters
```
GET /api/shop/products?categoryId=1&page=1&limit=20
```
Filter products by category and other criteria (already supported).

## Category Data Seeded

On first database initialization, the following categories are automatically created:

### Men Products (ID: 1)
1. Leather Jacket - ₹1,499 🧥
2. Casual Shirt - ₹799 👕
3. Denim Jeans - ₹1,200 👖
4. Sneakers - ₹2,500 👟
5. Polo T-Shirt - ₹699 👕
6. Men's Watch - ₹3,500 ⌚
7. Leather Wallet - ₹499 👛
8. Formal Shoes - ₹1,800 👞

### Women Products (ID: 2)
1. Floral Dress - ₹1,800 👗
2. Handbag - ₹2,200 👜
3. Heels - ₹1,500 👠
4. Necklace - ₹999 📿
5. Designer Saree - ₹4,500 👘
6. Earrings Set - ₹299 👂
7. Makeup Kit - ₹1,200 💄
8. Sunglasses - ₹850 🕶️

### Gifts Products (ID: 3)
1. Rose Bouquet - ₹350 🌹
2. Chocolate Box - ₹500 🍫
3. Teddy Bear - ₹800 🧸
4. Gift Card - ₹1,000 💳
5. Coffee Mug - ₹250 ☕
6. Photo Frame - ₹450 🖼️
7. Birthday Card - ₹99 🎂
8. Perfume Set - ₹1,500 💨

### Accessories Products (ID: 4)
1. Cool Sunglasses - ₹500 🕶️
2. Smart Watch - ₹3,500 ⌚
3. Leather Belt - ₹600 🏷️
4. Compact Wallet - ₹450 👛
5. Baseball Cap - ₹350 🧢
6. Backpack - ₹1,200 🎒
7. Mini Umbrella - ₹400 🌂
8. Silk Scarf - ₹300 🧣

## Database Initialization

When the server starts for the first time:
1. ✅ Creates database (if not exists)
2. ✅ Syncs schema for all models
3. ✅ Seeds categories and products

To reseed the database:
```bash
node syncDatabase.js
```

## Frontend Integration Example

### React/Vue - Display Categories
```javascript
// Fetch categories
const categoriesResponse = await fetch('/api/shop/categories/top-level', {
  headers: { 'x-api-key': 'YOUR_API_KEY' }
});
const { data } = await categoriesResponse.json();

// For each category, fetch products
for (const category of data.categories) {
  const productsResponse = await fetch(
    `/api/shop/categories/${category.id}/products?limit=8`,
    { headers: { 'x-api-key': 'YOUR_API_KEY' } }
  );
  const categoryData = await productsResponse.json();
  console.log(categoryData.data);
}
```

## Model Changes

### ShopProduct Model
Added new field:
- `icon` (STRING) - Emoji or icon representation of the product

### Database Schema
No breaking changes. New column automatically migrated via `sequelize.sync({ alter: true })`.

## Files Modified

1. **syncDatabase.js** - Added `seedCategoriesAndProducts()` function
2. **src/models/shopProductModel.js** - Added `icon` field
3. **src/controllers/shopCategoryController.js** - Added `getCategoryProducts()` and `getCategoryProductsBySlug()`
4. **src/services/shopCategoryService.js** - Added `getCategoryWithProducts()` and `getCategoryProductsBySlug()`
5. **src/routes/shopCategoryRoutes.js** - Added new routes with Swagger documentation

## Next Steps

1. ✅ Run `npm install` (if needed)
2. ✅ Start server: `npm start` or `node server.js`
3. ✅ Visit `http://localhost:3000/api-docs` to test endpoints
4. ✅ Start building your e-commerce UI

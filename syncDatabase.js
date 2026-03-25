const mysql = require('mysql2/promise');
const { DataTypes } = require('sequelize');
require('dotenv').config();

const { sequelize, MatchCriteria, Message, Subscription, Call, ShopCategory, ShopProduct, ShopCart, ShopWishlist, ShopAddress, ShopOrder, ShopOrderItem, Wallet, WalletTransaction, RandomChat, RandomChatMessage, Booking } = require('./src/models');

async function ensureMatchCriteriaColumns() {
    const queryInterface = sequelize.getQueryInterface();
    let tableDefinition;

    try {
        tableDefinition = await queryInterface.describeTable('match_criteria');
    } catch (error) {
        return;
    }

    const missingColumns = [
        {
            name: 'relationshipGoals',
            definition: {
                type: DataTypes.JSON,
                allowNull: true,
                defaultValue: [],
                comment: 'Array of relationship goals with title/icon'
            }
        },
        {
            name: 'pronouns',
            definition: {
                type: DataTypes.JSON,
                allowNull: true,
                defaultValue: [],
                comment: 'Array of pronouns'
            }
        },
        {
            name: 'height',
            definition: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Height as text (e.g. 5\'8")'
            }
        },
        {
            name: 'languages',
            definition: {
                type: DataTypes.JSON,
                allowNull: true,
                defaultValue: [],
                comment: 'Array of languages'
            }
        },
        {
            name: 'zodiacSign',
            definition: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Zodiac sign'
            }
        },
        {
            name: 'educationLevel',
            definition: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Education level'
            }
        },
        {
            name: 'familyPlan',
            definition: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Family plan option'
            }
        },
        {
            name: 'communicationStyle',
            definition: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Communication style'
            }
        },
        {
            name: 'loveStyle',
            definition: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Love style'
            }
        },
        {
            name: 'petPreference',
            definition: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Pet preference'
            }
        },
        {
            name: 'drinking',
            definition: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Drinking option'
            }
        },
        {
            name: 'smoking',
            definition: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Smoking option'
            }
        },
        {
            name: 'workout',
            definition: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Workout frequency'
            }
        },
        {
            name: 'socialMedia',
            definition: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Social media usage'
            }
        },
        {
            name: 'school',
            definition: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'School name (text)'
            }
        },
        {
            name: 'jobTitle',
            definition: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Job title (text)'
            }
        },
        {
            name: 'livingIn',
            definition: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Living in (location)'
            }
        },
        {
            name: 'sexualOrientation',
            definition: {
                type: DataTypes.JSON,
                allowNull: true,
                defaultValue: [],
                comment: 'Array of sexual orientation objects (title/description)'
            }
        }
    ];

    for (const column of missingColumns) {
        if (!tableDefinition[column.name]) {
            await queryInterface.addColumn('match_criteria', column.name, column.definition);
            console.log(`Added missing column match_criteria.${column.name}`);
        }
    }
}

async function syncDatabaseSchema() {
    await MatchCriteria.sync();
    await ensureMatchCriteriaColumns();
    await Message.sync();
    await Subscription.sync();
    await Call.sync();
    await ShopCategory.sync();
    await ShopProduct.sync();
    await ShopCart.sync();
    await ShopWishlist.sync();
    await ShopAddress.sync();
    await ShopOrder.sync();
    await ShopOrderItem.sync();
    await Wallet.sync();
    await WalletTransaction.sync();
    await RandomChat.sync();
    await RandomChatMessage.sync();
    await Booking.sync();
}

async function seedCategoriesAndProducts() {
    try {
        // Check if categories already exist
        const existingCategories = await ShopCategory.count();
        if (existingCategories > 0) {
            console.log('Categories already seeded, skipping...');
            return;
        }

        // Category data
        const categoryData = [
            {
                name: 'Men',
                slug: 'men',
                description: 'Clothing, accessories, and gifts for men',
                isActive: true,
                sortOrder: 1
            },
            {
                name: 'Women',
                slug: 'women',
                description: 'Clothing, accessories, and gifts for women',
                isActive: true,
                sortOrder: 2
            },
            {
                name: 'Gifts',
                slug: 'gifts',
                description: 'Perfect gifts for every occasion',
                isActive: true,
                sortOrder: 3
            },
            {
                name: 'Accessories',
                slug: 'accessories',
                description: 'Stylish accessories for everyone',
                isActive: true,
                sortOrder: 4
            }
        ];

        // Create categories
        const categories = await ShopCategory.bulkCreate(categoryData);
        console.log(`${categories.length} categories created`);

        // Product data mapped to categories
        const productsData = [
            // Men products
            { categoryId: categories[0].id, name: 'Leather Jacket', price: 1499, currency: 'INR', icon: '🧥', description: 'Premium leather jacket for men' },
            { categoryId: categories[0].id, name: 'Casual Shirt', price: 799, currency: 'INR', icon: '👕', description: 'Comfortable casual shirt' },
            { categoryId: categories[0].id, name: 'Denim Jeans', price: 1200, currency: 'INR', icon: '👖', description: 'Classic denim jeans' },
            { categoryId: categories[0].id, name: 'Sneakers', price: 2500, currency: 'INR', icon: '👟', description: 'Stylish sneakers' },
            { categoryId: categories[0].id, name: 'Polo T-Shirt', price: 699, currency: 'INR', icon: '👕', description: 'Classic polo t-shirt' },
            { categoryId: categories[0].id, name: "Men's Watch", price: 3500, currency: 'INR', icon: '⌚', description: 'Elegant mens watch' },
            { categoryId: categories[0].id, name: 'Leather Wallet', price: 499, currency: 'INR', icon: '👛', description: 'Premium leather wallet' },
            { categoryId: categories[0].id, name: 'Formal Shoes', price: 1800, currency: 'INR', icon: '👞', description: 'Formal dress shoes' },
            // Women products
            { categoryId: categories[1].id, name: 'Floral Dress', price: 1800, currency: 'INR', icon: '👗', description: 'Beautiful floral dress' },
            { categoryId: categories[1].id, name: 'Handbag', price: 2200, currency: 'INR', icon: '👜', description: 'Stylish handbag' },
            { categoryId: categories[1].id, name: 'Heels', price: 1500, currency: 'INR', icon: '👠', description: 'Elegant heels' },
            { categoryId: categories[1].id, name: 'Necklace', price: 999, currency: 'INR', icon: '📿', description: 'Beautiful necklace' },
            { categoryId: categories[1].id, name: 'Designer Saree', price: 4500, currency: 'INR', icon: '👘', description: 'Traditional designer saree' },
            { categoryId: categories[1].id, name: 'Earrings Set', price: 299, currency: 'INR', icon: '👂', description: 'Elegant earrings set' },
            { categoryId: categories[1].id, name: 'Makeup Kit', price: 1200, currency: 'INR', icon: '💄', description: 'Complete makeup kit' },
            { categoryId: categories[1].id, name: 'Sunglasses', price: 850, currency: 'INR', icon: '🕶️', description: 'Fashionable sunglasses' },
            // Gifts products
            { categoryId: categories[2].id, name: 'Rose Bouquet', price: 350, currency: 'INR', icon: '🌹', description: 'Beautiful rose bouquet' },
            { categoryId: categories[2].id, name: 'Chocolate Box', price: 500, currency: 'INR', icon: '🍫', description: 'Premium chocolate box' },
            { categoryId: categories[2].id, name: 'Teddy Bear', price: 800, currency: 'INR', icon: '🧸', description: 'Cute teddy bear' },
            { categoryId: categories[2].id, name: 'Gift Card', price: 1000, currency: 'INR', icon: '💳', description: 'Digital gift card' },
            { categoryId: categories[2].id, name: 'Coffee Mug', price: 250, currency: 'INR', icon: '☕', description: 'Personalized coffee mug' },
            { categoryId: categories[2].id, name: 'Photo Frame', price: 450, currency: 'INR', icon: '🖼️', description: 'Wooden photo frame' },
            { categoryId: categories[2].id, name: 'Birthday Card', price: 99, currency: 'INR', icon: '🎂', description: 'Greeting birthday card' },
            { categoryId: categories[2].id, name: 'Perfume Set', price: 1500, currency: 'INR', icon: '💨', description: 'Fragrance perfume set' },
            // Accessories products
            { categoryId: categories[3].id, name: 'Cool Sunglasses', price: 500, currency: 'INR', icon: '🕶️', description: 'Cool sunglasses' },
            { categoryId: categories[3].id, name: 'Smart Watch', price: 3500, currency: 'INR', icon: '⌚', description: 'Smart watch with tracking' },
            { categoryId: categories[3].id, name: 'Leather Belt', price: 600, currency: 'INR', icon: '🏷️', description: 'Premium leather belt' },
            { categoryId: categories[3].id, name: 'Compact Wallet', price: 450, currency: 'INR', icon: '👛', description: 'Compact design wallet' },
            { categoryId: categories[3].id, name: 'Baseball Cap', price: 350, currency: 'INR', icon: '🧢', description: 'Casual baseball cap' },
            { categoryId: categories[3].id, name: 'Backpack', price: 1200, currency: 'INR', icon: '🎒', description: 'Durable backpack' },
            { categoryId: categories[3].id, name: 'Mini Umbrella', price: 400, currency: 'INR', icon: '🌂', description: 'Compact umbrella' },
            { categoryId: categories[3].id, name: 'Silk Scarf', price: 300, currency: 'INR', icon: '🧣', description: 'Elegant silk scarf' }
        ];

        // Add slug and isActive to each product
        const productsWithRequiredFields = productsData.map(product => ({
            ...product,
            slug: (product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) + '-' + Date.now() + Math.random(),
            isActive: true,
            shortDescription: product.description
        }));

        const products = await ShopProduct.bulkCreate(productsWithRequiredFields);
        console.log(`${products.length} products created`);
    } catch (error) {
        console.error('Error seeding categories and products:', error);
        throw error;
    }
}

async function initializeDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
        console.log(`Database '${process.env.DB_NAME}' checked/created.`);
        await connection.end();

        await syncDatabaseSchema();
        await seedCategoriesAndProducts();
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

module.exports = {
    initializeDatabase,
    syncDatabaseSchema,
};

if (require.main === module) {
    initializeDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

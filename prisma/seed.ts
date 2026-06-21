import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcrypt';


const prisma = new PrismaClient();

async function main() {

    const hashedPassword = await hash('12345', 10);
    // USERS
    const admin = await prisma.user.upsert({
        where: { email: 'admin@gmail.com' },
        update: {},
        create: {
            email: 'admin@gmail.com',
            name: 'Admin',
            password: hashedPassword,
            role: Role.ADMIN,
            phone: '0900000001'
        },
    });

    const customer1 = await prisma.user.upsert({
        where: { email: 'customer1@gmail.com' },
        update: {},
        create: {
            email: 'customer1@gmail.com',
            name: 'Customer 1',
            password: hashedPassword,
            role: Role.CUSTOMER,
            phone: '0900000002',
        },
    });

    const customer2 = await prisma.user.upsert({
        where: { email: 'customer2@gmail.com' },
        update: {},
        create: {
            email: 'customer2@gmail.com',
            name: 'Customer 2',
            password: hashedPassword,
            role: Role.CUSTOMER,
            phone: '0900000003',
        },
    });

    await prisma.address.createMany({
        data: [
            {
                userId: admin.id,
                street: '123 Nguyễn Huệ',
                ward: 'Bến Nghé',
                wardCode: 20101,
                district: 'Quận 1',
                districtId: 1442,
                city: 'Thành phố Hồ Chí Minh',
                cityId: 202,
                isDefault: true,
            },
            {
                userId: customer1.id,
                street: '45 Lê Lợi',
                ward: 'Bến Thành',
                wardCode: 20102,
                district: 'Quận 1',
                districtId: 1442,
                city: 'Thành phố Hồ Chí Minh',
                cityId: 202,
                isDefault: true,
            },
            {
                userId: customer2.id,
                street: '88 Võ Văn Tần',
                ward: 'Phường 6',
                wardCode: 20306,
                district: 'Quận 3',
                districtId: 1444,
                city: 'Thành phố Hồ Chí Minh',
                cityId: 202,
                isDefault: true,
            },
        ],
    });
    // CATEGORIES
    const electronics = await prisma.category.create({
        data: {
            name: 'Electronics',
        },
    });

    const fashion = await prisma.category.create({
        data: {
            name: 'Fashion',
        },
    });

    // POSTS
    const post1 = await prisma.post.create({
        data: {
            title: 'iPhone 15 Pro Max',
            content: 'Brand new iPhone 15 Pro Max 256GB',
            authorId: customer1.id,
            categoryId: electronics.id,
            weight: 5000,
            width: 5,
            length: 15,
            height: 10
        },
    });

    const post2 = await prisma.post.create({
        data: {
            title: 'Nike Hoodie',
            content: 'Nike hoodie size L',
            authorId: customer1.id,
            categoryId: fashion.id,
            weight: 5000,
            width: 5,
            length: 15,
            height: 10
        },
    });

    const post3 = await prisma.post.create({
        data: {
            title: 'MacBook Air M2',
            content: 'MacBook Air M2 16GB RAM',
            authorId: customer2.id,
            categoryId: electronics.id,
            weight: 10000,
            width: 5,
            length: 15,
            height: 10
        },
    });

    // IMAGES
    await prisma.image.createMany({
        data: [
            {
                url: 'https://example.com/iphone.jpg',
                description: 'iPhone image',
                postId: post1.id,
                isAvatar: true
            },
            {
                url: 'https://example.com/hoodie.jpg',
                description: 'Nike hoodie image',
                postId: post2.id,
                isAvatar: true
            },
            {
                url: 'https://example.com/macbook.jpg',
                description: 'MacBook image',
                postId: post3.id,
                isAvatar: true
            },
        ],
    });

    // CONVERSATIONS
    const conversation1 = await prisma.conversation.create({
        data: {
            buyerId: admin.id,
            sellerId: customer1.id,
            postId: post1.id,
        },
    });

    const conversation2 = await prisma.conversation.create({
        data: {
            buyerId: admin.id,
            sellerId: customer1.id,
            postId: post2.id,
        },
    });

    // conversation giữa 2 customer
    const conversation3 = await prisma.conversation.create({
        data: {
            buyerId: customer1.id,
            sellerId: customer2.id,
            postId: post3.id,
        },
    });

    // MESSAGES
    await prisma.message.createMany({
        data: [
            // conversation 1
            {
                conversationId: conversation1.id,
                senderId: admin.id,
                content: 'Is this iPhone still available?',
            },
            {
                conversationId: conversation1.id,
                senderId: customer1.id,
                content: 'Yes, it is available.',
            },

            // conversation 2
            {
                conversationId: conversation2.id,
                senderId: admin.id,
                content: 'Can you reduce the price?',
            },
            {
                conversationId: conversation2.id,
                senderId: customer1.id,
                content: 'Sure, I can discount a little.',
            },

            // conversation 3
            {
                conversationId: conversation3.id,
                senderId: customer1.id,
                content: 'Is the MacBook still available?',
            },
            {
                conversationId: conversation3.id,
                senderId: customer2.id,
                content: 'Yes, it is still available.',
            },
            {
                conversationId: conversation3.id,
                senderId: customer1.id,
                content: 'Can you ship to Ho Chi Minh City?',
            },
            {
                conversationId: conversation3.id,
                senderId: customer2.id,
                content: 'Yes, I can.',
            },
        ],
    });

    console.log('Seed data created successfully!');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
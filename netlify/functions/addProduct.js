import { neon } from "@netlify/neon";
import jwt from "jsonwebtoken";

export const handler = async (event) => {
    const token = event.headers.authorization?.split(" ")[1];
    if (!token) return { statusCode: 401 };

    jwt.verify(token, process.env.JWT_SECRET);

    const { name, price, category, image } = JSON.parse(event.body);
    const sql = neon();

    await sql`
        INSERT INTO products (name, price, old_price, category, image)
        VALUES (${name}, ${price}, ${Math.round(price * 1.3)}, ${category}, ${image})
    `;

    return { statusCode: 200 };
};

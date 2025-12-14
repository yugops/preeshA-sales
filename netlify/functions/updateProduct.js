import { neon } from "@netlify/neon";
import jwt from "jsonwebtoken";

export const handler = async (event) => {
    const token = event.headers.authorization?.split(" ")[1];
    if (!token) return { statusCode: 401 };

    jwt.verify(token, process.env.JWT_SECRET);

    const { id, name, price, category } = JSON.parse(event.body);
    const sql = neon();

    await sql`
        UPDATE products
        SET name=${name},
            price=${price},
            old_price=${Math.round(price * 1.3)},
            category=${category}
        WHERE id=${id}
    `;

    return { statusCode: 200 };
};

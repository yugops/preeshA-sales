import { neon } from "@netlify/neon";
import jwt from "jsonwebtoken";

export const handler = async (event) => {
    const token = event.headers.authorization?.split(" ")[1];
    if (!token) return { statusCode: 401 };

    jwt.verify(token, process.env.JWT_SECRET);

    const { id } = JSON.parse(event.body);
    const sql = neon();

    await sql`DELETE FROM products WHERE id=${id}`;
    return { statusCode: 200 };
};

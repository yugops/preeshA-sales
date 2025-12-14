import { neon } from "@netlify/neon";
import jwt from "jsonwebtoken";

export const handler = async (event) => {
  try {
    const auth = event.headers.authorization;
    if (!auth) return { statusCode: 401 };

    const token = auth.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET);

    if (!event.body) {
      return { statusCode: 400, body: "Missing body" };
    }

    const { id, name, price, category } = JSON.parse(event.body);

    const sql = neon(process.env.NETLIFY_DATABASE_URL);

    await sql`
      UPDATE products
      SET
        name = ${name},
        price = ${price},
        old_price = ${Math.round(price * 1.3)},
        category = ${category}
      WHERE id = ${id}
    `;

    return { statusCode: 200 };
  } catch (err) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: err.message })
    };
  }
};

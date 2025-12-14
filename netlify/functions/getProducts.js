import { neon } from "@netlify/neon";

export const handler = async () => {
  try {
    const sql = neon(process.env.NETLIFY_DATABASE_URL);

    const products = await sql`
      SELECT id, name, price, old_price, category, image
      FROM products
      ORDER BY id DESC
    `;

    return {
      statusCode: 200,
      body: JSON.stringify(products)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};

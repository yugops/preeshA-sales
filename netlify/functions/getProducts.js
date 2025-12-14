import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { neon } = require("@netlify/neon");

export const handler = async () => {
  const sql = neon();

  const products = await sql`
    SELECT id, name, price, old_price, category, image
    FROM products
    ORDER BY id DESC
  `;

  return {
    statusCode: 200,
    body: JSON.stringify(products),
  };
};

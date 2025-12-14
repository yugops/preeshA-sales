import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { neon } = require("@netlify/neon");


export const handler = async (event) => {
  try {
    const auth = event.headers.authorization;
    if (!auth) return { statusCode: 401 };

    const token = auth.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET);

    const { name, price, category, image } = JSON.parse(event.body);

    const sql = neon(process.env.NETLIFY_DATABASE_URL);

    await sql`
      INSERT INTO products (name, price, old_price, category, image)
      VALUES (
        ${name},
        ${price},
        ${Math.round(price * 1.3)},
        ${category},
        ${image}
      )
    `;

    return { statusCode: 200 };
  } catch (err) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: err.message })
    };
  }
};


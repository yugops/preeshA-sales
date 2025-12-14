import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const handler = async (event) => {
  try {
    if (!event.body) {
      return { statusCode: 400, body: "Missing body" };
    }

    const { password } = JSON.parse(event.body);

    const isValid = bcrypt.compareSync(
      password,
      process.env.ADMIN_PASSWORD_HASH
    );

    if (!isValid) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid password" })
      };
    }

    const token = jwt.sign(
      { role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ token })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const handler = async (event) => {
    const { password } = JSON.parse(event.body);

    const isValid = bcrypt.compareSync(
        password,
        process.env.ADMIN_PASSWORD_HASH
    );

    if (!isValid) {
        return { statusCode: 401, body: "Invalid password" };
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
};

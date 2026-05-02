import jwt from "jsonwebtoken";

class TokenService {
  generateToken(userId: string): string {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET as string,
      {
        expiresIn: process.env.JWT_EXPIRE || "7d",
      } as jwt.SignOptions,
    );
  }

  generateRefreshToken(userId: string): string {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET as string,
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRE || "30d",
      } as jwt.SignOptions,
    );
  }

  verifyToken(token: string): { id: string } | null {
    try {
      return jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: string;
      };
    } catch (error) {
      return null;
    }
  }

  verifyRefreshToken(token: string): { id: string } | null {
    return this.verifyToken(token);
  }

  decodeToken(token: string): any {
    return jwt.decode(token);
  }
}

export default new TokenService();

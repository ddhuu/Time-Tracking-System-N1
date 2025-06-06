import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers?.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({
          message: 'Unauthorized',
        });
      }

      // Verify token
      const keyPath = path.resolve(
        process.cwd(),
        'src/storage/public/public-key.cert.txt',
      );
      const key = fs.readFileSync(keyPath, 'utf8');
      const decoded = jwt.verify(token, key);
      // Attach user data to request
      req['user'] = decoded;
    } catch (error) {
      console.log(error);
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    next();
  }
}

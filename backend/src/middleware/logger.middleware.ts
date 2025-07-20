import { Injectable, NestMiddleware } from "@nestjs/common";
import { log } from "console";
import { NextFunction } from "express"

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction){
        log('Request...');
        next();
    }
}
  
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'your-secret-key', // Match the secret from AuthModule
    });
  }

  async validate(payload: { sub: number; email: string }) {
    const user = await this.usersService.findByEmail(payload.email);
    return user ? { id: user.id, email: user.email, role: user.role } : null;
  }
}

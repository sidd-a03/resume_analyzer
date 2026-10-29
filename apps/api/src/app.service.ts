import { Injectable } from '@nestjs/common';
import { join } from 'path/posix';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}

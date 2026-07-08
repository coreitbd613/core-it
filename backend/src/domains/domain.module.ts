import { Module } from '@nestjs/common';
import { NamecheapModule } from '../namecheap/namecheap.module';
import { DomainController } from './domain.controller';
import { DomainService } from './domain.service';

@Module({
  imports: [NamecheapModule],
  controllers: [DomainController],
  providers: [DomainService],
})
export class DomainModule {}

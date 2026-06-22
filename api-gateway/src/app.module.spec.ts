import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { ChilensisResolver } from './resolvers/chilensis.resolver';
import { MicroserviciosService } from './services/microservicios.service';

describe('AppModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  it('debería ser definido', () => {
    expect(module).toBeDefined();
  });

  it('debería proporcionar ChilensisResolver', () => {
    const resolver = module.get<ChilensisResolver>(ChilensisResolver);
    expect(resolver).toBeDefined();
  });

  it('debería proporcionar MicroserviciosService', () => {
    const service = module.get<MicroserviciosService>(MicroserviciosService);
    expect(service).toBeDefined();
  });

  it('debería inyectar MicroserviciosService en ChilensisResolver', () => {
    const resolver = module.get<ChilensisResolver>(ChilensisResolver);
    const service = module.get<MicroserviciosService>(MicroserviciosService);

    expect(resolver).toBeDefined();
    expect(service).toBeDefined();
    expect(resolver['msService']).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('debería ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('getHello', () => {
    it('debe retornar "Hello World!"', () => {
      const resultado = service.getHello();
      expect(resultado).toBe('Hello World!');
    });

    it('debe retornar un string', () => {
      const resultado = service.getHello();
      expect(typeof resultado).toBe('string');
    });

    it('debe retornar exactamente el mismo valor en múltiples llamadas', () => {
      const resultado1 = service.getHello();
      const resultado2 = service.getHello();
      expect(resultado1).toBe(resultado2);
    });
  });
});

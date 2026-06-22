import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    controller = module.get<AppController>(AppController);
    service = module.get<AppService>(AppService);
  });

  it('debería ser definido', () => {
    expect(controller).toBeDefined();
  });

  describe('getHello', () => {
    it('debe retornar "Hello World!"', () => {
      const resultado = controller.getHello();
      expect(resultado).toBe('Hello World!');
    });

    it('debe llamar al servicio getHello', () => {
      jest.spyOn(service, 'getHello').mockReturnValue('Hello World!');

      const resultado = controller.getHello();

      expect(resultado).toBe('Hello World!');
      expect(service.getHello).toHaveBeenCalled();
    });

    it('debe retornar el valor del servicio', () => {
      const mensajeEsperado = 'Hello World!';
      jest.spyOn(service, 'getHello').mockReturnValue(mensajeEsperado);

      const resultado = controller.getHello();

      expect(resultado).toBe(mensajeEsperado);
    });
  });
});

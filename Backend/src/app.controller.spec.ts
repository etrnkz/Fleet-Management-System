import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;
  let service: AppService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    controller = module.get(AppController);
    service = module.get(AppService);
  });

  describe('getRoot', () => {
    it('should return API info object', () => {
      const result = controller.getRoot();
      expect(result).toHaveProperty('service');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('environment');
      expect(result).toHaveProperty('timestamp');
    });
  });

  describe('getHealth', () => {
    it('should return health status with OK', () => {
      const result = controller.getHealth();
      expect(result).toHaveProperty('status', 'OK');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('memoryUsage');
    });
  });

  describe('getStatus', () => {
    it('should return system status with operational', () => {
      const result = controller.getStatus();
      expect(result).toHaveProperty('status', 'operational');
      expect(result).toHaveProperty('metrics');
    });
  });

  describe('getVersion', () => {
    it('should return version info', () => {
      const result = controller.getVersion();
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('node');
    });
  });
});

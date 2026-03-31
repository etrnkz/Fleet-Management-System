import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  const mockAppService = {
    getApiInfo: jest.fn(),
    getHealthStatus: jest.fn(),
    getSystemStatus: jest.fn(),
    getVersionInfo: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRoot', () => {
    it('should return API information', () => {
      const mockResponse = {
        service: 'Fleet Management System API',
        description: 'Backend service for fleet operations',
        version: '1.0.0',
        environment: 'development',
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      mockAppService.getApiInfo.mockReturnValue(mockResponse);

      const result = appController.getRoot();

      expect(result).toEqual(mockResponse);
      expect(appService.getApiInfo).toHaveBeenCalledTimes(1);
    });
  });

  describe('getHealth', () => {
    it('should return health status with uptime', () => {
      const mockResponse = {
        status: 'OK',
        uptime: 42.5,
        timestamp: '2024-01-01T12:00:00.000Z',
        database: 'connected',
        memoryUsage: { heapUsed: '1 MB' },
      };

      mockAppService.getHealthStatus.mockReturnValue(mockResponse);

      const result = appController.getHealth();

      expect(result).toMatchObject({
        status: 'OK',
        database: 'connected',
      });
      expect(result.uptime).toBeGreaterThan(0);
      expect(result.timestamp).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(appService.getHealthStatus).toHaveBeenCalledTimes(1);
    });
  });

  describe('getStatus', () => {
    it('should return detailed system status', () => {
      const mockResponse = {
        service: 'Fleet Management API',
        status: 'operational',
        timestamp: '2024-01-01T12:00:00.000Z',
        metrics: {
          uptime: '0 minutes',
          memory: '10 MB used',
          cpu: { user: 1, system: 1 },
        },
        environment: 'development',
        pid: 12345,
      };

      mockAppService.getSystemStatus.mockReturnValue(mockResponse);

      const result = appController.getStatus();

      expect(result).toMatchObject({
        service: 'Fleet Management API',
        status: 'operational',
        environment: 'development',
      });
      expect(result.metrics).toHaveProperty('uptime');
      expect(appService.getSystemStatus).toHaveBeenCalledTimes(1);
    });
  });

  describe('getVersion', () => {
    it('should return version information', () => {
      const mockResponse = {
        version: '1.0.0',
        build: 'local',
        commit: 'development',
        buildDate: '2024-01-01T12:00:00.000Z',
        node: 'v20.10.0',
      };

      mockAppService.getVersionInfo.mockReturnValue(mockResponse);

      const result = appController.getVersion();

      expect(result).toMatchObject({
        version: '1.0.0',
        build: 'local',
        commit: 'development',
      });
      expect(result.node).toMatch(/v\d+\.\d+\.\d+/);
      expect(appService.getVersionInfo).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge cases', () => {
    it('should handle service throwing errors', () => {
      mockAppService.getApiInfo.mockImplementation(() => {
        throw new Error('Service error');
      });

      expect(() => appController.getRoot()).toThrow('Service error');
    });

    it('should return valid JSON structure even with missing env vars', () => {
      const originalEnv = { ...process.env };

      delete process.env.NODE_ENV;
      delete process.env.npm_package_version;

      mockAppService.getApiInfo.mockReturnValue({
        service: 'Fleet Management System API',
        description: 'desc',
        version: '1.0.0',
        environment: 'development',
        timestamp: '2024-01-01T12:00:00.000Z',
      });

      const result = appController.getRoot();

      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('environment');

      process.env = originalEnv;
    });
  });
});

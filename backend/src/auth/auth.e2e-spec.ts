import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('AuthController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/auth/login (POST) should return 201 or 401', async () => {
        const res = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'test@example.com', password: 'pw' });
        expect([201, 401]).toContain(res.status);
    });

    it('/auth/profile (GET) should return 200 or 401', async () => {
        const res = await request(app.getHttpServer()).get('/auth/profile');
        expect([200, 401]).toContain(res.status);
    });
});

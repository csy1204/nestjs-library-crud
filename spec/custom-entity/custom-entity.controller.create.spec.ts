import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { CustomEntity } from './custom-entity.entity';
import { CustomEntityModule } from './custom-entity.module';
import { CustomEntityService } from './custom-entity.service';
import { TestHelper } from '../test.helper';

describe('CustomEntity - Create', () => {
    let app: INestApplication;
    let service: CustomEntityService;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [CustomEntityModule, TestHelper.getTypeOrmMysqlModule([CustomEntity])],
        }).compile();
        app = moduleFixture.createNestApplication();

        service = moduleFixture.get<CustomEntityService>(CustomEntityService);
        await Promise.all(['name1', 'name2'].map((name: string) => service.repository.save(service.repository.create({ name }))));

        await app.init();
    });

    afterEach(async () => {
        await TestHelper.dropTypeOrmEntityTables();
        await app?.close();
    });

    describe('CREATE_ONE', () => {
        it('should be provided /', async () => {
            const routerPathList = TestHelper.getRoutePath(app.getHttpServer());
            expect(routerPathList.post).toEqual(expect.arrayContaining(['/base']));
        });

        it('creates one entity and returns it', async () => {
            const name = 'name1';
            const response = await request(app.getHttpServer()).post('/base').send({ name });

            expect(response.statusCode).toEqual(HttpStatus.CREATED);
            expect(response.body.name).toEqual(name);

            await request(app.getHttpServer()).get(`/base/${response.body.uuid}`).expect(HttpStatus.OK);
        });
    });

    describe('CREATE_MANY', () => {
        it('creates many entities and returns all', async () => {
            const toCreate = [{ name: 'name1' }, { name: 'name2' }];

            const response = await request(app.getHttpServer()).post('/base').send(toCreate);

            expect(response.statusCode).toEqual(HttpStatus.CREATED);
            expect(response.body).toHaveLength(toCreate.length);

            await request(app.getHttpServer()).get(`/base/${response.body[0].uuid}`).expect(HttpStatus.OK);
        });

        it('create value of unknown key', async () => {
            const toCreate = [{ name: 'name1' }, { name: 'name2', nonamed: 2 }];
            await request(app.getHttpServer()).post('/base').send(toCreate).expect(HttpStatus.UNPROCESSABLE_ENTITY);
        });
    });
});

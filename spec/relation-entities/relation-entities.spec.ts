import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { RelationEntitiesModule } from './relation-entities.module';
describe('Relation Entities Routes', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                RelationEntitiesModule({
                    category: {},
                    writer: {},
                    question: {},
                    comment: {},
                }),
            ],
        }).compile();
        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    it('should be provided route path for each', async () => {
        const routerPathList = app.getHttpServer()._events.request._router.stack.reduce((list: Record<string, string[]>, r) => {
            if (r.route?.path) {
                for (const method of Object.keys(r.route.methods)) {
                    list[method] = list[method] ?? [];
                    list[method].push(r.route.path);
                }
            }
            return list;
        }, {});
        expect(routerPathList.get).toHaveLength(8);
        expect(routerPathList.get).toEqual(
            expect.arrayContaining([
                '/category/:id',
                '/category',
                '/comment/:id',
                '/comment',
                '/question/:id',
                '/question',
                '/writer/:id',
                '/writer',
            ]),
        );
        expect(routerPathList.post).toHaveLength(12);
        expect(routerPathList.post).toEqual(
            expect.arrayContaining([
                '/category',
                '/category/search',
                '/category/:id/recover',
                '/comment',
                '/comment/search',
                '/comment/:id/recover',
                '/question',
                '/question/search',
                '/question/:id/recover',
                '/writer',
                '/writer/search',
                '/writer/:id/recover',
            ]),
        );

        expect(routerPathList.patch).toHaveLength(4);
        expect(routerPathList.patch).toEqual(expect.arrayContaining(['/category/:id', '/comment/:id', '/question/:id', '/writer/:id']));

        expect(routerPathList.delete).toHaveLength(4);
        expect(routerPathList.delete).toEqual(expect.arrayContaining(['/category/:id', '/comment/:id', '/question/:id', '/writer/:id']));

        expect(routerPathList.put).toHaveLength(4);
        expect(routerPathList.put).toEqual(expect.arrayContaining(['/category/:id', '/comment/:id', '/question/:id', '/writer/:id']));
    });
});

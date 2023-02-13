/* eslint-disable @typescript-eslint/naming-convention */
import { INestApplication } from '@nestjs/common';
import { ApplicationConfig } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { DenormalizedDoc } from '@nestjs/swagger/dist/interfaces/denormalized-doc.interface';
import { ModelPropertiesAccessor } from '@nestjs/swagger/dist/services/model-properties-accessor';
import { SchemaObjectFactory } from '@nestjs/swagger/dist/services/schema-object-factory';
import { SwaggerTypesMapper } from '@nestjs/swagger/dist/services/swagger-types-mapper';
import { SwaggerExplorer } from '@nestjs/swagger/dist/swagger-explorer';
import { Test, TestingModule } from '@nestjs/testing';

import { ExcludeSwaggerController } from './exclude-swagger.controller';
import { ExcludeSwaggerModule } from './exclude-swagger.module';
import { BaseEntity } from '../base/base.entity';
import { TestHelper } from '../test.helper';

describe('exclude swagger by route', () => {
    let app: INestApplication;
    let controller: ExcludeSwaggerController;
    let routeSet: Record<string, DenormalizedDoc>;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [ExcludeSwaggerModule, TestHelper.getTypeOrmMysqlModule([BaseEntity])],
        }).compile();

        app = moduleFixture.createNestApplication();
        controller = moduleFixture.get<ExcludeSwaggerController>(ExcludeSwaggerController);

        await app.init();

        const schemaObjectFactory = new SchemaObjectFactory(new ModelPropertiesAccessor(), new SwaggerTypesMapper());
        const explorer = new SwaggerExplorer(schemaObjectFactory);
        const routes = explorer.exploreController(
            {
                instance: controller,
                metatype: ExcludeSwaggerController,
            } as InstanceWrapper<ExcludeSwaggerController>,
            new ApplicationConfig(),
        );

        routeSet = routes.reduce((summary, route) => {
            if (!route.root?.operationId) {
                return summary;
            }
            summary[route.root.operationId] = route;
            return summary;
        }, {} as Record<string, DenormalizedDoc>);
    });

    afterEach(async () => {
        await TestHelper.dropTypeOrmEntityTables();
        await app?.close();
    });

    it('should not generate recover route in swagger', async () => {
        const recover = 'HideSwaggerController_reservedRecover';
        expect(routeSet[recover]).toBeUndefined();
    });
});

import { Injectable } from '@nestjs/common';
import { Request } from 'express';

import { CustomRequestInterceptor, CustomRequestOptions } from '../../src';

@Injectable()
export class CommentRelationInterceptor extends CustomRequestInterceptor {
    async overrideOptions(req: Request): Promise<CustomRequestOptions> {
        return new Promise((resolve, _reject) => {
            resolve({
                relations: +req.params.id % 2 === 0 ? ['writer'] : [],
            });
        });
    }
}

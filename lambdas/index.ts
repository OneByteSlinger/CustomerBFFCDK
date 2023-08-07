import { customerService } from '../services/customerService';
import { customerUserService } from '../services/customerUserService';

exports.handler = async function (event: any) {
    const { httpMethod, path } = event;

    switch (path) {
        case '/customer':
            return customerService(httpMethod, event);
        case '/customer/user':
            return customerUserService(httpMethod, event);
        default:
            return { statusCode: 400, body: 'invalid path' };
    }
};

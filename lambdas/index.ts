import { customerService } from '../services/customerService';
import { customerUserService } from '../services/customerUserService';

exports.handler = async function (event: any) {
    const { httpMethod, path } = event;
    const splitPath = path.split('/');
    if (splitPath[1] && splitPath[1] === 'user')
        return customerUserService(httpMethod, event);
    else if (!splitPath[1] && splitPath[0] === 'customer')
        return customerService(httpMethod, event);
    else return { statusCode: 400, body: 'invalid path' };
};

// Discriminated union
type AppError = 
| {kind: 'NOT_FOUND'; message: string; resource: string}
| {kind: 'VALIDATION'; message: string; fields: string[]}
| { kind: 'DUPLICATE';    message: string; field: string }
| { kind: 'DB_ERROR';     message: string; detail?: string }
| { kind: 'UNAUTHORIZED'; message: string };

function handleAppError(error: AppError, res: any):void {
    switch(error.kind){
        case 'NOT_FOUND':
            res.status(404).json({error:error.message, resource: error.resource});
            break;
        case 'VALIDATION':
            res.status(400).json({error:error.message, fields: error.fields});
            break;
        case 'DUPLICATE':
            res.status(409).json({error:error.message, field: error.field});
            break;
        case 'UNAUTHORIZED':
            res.status(401).json({error:error.message});
            break; 
        default:
            res.status(500).json({error:error.message});
    }
}

export {AppError, handleAppError};
import { Role } from '@prisma/client';

export type CurrentUser = {
    id:number;
    role:Role;
}
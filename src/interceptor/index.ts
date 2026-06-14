export interface APIResponse<T>{
    success : boolean;
    message : string;
    data ?: T;
    date ?: string;
    path ?: string;
    //takenTime --> middleware 
}
export type TaskStatus = 'active' | 'draft' | 'synced' ; 
export interface Task {
    id : number;
    title : string;
    description : string ; 
    lat : number ; 
    lng: number ;
    status : TaskStatus;

}
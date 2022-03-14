import { IAppUser } from "../models/user";

class MemDatabase {

    user:IAppUser;
    constructor()
    {
        this.user={userId:0,userName:'Guest',isLoggedIn:false,isOffline:true,groupId:'0', companyID:'0',sessionID:''};
    }
    public setUserInfo=(user:IAppUser) =>{
    
        this.user=user;
    }

    public getUserInfo=():IAppUser =>{
        return this.user;
    }
}
export const MemDb = new MemDatabase();
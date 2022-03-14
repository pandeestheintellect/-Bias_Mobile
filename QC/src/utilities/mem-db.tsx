import { IAppUser } from "./user-functions";


class MemDatabase {
    
    private host:string;
    private user:IAppUser;

    constructor()
    {
        //this.host='http://biasuat.smartbuildinginspection.com/api/v1/mobilelogin/';
        this.host='https://buildqas-global.com/api/v1/mobilelogin/';
        this.user={userId:'-1',userName:'Guest',isLoggedIn:false,sessionID:''};

    }

    public getHost=():string =>{
        return this.host;
    }

    public setUserInfo=(user:IAppUser) =>{
    
        this.user=user;
    }

    public getUserInfo=():IAppUser =>{
        return this.user;
    }

}


export const MemDb = new MemDatabase();
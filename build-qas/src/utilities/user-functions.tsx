import {IAppUser} from '../models/user'

import axios from "axios";

import { del, get, set } from 'idb-keyval';
import { MemDb } from '../storage/mem-db';
import { getMyAPIHost } from './master-functions';

export const onLoad=(callback:()=>void):void =>{
    get('user-info').then( user=>{
        if(user)
        {
            MemDb.setUserInfo(JSON.parse(user as string));
            if(callback)
                callback()
        }
    })
}
export const doLogin=(userid:string,password:string,forceLogin:boolean,callback:(success:string,isLoggedIn:boolean)=>void):void =>{
    
    axios.post(getMyAPIHost() +'bqaslogin?username='+userid+'&password='+password+'&deviceid=745612'+ 
    (forceLogin===true?'&RemovePreviousSession=true':''))
    .then(response => 
    {
        if (response.data.Success)
        {
            setUserInfo({userId:response.data.User.UserId,userName:response.data.User.UserFullName,isOffline:false,
                groupId:response.data.User.GroupID ,companyID: response.data.User.CompanyID,sessionID:response.data.User.SessionID, isLoggedIn:true});
            if(callback)
                callback('OKAY',false)
        }
        else
        {

            if(response.data.IsAlreadyLogin === true )
                callback('You are already logged in on another device. Do you want to close previous session?',true)
            else 
                callback(response.data.ErrorMessage,false)
        }

    })
    .catch(error => {
        if(callback)
                callback(error,false)
    });
}

export const doLogOut=(callback:(success:string)=>void):void =>{
    let userid=getUserInfo().userId;
    axios.post(getMyAPIHost() +'/bqaslogout?UserID='+userid,{}, { headers: { SessionId: getUserInfo().sessionID }})
    .then(response => 
    {
        if (response.data.Success)
        {
            del('user-info');

            if(callback)
                callback('OKAY')
        }
        else
        {

            callback(response.data.ErrorMessage)
        }

    })
    .catch(error => {
             
            callback('There was an error!' + error);
    });
}

export const setUserInfo=(user:IAppUser) =>{

    set('user-info',JSON.stringify(user));
    MemDb.setUserInfo(user);
    //localStorage.setItem('user-info',JSON.stringify(user));
}



export const updateUserInfo=(infoKey:string,infoValue:string|boolean) =>{
    let user = getUserInfo();
    let key=infoKey.toLowerCase();

    if(key==='name')
    {
        user.userName = infoValue as string;
    }
    else if(key==='isloggedin')
    {
        user.isLoggedIn = infoValue as boolean;
    }
    else if(key==='isOffline')
    {
        user.isOffline = infoValue as boolean;
        console.log('Setting offline')
    }
    console.log(key)
    //localStorage.setItem('user-info',JSON.stringify(user));

    setUserInfo(user);
}

export const updateConnectionStatus=(offline:boolean) =>{
    let user = getUserInfo();

    user.isOffline=offline;
    
    console.log(user.isOffline)
    //localStorage.setItem('user-info',JSON.stringify(user));

    setUserInfo(user);
}

export const getUserInfo=():IAppUser =>{
    /*
    let userInfo:IAppUser={userName:'Guest',isLoggedIn:false}
 
    if (localStorage.getItem('user-info')) {
        userInfo = JSON.parse(localStorage.getItem('user-info') as string);
    }
    */

    return MemDb.getUserInfo();
}


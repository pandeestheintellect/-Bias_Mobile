import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";



import {getAPIHost, getDataFromStorage, storeDataToStorage} from './master-functions'
import { MemDb } from "./mem-db";


export interface IAppUser {
    userId?:string;    
    userName:string;
    isLoggedIn:boolean;
    sessionID:string;
    groupId?:string;
}

export const onLoad=async (callback:()=>void) =>{

    try {
        const value  = await AsyncStorage.getItem('buildqas-qc-user-info')
        if (value !== null)
        {
            MemDb.setUserInfo(JSON.parse(value));
            if(callback)
                callback()
        }
        
      } catch(e) {
        console.log(e);
      }

}

export const getUserInfo=():IAppUser =>{
    return MemDb.getUserInfo();
}

export const doLogin=(userid:string,password:string,forceLogin:boolean,callback:(success:string)=>void):void =>{
    
    console.log(getAPIHost()+'bqaslogin?username='+userid+'&password='+password+'&deviceid=745612'+ 
    (forceLogin===true?'&RemovePreviousSession=true':''));
    axios.post(getAPIHost()+'bqaslogin?username='+userid+'&password='+password+'&deviceid=745612'+ 
        (forceLogin===true?'&RemovePreviousSession=true':''))
    .then(response => 
    {
        console.log(response.data)
        if (response.data.Success)
        {
            setUserInfo({userId:response.data.User.UserId,userName:response.data.User.UserFullName,
                groupId:response.data.User.GroupID,isLoggedIn:true,sessionID:response.data.User.SessionID});
            if(callback)
                callback('OKAY')
        }
        else
        {
            if(response.data.IsAlreadyLogin === true )
                callback('FORCE-LOGIN')
            else 
                callback(response.data.ErrorMessage)
        }

    })
    .catch(error => {
        if(callback)
                callback(getAPIHost() + ',Login,'+ error.message)
    });
}

export const doLogOut=(callback:(success:string)=>void):void =>{
    let userid=getUserInfo().userId;
    axios.post(getAPIHost() +'/bqaslogout?UserID='+userid,{}, { headers: { SessionId: getUserInfo().sessionID }})
    .then(response => 
    {
        if (response.data.Success)
        {
            
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

    storeDataToStorage('buildqas-qc-user-info',JSON.stringify(user));
    MemDb.setUserInfo(user);
    
}

export const setProfileImage=(imageString:string) =>{
    let user = getUserInfo();
    storeDataToStorage('buildqas-qc-user-image-'+user.userId,imageString);
}

export const getProfileImage=async (callback:(imageString:string)=>void) =>{

    try {
        let user = getUserInfo();
        const value  = await AsyncStorage.getItem('buildqas-qc-user-image-'+user.userId)
        if (value !== null)
        {
            callback(value)
        }
        else 
            callback('')

        
      } catch(e) {
        console.log(e);
        callback('')
      }

}
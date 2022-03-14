import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import axios from "axios";
import moment from "moment";
import { Toast } from "native-base";
import { call } from "react-native-reanimated";

import { MemDb } from "./mem-db";
import { getUserInfo } from "./user-functions";

export interface INameId{
	id: number;
	name: string;
}

export interface ISubcontractor{
	id: number;
    name: string;
    shortName: string;
    mobile: string;
    email: string;
    trades:INameId[]
}

export interface IRFWITrades extends INameId{
    items:INameId[];
    detailedChecklist:INameId[];
}

export const getAPIHost =():string=>{
    return MemDb.getHost();
}

export const getDataFromStorage = async (key:string) => {
    try {
      const value  = await AsyncStorage.getItem(key)
      console.log('got value');
      console.log(value);
      return value  != null ? value  : null;
    } catch(e) {
      console.log('error');
      console.log(e);
      return null
    }
  }

export const storeDataToStorage = async (key:string,value:string) => {
    try {
      await AsyncStorage.setItem(key, value)
    } catch (e) {
      //showErrorToast(e)
      console.log(e)
    }
  }
  export const checkOnline1 = async (callback:(isConnected:boolean)=>void) => {
    callback(false)
  }
export const checkOnline = async (callback:(isConnected:boolean)=>void) => {
  let isConnected=false;
  NetInfo.fetch()
    .then(networkState => {
      //isConnected=true;
      const webPing = setInterval(
        () => {
          fetch('https://www.google.com/', {
            mode: 'no-cors',
            })
          .then(() => {
            clearInterval(webPing);
            callback(true);
          }).catch((e) => 
          {
            console.log(e)
            clearInterval(webPing);
            callback(false)
          })
        }, 1000);
    }).catch((e)=>{
      console.log(e)
      callback(false)
    }
      
    )
      
}
export const showSuccessToast=(message:string) =>{
    Toast.show({
      text: message,
      buttonText: "Okay",
      position: "top",
      type: "success"
    })
    
  }
export const showErrorToast=(message:string) =>{
  Toast.show({
    text: message,
    buttonText: "Okay",
    position: "top",
    type: "danger"
  })
  
}

export const downloadDefectMaster= async (callback:(defects:INameId[]|string)=>void) =>
{

    console.log(getAPIHost()+'GetAllQCInspectionDefectTypes - SessionId:'+ getUserInfo().sessionID );

    axios.get(getAPIHost()+'GetAllQCInspectionDefectTypes', { headers: { SessionId: getUserInfo().sessionID }})
    .then(response => 
    {
        if (response.status===200 && response.data)
        {
          
            let masters:INameId[] = [];
            response.data.map((module:any)=>

                masters.push({id:module.DefectTypeID,name:module.DefectName})
            );
       
            storeDataToStorage('buildqas-qc-defect-master',JSON.stringify(masters))

            if(callback)
                callback(masters)
        }
        else
        {
            if(callback)
                callback(response.data.ErrorMessage)
        }

    })
    .catch(error => {
        console.log('Error in' + getAPIHost()+'GetAllQCInspectionDefectTypes')
        console.log(error)
        if(callback)
        callback(error.message)

    });
}

export const downloadTradeMaster = async (callback:(trades:INameId[]|string)=>void)=>
{
    axios.get(getAPIHost()+'GetAllQCInspectionTrades', { headers: { SessionId: getUserInfo().sessionID }})
    .then(response => 
    {
        if (response.status===200 && response.data)
        {
            let masters:INameId[] = [];
            response.data.map((module:any)=>

                masters.push({id:module.TradeID,name:module.TradeName})
            );
       
            
            storeDataToStorage('buildqas-qc-trade-master',JSON.stringify(masters));
            
            if(callback)
                callback(masters)
        }
        else
        {
            if(callback)
                callback(response.data.ErrorMessage)
        }

    })
    .catch(error => {
        if(callback)
        callback(error.message)

    });
}

export const downloadSubcontractorMaster=async (callback:(subcontractors:ISubcontractor[]|string)=>void)=>
{
    axios.get(getAPIHost()+'GetAllQCInspectionSubcontractors', { headers: { SessionId: getUserInfo().sessionID }})
    .then(response => 
    {
        if (response.status===200 && response.data)
        {
            let masters:ISubcontractor[] = [];
            let trade:INameId[] = [];
            response.data.forEach((module:any)=>{
                trade= [];
                module.qcinspection_subcontractor_trade_detail.forEach((trd:any)=>
                    trade.push({id:trd.qcinspection_trade_master.TradeID,name:trd.qcinspection_trade_master.TradeName})
                );
                masters.push({id:module.SubcontractorID,name:module.Name,shortName:module.ShortName,mobile:module.Mob,
                        email:module.Email,trades:trade});

            });
       
            storeDataToStorage('buildqas-qc-subcontractor-master',JSON.stringify(masters))

            if(callback)
                callback(masters)
        }
        else
        {
            if(callback)
                callback(response.data.ErrorMessage)
        }

    })
    .catch(error => {
        if(callback)
        callback(error.message)

    });
}

export const downloadInspectorMaster=async (callback:(inspectors:INameId[]|string)=>void)=>
{
    axios.get(getAPIHost()+'getallrtoinspectors', { headers: { SessionId: getUserInfo().sessionID }})
    .then(response => 
    {
        if (response.status===200 && response.data)
        {
            let masters:INameId[] = [];
            response.data.map((module:any)=>

                masters.push({id:module.InspectorID,name:module.InspectorName})
            );
       

            storeDataToStorage('buildqas-qc-inspector-master',JSON.stringify(masters));

            if(callback)
                callback(masters)
        }
        else
        {
            if(callback)
                callback(response.data.ErrorMessage)
        }

    })
    .catch(error => {
        if(callback)
        callback(error.message)

    });
}

export const downloadChecklistMaster=async (callback:(checklists:INameId[]|string)=>void)=>
{
    axios.get(getAPIHost()+'GetAllQCInspectionGeneralCheckLists', { headers: { SessionId: getUserInfo().sessionID }})
    .then(response => 
    {
        if (response.status===200 && response.data)
        {
            let masters:INameId[] = [];
            response.data.map((module:any)=>

                masters.push({id:module.GeneralCheckListID,name:module.GeneralCheckListName})
            );
       
            storeDataToStorage('buildqas-qc-checklist-master',JSON.stringify(masters));

            if(callback)
                callback(masters)
        }
        else
        {
            if(callback)
                callback(response.data.ErrorMessage)
        }

    })
    .catch(error => {
        if(callback)
        callback(error.message)

    });
}

export const downloadRFWITradeMaster= async (callback:(trades:IRFWITrades[]|string)=>void)=>
{
    axios.get(getAPIHost()+'GetAllRFWITrades', { headers: { SessionId: getUserInfo().sessionID }})
    .then(response => 
    {
        if (response.status===200 && response.data)
        {
            let masters:IRFWITrades[] = [];
            let item:INameId[] = [];
            let detailed:INameId[] = [];

            response.data.forEach((module:any)=>
            {
                item=[];
                detailed=[];
                module.qcinspection_rfwi_trade_item_detail.map((items:any)=>item.push({id:items.TradeItemID,name:items.ItemName}));
                module.qcinspection_rfwi_trade_detailed_checklist_detail.map((item:any)=>detailed.push({id:item.TradeDetailedCheckListID,name:item.DetailedCheckListName}));

                masters.push({id:module.TradeID,name:module.TradeName,items:item,detailedChecklist:detailed})
            });
       
            
            storeDataToStorage('buildqas-qc-rfwi-trade-master',JSON.stringify(masters));

            if(callback)
                callback(masters)
        }
        else
        {
            if(callback)
                callback(response.data.ErrorMessage)
        }

    })
    .catch(error => {
        if(callback)
        callback(error.message)

    });
}

export const getDefectMaster = async (callback:(masters:INameId[]|string)=>void) => {
    try {
      const value  = await AsyncStorage.getItem('buildqas-qc-defect-master')
      if(value!==null)
      {
          callback(JSON.parse(value as string))
      }
      else
          callback('Details not available for Defect, Please sync Defect master with server.')
    } catch(e) {
      callback('Error while getting Defect master '+ e)
    }
  }

  export const getTradeMaster = async (callback:(masters:INameId[]|string)=>void) => {
    try {
      const value  = await AsyncStorage.getItem('buildqas-qc-trade-master')
      if(value!==null)
      {
          callback(JSON.parse(value as string))
      }
      else
          callback('Details not available for trade, Please sync Trade master with server.')
    } catch(e) {
      callback('Error while getting Trade master '+ e)
    }
  }

  export const getSubcontractorMaster = async (callback:(masters:ISubcontractor[]|string)=>void) => {
    try {
      const value  = await AsyncStorage.getItem('buildqas-qc-subcontractor-master')
      if(value!==null)
      {
          callback(JSON.parse(value as string))
      }
      else
          callback('Details not available for Subcontractor, Please sync Subcontractor master with server.')
    } catch(e) {
      callback('Error while getting Subcontractor master '+ e)
    }
  }

  export const getRFWITradeMaster = async (callback:(masters:IRFWITrades[]|string)=>void) => {
    try {
      const value  = await AsyncStorage.getItem('buildqas-qc-rfwi-trade-master')
      if(value!==null)
      {
          callback(JSON.parse(value as string))
      }
      else
          callback('Details not available for RFWI Trade, Please sync RFWI Trade master with server.')
    } catch(e) {
      callback('Error while getting RFWI Trade master '+ e)
    }
  }

  export const getInspectorMaster = async (callback:(masters:INameId[]|string)=>void) => {
    try {
      const value  = await AsyncStorage.getItem('buildqas-qc-inspector-master')
      if(value!==null)
      {
          callback(JSON.parse(value as string))
      }
      else
          callback('Details not available for Inspector, Please sync Inspector master with server.')
    } catch(e) {
      callback('Error while getting Inspector master '+ e)
    }
  }
  export const getChecklistMaster = async (callback:(masters:INameId[]|string)=>void) => {
    try {
      const value  = await AsyncStorage.getItem('buildqas-qc-checklist-master')
      if(value!==null)
      {
          callback(JSON.parse(value as string))
      }
      else
          callback('Details not available for Checklist, Please sync Checklist master with server.')
    } catch(e) {
      callback('Error while getting Checklist master '+ e)
    }
  }

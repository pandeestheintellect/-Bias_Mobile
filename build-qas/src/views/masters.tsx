
import React from "react";
import { Component } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import  HeaderPage  from "../components/header-page";
import { AutoSizer, List} from 'react-virtualized'
import { ProviderContext, withSnackbar } from "notistack";

import { downloadJointMaster, downloadLeakMaster, downloadLocationMaster, downloadModuleMaster, downloadModuleProcessMaster, downloadWallMaster, downloadWindowMaster, getJointMaster, getLeakMaster, getLocationMaster, getModuleMaster,
     getModuleProcessMaster, 
     getWallMaster,
     getWindowMaster} from "../utilities/master-functions";
import { IAssessmentLocation, IAssessmentModule, IAssessmentModuleProcess, IJoint, ILeak, IWall, IWindow } from "../models/assessement";

type TParams = { masterId: string };

type RowRendererParams = {
    index: number,
    isScrolling: boolean,
    isVisible: boolean,
    key: string,
    parent: Object,
    style: Object,
};

type RowHeightParams = {
    index: number
};

interface ITableHeader {
    name:string,
    width: string
}



interface IState {
    rowCount:number
}
              
class Masters extends Component<RouteComponentProps<TParams>& ProviderContext,IState> {
    
    pageTitle:string;
    tableHeader:ITableHeader[];

    rowFullList:string[][];
    rowList:string[][];

    constructor(props:RouteComponentProps<TParams> & ProviderContext) {
        super(props);
        this.tableHeader=[];
        this.pageTitle='';  

        this.renderRow = this.renderRow.bind(this);
        this.onLoadData = this.onLoadData.bind(this);
        this.onModuleMasterDownloaded = this.onModuleMasterDownloaded.bind(this);
        this.onLocationMasterDownloaded = this.onLocationMasterDownloaded.bind(this);
        this.onModuleProcessMasterDownloaded = this.onModuleProcessMasterDownloaded.bind(this);
        this.onJointMasterDownloaded = this.onJointMasterDownloaded.bind(this);
        this.onLeakMasterDownloaded = this.onLeakMasterDownloaded.bind(this);
        this.onWallMasterDownloaded = this.onWallMasterDownloaded.bind(this);
        this.onWindowMasterDownloaded = this.onWindowMasterDownloaded.bind(this);
        this.rowFullList=[];
        this.rowList=[];
        
        this.state = {
          
            rowCount:0
          }
        this.onInit()  ;
         
    }
    onInit()
    {
        let masterId = this.props.match.params.masterId;

        this.tableHeader=[];

        if (masterId==='modules')
        {
            this.pageTitle='Modules';
            this.tableHeader.push({name:'Assessment Type',width:'580px'})
            this.tableHeader.push({name:'Module Name',width:'380px'})
        }
        else if (masterId==='location')
        {
            this.pageTitle='Location';
            this.tableHeader.push({name:'Assessment Type',width:'660px'})
            this.tableHeader.push({name:'Location Name',width:'360px'})
            this.tableHeader.push({name:'Type',width:'100px'})
        }
        else if (masterId==='process')
        {
            this.pageTitle='Process';
            this.tableHeader.push({name:'Assessment Type',width:'380px'})
            this.tableHeader.push({name:'Module Name',width:'360px'})
            this.tableHeader.push({name:'Process Name',width:'360px'})
        }
        else if (masterId==='joint')
        {
            this.pageTitle='Joint';
            this.tableHeader.push({name:'Name',width:'580px'})
            this.tableHeader.push({name:'Id',width:'380px'})
        }
        else if (masterId==='leak')
        {
            this.pageTitle='Leak';
            this.tableHeader.push({name:'Name',width:'580px'})
            this.tableHeader.push({name:'Id',width:'380px'})
        }
        else if (masterId==='wall')
        {
            this.pageTitle='Wall';
            this.tableHeader.push({name:'Name',width:'580px'})
            this.tableHeader.push({name:'Id',width:'380px'})
        }
        else if (masterId==='window')
        {
            this.pageTitle='Window';
            this.tableHeader.push({name:'Name',width:'580px'})
            this.tableHeader.push({name:'Id',width:'380px'})
        }
        else
            this.pageTitle='';  

        this.rowFullList=[];
        this.rowList=[];
        
        this.setState({ rowCount:0  }); 
    }
    onLoadData()
    {
        if(this.pageTitle==='Modules')
            getModuleMaster(this.onModuleMasterDownloaded);  
        else if(this.pageTitle==='Location')
            getLocationMaster(this.onLocationMasterDownloaded);
        else if(this.pageTitle==='Process')
            getModuleProcessMaster(this.onModuleProcessMasterDownloaded);      
        else if(this.pageTitle==='Joint')
            getJointMaster(this.onJointMasterDownloaded);   
        else if(this.pageTitle==='Leak')
            getLeakMaster(this.onLeakMasterDownloaded);   
        else if(this.pageTitle==='Wall')
            getWallMaster(this.onWallMasterDownloaded);   
        else if(this.pageTitle==='Window')
            getWindowMaster(this.onWindowMasterDownloaded);       
    }
    componentDidMount()
    {
        this.onLoadData()
    }
    componentDidUpdate (prevProps:RouteComponentProps<TParams>) {
        if(prevProps.match.params.masterId !==this.props.match.params.masterId)
        {
            this.onInit();
            this.onLoadData();
        }
     }
    onModuleMasterDownloaded(moduls:IAssessmentModule[]|string)
    {
        if(Array.isArray(moduls))
        {
            this.rowFullList.length=0;
            this.rowList.length=0;
            
            (moduls as IAssessmentModule[]).forEach(module => {
                this.rowFullList.push([module.assessmentName,module.name]);    
                this.rowList.push([module.assessmentName,module.name]);
            });
            this.setState({rowCount:this.rowList.length})
        }
        else
            this.onUpdateStatus(moduls as string)
    }
    onLocationMasterDownloaded(moduls:IAssessmentLocation[]|string)
    {
        if(Array.isArray(moduls))
        {
            this.rowFullList.length=0;
            this.rowList.length=0;
            (moduls as IAssessmentLocation[]).forEach(module => {
                this.rowFullList.push([module.assessmentName,module.name,module.type]);    
                this.rowList.push([module.assessmentName,module.name,module.type]);
            });
            this.setState({rowCount:this.rowList.length})
        }
        else
            alert(moduls);
    }
    onModuleProcessMasterDownloaded(moduls:IAssessmentModuleProcess[]|string)
    {
        if(Array.isArray(moduls))
        {
            this.rowFullList.length=0;
            this.rowList.length=0;
            (moduls as IAssessmentModuleProcess[]).forEach(module => {
                this.rowFullList.push([module.assessmentName,module.moduleName,module.name]);    
                this.rowList.push([module.assessmentName,module.moduleName,module.name]);
            });
            this.setState({rowCount:this.rowList.length})
        }
        else
            alert(moduls);
    }
    onJointMasterDownloaded(masters:IJoint[]|string)
    {
        if(Array.isArray(masters))
        {
            this.rowFullList.length=0;
            this.rowList.length=0;
            
            (masters as IJoint[]).forEach(master => {
                this.rowFullList.push([master.name,master.id+'']);    
                this.rowList.push([master.name,master.id+'' ]);
            });
            this.setState({rowCount:this.rowList.length})
        }
        else
            alert(masters);
    }
    onLeakMasterDownloaded(masters:ILeak[]|string)
    {
        if(Array.isArray(masters))
        {
            this.rowFullList.length=0;
            this.rowList.length=0;
            
            (masters as ILeak[]).forEach(master => {
                this.rowFullList.push([master.name,master.id+'']);    
                this.rowList.push([master.name,master.id+'' ]);
            });
            this.setState({rowCount:this.rowList.length})
        }
        else
            alert(masters);
    }
    onWallMasterDownloaded(masters:IWall[]|string)
    {
        if(Array.isArray(masters))
        {
            this.rowFullList.length=0;
            this.rowList.length=0;
            
            (masters as IWall[]).forEach(master => {
                this.rowFullList.push([master.name,master.id+'']);    
                this.rowList.push([master.name,master.id+'' ]);
            });
            this.setState({rowCount:this.rowList.length})
        }
        else
            alert(masters);
    }
    onWindowMasterDownloaded(masters:IWindow[]|string)
    {
        if(Array.isArray(masters))
        {
            this.rowFullList.length=0;
            this.rowList.length=0;
            
            (masters as IWindow[]).forEach(master => {
                this.rowFullList.push([master.name,master.id+'']);    
                this.rowList.push([master.name,master.id+'' ]);
            });
            this.setState({rowCount:this.rowList.length})
        }
        else
            alert(masters);
    }
    onUpdateStatus(status:string)
    {
        this.props.enqueueSnackbar(status,{ 
            variant: 'info',
            anchorOrigin: {
                vertical: 'top',
                horizontal: 'center',
            }
        });

    }
    onSearch(keyword:string){
        if(keyword==='')
            this.rowList=JSON.parse(JSON.stringify(this.rowFullList))
        else
        {
            keyword = keyword.toLowerCase();
            let lst = this.rowFullList.filter((item:string[])=>{
                if (item.join('').toLowerCase().indexOf(keyword)>=0)
                    return true;
                else
                    return false;
                })
                this.rowList=JSON.parse(JSON.stringify(lst))   
        }
        this.setState({rowCount:this.rowList.length})
    }
    onHeaderClick(action:string, path:string){
        if (action==='BACK')
            this.props.history.goBack();
        else if (action==='SYNC')
        {
            if(this.pageTitle==='Modules')
                downloadModuleMaster(this.onModuleMasterDownloaded);  
            else if(this.pageTitle==='Location')
                downloadLocationMaster(this.onLocationMasterDownloaded);
            else if(this.pageTitle==='Process')
                downloadModuleProcessMaster(this.onModuleProcessMasterDownloaded);      
            else if(this.pageTitle==='Joint')
                downloadJointMaster(this.onJointMasterDownloaded);   
            else if(this.pageTitle==='Leak')
                downloadLeakMaster(this.onLeakMasterDownloaded);   
            else if(this.pageTitle==='Wall')
                downloadWallMaster(this.onWallMasterDownloaded);   
            else if(this.pageTitle==='Window')
                downloadWindowMaster(this.onWindowMasterDownloaded);        
        }
    }
    getRowHeight(row:RowHeightParams):number {
        
        return 85;
    }
    renderRow (row:RowRendererParams) {
        let rowData = this.rowList[row.index];
        return (
            <div key={row.key} style={row.style}>

                <div className='assessment-unit' 
                    style={ row.index % 2 !== 0 ? { backgroundColor:'#FBFBFB',height:'100%',display:'flex',flexDirection:'row'} : 
                    {backgroundColor:'#fff',height:'100%',display:'flex',flexDirection:'row'}}>
                        {rowData.map((data:string,index)=>
                            <div key={index} className='assessment-cell' style={{width:this.tableHeader[index].width}}>{data}</div>
                        )}

                </div>  
            </div>
        );
    }

    render(){
        return (
            
            <div className={'page'}>
                <HeaderPage name={this.pageTitle} onSearch={(keyword:string)=>this.onSearch(keyword)} onHeaderClick={(action:string, path:string)=>this.onHeaderClick(action,path)}/>

                <div className='assessment-unit MuiPaper-elevation4' style={{marginTop:'10px',height:'40px',display:'flex',flexDirection:'row'}}>
                    {
                        this.tableHeader.map((header:ITableHeader,index)=>
                            <div key={index} className='assessment-header-listing' style={{width:header.width,position:'relative'}}><span className='center-text'>{header.name}</span></div>
                        )
                    }
                    
                </div>  
                
                <div style={{flex:'1 0 auto'}} >
                <AutoSizer>
                    {({ height, width }) => (
                        <List
                        height={height}
                        rowCount={this.state.rowCount}
                        rowHeight={50}
                        rowRenderer={this.renderRow}
                        width={1007}
                        overscanRowCount={10} 
                    />
                    )}
                    </AutoSizer>
                </div>
            </div>
        )
    }
}
export default withRouter(withSnackbar(Masters))


import React, { Component } from "react";

import {
  Container,
  Content,
  Button,
  Text,
  Icon,
  Item,
  Input,
  Form,
  Body,
  Header,
  Left,
  Right,
  Title,
  Spinner,
  Card,
  CardItem,
  Thumbnail,
  H3
} from "native-base";
import {styles} from "../theme/appStyle";


import { AuthStackParamList } from '../navigation/auth-stack-param-list';
import { StackNavigationProp } from "@react-navigation/stack";
import { getProfileImage, getUserInfo } from "../utilities/user-functions";
import { checkOnline, downloadChecklistMaster, downloadDefectMaster, downloadInspectorMaster, downloadRFWITradeMaster, downloadSubcontractorMaster, downloadTradeMaster, INameId, IRFWITrades, ISubcontractor } from "../utilities/master-functions";
import { downloadDefects, downloadRFWI, downloadProjectMaster, IProject, syncDefects, syncRemoveDefectsOrRFWI, syncRFWI } from "../utilities/project-functions";

 

type ScreenNavigationProp = StackNavigationProp< AuthStackParamList,'Welcome'>;

type Props = {
  navigation: ScreenNavigationProp;
};

interface IState {
  userName:string;
  message:string;
  progress:number;
  userRole:string;
  allDone:boolean;
  profileImage:string;
}
class Welcome extends Component<Props,IState> {

    state:IState
    constructor (props:Props)
    {
      super(props)
      let user = getUserInfo();
      this.state = {
        userName:user.userName,
        message:'',
        progress:1,
        profileImage:'',
        userRole:user.groupId as string,
        allDone:false
      }

      this.isOnline = this.isOnline.bind(this);
      this.onUpdateStatus = this.onUpdateStatus.bind(this);
      this.onDefectMasterDownloaded = this.onDefectMasterDownloaded.bind(this);
      this.onTradeMasterDownloaded = this.onTradeMasterDownloaded.bind(this);
      this.onSubcontractorMasterDownloaded = this.onSubcontractorMasterDownloaded.bind(this);
      this.onInspectorMasterDownloaded = this.onInspectorMasterDownloaded.bind(this);
      this.onChecklistMasterDownloaded = this.onChecklistMasterDownloaded.bind(this);
      this.onRFWITradeMasterDownloaded = this.onRFWITradeMasterDownloaded.bind(this);
      this.onProjectMasterDownloaded = this.onProjectMasterDownloaded.bind(this);
      this.onDefectDownloaded = this.onDefectDownloaded.bind(this);
      this.onRFWIDownloaded = this.onRFWIDownloaded.bind(this);

      this.onLoadImage = this.onLoadImage.bind(this)

      this.onSyncDefectsRemove = this.onSyncDefectsRemove.bind(this);
      this.onSyncDefectsNew = this.onSyncDefectsNew.bind(this);
      this.onSyncDefectsOld = this.onSyncDefectsOld.bind(this);
      
      this.onSyncRFWIRemove = this.onSyncRFWIRemove.bind(this);
      this.onSyncRFWI = this.onSyncRFWI.bind(this);
      

    }
    componentDidMount()
    {
        getProfileImage(this.onLoadImage)
        checkOnline(this.isOnline);
    }
    onLoadImage(imageString:string)
    {
        if(imageString.length>10)
        this.setState({profileImage:imageString})
    }
    
  isOnline(status:boolean)
  {
      if (status)
      {
          if(this.state.userRole==='8'|| this.state.userRole==='9'|| this.state.userRole==='10'||this.state.userRole==='11')
          {
            this.onUpdateStatus('Download-Project-Master');
          }
          else
          {
            this.setState({message:'Starting with Masters downloaded',progress:1})
            downloadDefectMaster(this.onDefectMasterDownloaded);
          } 
      }
          
      else
          this.setState({message:'No Internet connection. Continue with offline mode..',progress:100,allDone:true})
  }
  onUploadPending()
  {

  }
  onUpdateStatus(processStatus:string)
  {
    //console.log(processStatus)
    
    if(processStatus ==='Download-Trade-Master')
    {
        this.setState({progress:12})
        downloadTradeMaster(this.onTradeMasterDownloaded);
    } 
    else if(processStatus ==='Download-Subcontractor-Master')
    {
        this.setState({progress:24})
        downloadSubcontractorMaster(this.onSubcontractorMasterDownloaded);    
    }
    else if(processStatus ==='Download-Inspector-Master')
    {
      this.setState({message:'Halfway in masters starting RFWI masters',progress:36})
      downloadInspectorMaster(this.onInspectorMasterDownloaded); 
      
    }
    else if(processStatus ==='Download-Checklist-Master')
    {
        this.setState({progress:48})
        downloadChecklistMaster(this.onChecklistMasterDownloaded);  
    }
    else if(processStatus ==='Download-RFWITrade-Master')
    {
        this.setState({progress:60})
        downloadRFWITradeMaster(this.onRFWITradeMasterDownloaded);              
    }
    else if(processStatus ==='Download-Project-Master')
    {
        this.setState({message:'Project Masters download in progress',progress:72})
        downloadProjectMaster(this.onProjectMasterDownloaded);   
    }
    else if(processStatus ==='Sync-Defects-Remove')
    {
        this.setState({message:'Removing defects'})
        syncRemoveDefectsOrRFWI('buildqas-qc-defect-delete',this.onSyncDefectsRemove); 
    }
    else if(processStatus ==='Sync-Defects')
    {
        this.setState({message:'Updating defects'})
        syncDefects('new',this.onSyncDefectsNew);     
    }
    else if(processStatus ==='Sync-Defects-Old')
    {
        syncDefects('old',this.onSyncDefectsOld); 
    }
    else if(processStatus ==='Download-Defect')
    {
      this.setState({message:'Almost done.',progress:84 })
      downloadDefects(this.onDefectDownloaded); 
    }
    else if(processStatus ==='Sync-RFWI-Remove')
    {
      this.setState({message:'Removing RFWI'})
        syncRemoveDefectsOrRFWI('buildqas-qc-rfwi-delete',this.onSyncRFWIRemove); 
    }
    else if(processStatus ==='Sync-RFWI')
    {
        this.setState({message:'Updating RFWI'})
        syncRFWI(this.onSyncRFWI);    
    }
    else if(processStatus ==='Download-RFWI')
    {
      this.setState({progress:90 })
      downloadRFWI(this.onRFWIDownloaded); 
    }
    else if(processStatus ==='Download-Completed')
    {
        this.setState({message:'Process completed',progress:100})
        this.props.navigation.push('Tasks',{module:'Defects'});
    }
    else
      this.setState({message:processStatus,allDone:true})
  }  
  onDefectMasterDownloaded(moduls:INameId[]|string)
  {
      if(Array.isArray(moduls))
      {
        this.onUpdateStatus('Download-Trade-Master')
      }
      else
          this.onUpdateStatus(moduls as string)
  }

  onTradeMasterDownloaded(moduls:INameId[]|string)
  {
      if(Array.isArray(moduls))
      {
        this.onUpdateStatus('Download-Subcontractor-Master')
      }
      else
          this.onUpdateStatus(moduls as string)
          
  }
  onSubcontractorMasterDownloaded(moduls:ISubcontractor[]|string)
  {
      if(Array.isArray(moduls))
      {
        this.onUpdateStatus('Download-Inspector-Master')
      }
      else
          this.onUpdateStatus(moduls as string)
         
  }

  onInspectorMasterDownloaded(moduls:INameId[]|string)
  {
      if(Array.isArray(moduls))
      {
        this.onUpdateStatus('Download-Checklist-Master')
      }
      else
          this.onUpdateStatus(moduls as string)
          
  }
  
  onChecklistMasterDownloaded(moduls:INameId[]|string)
  {
      if(Array.isArray(moduls))
      {
        this.onUpdateStatus('Download-RFWITrade-Master')
      }
      else
          this.onUpdateStatus(moduls as string)

  }
  
  onRFWITradeMasterDownloaded(moduls:IRFWITrades[]|string)
  {
      if(Array.isArray(moduls))
      {
        this.onUpdateStatus('Download-Project-Master')
      }
      else
          this.onUpdateStatus(moduls as string)
  }

  onProjectMasterDownloaded(moduls:IProject[]|string)
  {
      if(Array.isArray(moduls))
      {

        if (this.state.userRole==='8'|| this.state.userRole==='9'|| this.state.userRole==='10'||this.state.userRole==='11')
            this.onUpdateStatus('Sync-RFWI-Remove')    
        else
          this.onUpdateStatus('Sync-Defects-Remove');
          
          //  this.onUpdateStatus('User-Defect')      
      }
      else
          this.onUpdateStatus(moduls as string)

  }
  onSyncDefectsRemove(status:string)
  {
      this.onUpdateStatus('Sync-Defects')
  }
  onSyncDefectsNew(status:string)
  {
      this.onUpdateStatus('Sync-Defects-Old')
  }

  onSyncDefectsOld(status:string)
  {
      this.onUpdateStatus('Download-Defect')
      
  }

  onDefectDownloaded(moduls:string)
  {
      if(this.state.userRole === '1' ||  this.state.userRole === '4' ||  this.state.userRole === '5' || this.state.userRole === '8')
          this.onUpdateStatus('Sync-RFWI-Remove')    
      else
          this.onUpdateStatus('Download-Completed')
  }
  onSyncRFWIRemove(status:string)
  {
      this.onUpdateStatus('Sync-RFWI')
  }

  onSyncRFWI(status:string)
  { 
      this.onUpdateStatus('Download-RFWI')
  }

  onRFWIDownloaded(moduls:string)
  {
      this.onUpdateStatus('Download-Completed')    
  }

  render() {
    return (
      <Container style={styles.container}>
        <Header>
          <Body>
            <Title>Checking for updates</Title>
          </Body>
        </Header>
        <Content padder>
        <Card style={{flex: 0}}>
            <CardItem bordered>
              <Left>
                {this.state.profileImage.length<10 && <Thumbnail large  source={require('../images/avatar.png')} />}
                {this.state.profileImage.length>10 && <Thumbnail large  source={{uri: this.state.profileImage}} />}
                <Body>
                  <H3>Welcome !</H3>
                  <Text>{this.state.userName}</Text>
                </Body>
              </Left>
            </CardItem>
            
            <CardItem bordered>
              <Left><Spinner color='red' /></Left>
              <Body style={{flex:2}}><Text style={{fontSize:30}}>{this.state.progress} % </Text></Body>
            </CardItem>
            <CardItem bordered>
              <Text>{this.state.message}</Text>
            </CardItem>
            {
              this.state.allDone && 
              <CardItem style={{marginTop:-10}}>
                <Button success full style={{flex:1}} onPress={()=>this.props.navigation.push('Tasks',{module:'Defects'})} >
                    <Text >Continue</Text>
                </Button>
              
              </CardItem>

            }
          </Card>
        
        </Content>
      </Container>
    );
  }
}


export default Welcome;



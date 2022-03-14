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
import { getUserInfo } from "../utilities/user-functions";
import { checkOnline, downloadChecklistMaster, downloadDefectMaster, downloadInspectorMaster, downloadRFWITradeMaster, downloadSubcontractorMaster, downloadTradeMaster, INameId, IRFWITrades, ISubcontractor } from "../utilities/master-functions";
import { downloadDefects, downloadProjectMaster, downloadRFWI, IProject, syncDefects, syncRemoveDefectsOrRFWI, syncRFWI } from "../utilities/project-functions";
import { RouteProp } from "@react-navigation/native";

 
type ScreenRouteProp = RouteProp<AuthStackParamList, 'Sync'>;

type ScreenNavigationProp = StackNavigationProp< AuthStackParamList,'Sync'>;

type Props = {
  route: ScreenRouteProp;
  navigation: ScreenNavigationProp;
};


interface IState {
  userName:string;
  message:string;
  progress:number;
  userRole:string;
  allDone:boolean;
}
class Sync extends Component<Props,IState> {

    state:IState
    constructor (props:Props)
    {
      super(props)

      let user = getUserInfo();
      this.state = {
        userName:user.userName,
        message:'',
        progress:1,
        userRole:user.groupId as string,
        allDone:false
      }

      this.isOnline = this.isOnline.bind(this);
      this.onUpdateStatus = this.onUpdateStatus.bind(this);

      this.onSyncDefectsRemove = this.onSyncDefectsRemove.bind(this);
      this.onSyncDefectsNew = this.onSyncDefectsNew.bind(this);
      this.onSyncDefectsOld = this.onSyncDefectsOld.bind(this);
      this.onDefectDownloaded = this.onDefectDownloaded.bind(this);

      this.onSyncRFWIRemove = this.onSyncRFWIRemove.bind(this);
      this.onSyncRFWI = this.onSyncRFWI.bind(this);
      this.onRFWIDownloaded = this.onRFWIDownloaded.bind(this);

    }
    componentDidMount()
    {
      checkOnline(this.isOnline);
      
    }
    
  isOnline(status:boolean)
  {
      if (status)
      {
          if(this.props.route.params.module==='Defects')
          {
            this.onUpdateStatus('Sync-Defects-Remove');
          }
          else
          {
            this.onUpdateStatus('Sync-RFWI-Remove');
          }
      }
      else
          this.setState({message:'No Internet connection. Update will happen next time when you come online..',progress:100,allDone:true})
  }
  onUpdateStatus(processStatus:string)
  {
    
    if(processStatus ==='Sync-Defects-Remove')
    {
        this.setState({message:'Removing defects',progress:1})
        syncRemoveDefectsOrRFWI('buildqas-qc-defect-delete',this.onSyncDefectsRemove); 
    }
    else if(processStatus ==='Sync-Defects')
    {
        this.setState({message:'Updating defects',progress:25})
        syncDefects('new',this.onSyncDefectsNew);     
    }
    else if(processStatus ==='Sync-Defects-Old')
    {
        this.setState({progress:50})
        syncDefects('old',this.onSyncDefectsOld); 
    } 
    else if(processStatus ==='Download-Defect')
    {
        this.setState({message:'Downloading defects',progress:75})
        downloadDefects(this.onDefectDownloaded);  
    }
    else if(processStatus ==='Download-Completed')
    {
        this.setState({message:this.props.route.params.module +' updation completed',progress:100})
        this.props.navigation.push('Tasks',{module:this.props.route.params.module});
    }
    else if(processStatus ==='Sync-RFWI-Remove')
    {
      this.setState({message:'Removing RFWI',progress:10})
        syncRemoveDefectsOrRFWI('buildqas-qc-rfwi-delete',this.onSyncRFWIRemove); 
    }
    else if(processStatus ==='Sync-RFWI')
    {
        this.setState({message:'Updating RFWI',progress:40})
        syncRFWI(this.onSyncRFWI);    
    }
    else if(processStatus ==='Download-RFWI')
    {
        this.setState({message:'Downloading RFWI',progress:70})
        downloadRFWI(this.onRFWIDownloaded);  
    }
    else
    {
      let done=false
      if(processStatus.toLocaleLowerCase().indexOf('error')>=0)
        done=true
        
      this.setState({message:processStatus,allDone:done})
    }
      
  }  

  onSyncDefectsRemove(status:string)
  {
      this.onUpdateStatus(status);
      this.onUpdateStatus('Sync-Defects')
  }
  onSyncDefectsNew(status:string)
  {
      this.onUpdateStatus('New defects ' + status);
      this.onUpdateStatus('Sync-Defects-Old')
  }

  onSyncDefectsOld(status:string)
  {
      this.onUpdateStatus('Old defects ' +status);
      this.onUpdateStatus('Download-Defect')
      
  }
  onDefectDownloaded(moduls:string)
  {
      this.onUpdateStatus(moduls as string)
      this.onUpdateStatus('Download-Completed')
  }

  onSyncRFWIRemove(status:string)
  {
      this.onUpdateStatus(status);
      this.onUpdateStatus('Sync-RFWI')
  }

  onSyncRFWI(status:string)
  {
      this.onUpdateStatus(status);
      this.onUpdateStatus('Download-RFWI')
  }
  
  onRFWIDownloaded(moduls:string)
  {
      this.onUpdateStatus(moduls as string)
      this.onUpdateStatus('Download-Completed')    
  }

  
  render() {
    return (
      <Container style={styles.container}>
        <Header>
          <Body>
            <Title>Updating {this.props.route.params.module}</Title>
          </Body>
        </Header>
        <Content padder>
        <Card style={{flex: 0}}>
            <CardItem bordered>
              <Left>
                <Thumbnail large  source={require('../images/upload.png')} />
                <Body>
                  <H3>Good work !</H3>
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
                <Button success full style={{flex:1}} onPress={()=>this.onUpdateStatus('Download-Completed')} >
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


export default Sync;
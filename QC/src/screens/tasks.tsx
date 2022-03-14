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
  Segment,
  Title,
  ListItem,
  Thumbnail,
  List,
  Subtitle
} from "native-base";
import {styles} from "../theme/appStyle";


import { AuthStackParamList } from '../navigation/auth-stack-param-list';
import { StackNavigationProp } from "@react-navigation/stack";
import { getDefects, getDefectStatusImage, getRFWI, getRFWItatusImage, IDefectDetail, IRFWIDetail } from "../utilities/project-functions";
import { Alert, BackHandler, Image, ImageSourcePropType } from "react-native";
import { RouteProp } from "@react-navigation/native";
import { doLogOut, getUserInfo } from "../utilities/user-functions";
import ModelProfile from "./model-profile";


type ScreenRouteProp = RouteProp<AuthStackParamList, 'Tasks'>;

type ScreenNavigationProp = StackNavigationProp< AuthStackParamList,'Tasks'>;

type Props = {
  route: ScreenRouteProp;
  navigation: ScreenNavigationProp;
};


interface IState {
  currentTab:string;
  showOption:number;
  navigated:boolean;
  details:StatusDetail[];
}

interface StatusDetail{
  image:ImageSourcePropType;
  status:string;
  count:number;
  
}
class Tasks extends Component<Props,IState> {

  modelProfile = React.createRef<ModelProfile>();
  constructor(props:Props)
  {
    super(props)

    let option = this.getOption();
    this.state = {
      currentTab :this.props.route.params.module,
      navigated:false,
      showOption:this.getOption(),
      details:[]
    }
    this.formatDefects = this.formatDefects.bind(this);
    this.formatRFWI = this.formatRFWI.bind(this);
    this.onExitApp = this.onExitApp.bind(this)
    this.onUpdateStatus =this.onUpdateStatus.bind(this)
    this.onExit =this.onExit.bind(this)
  }

  componentDidMount()
  {
    let requestOriginal = this.props.route.params.module;
    let request = this.props.route.params.module;
    
    if (request ==='Defects' && this.getOption()===3)
      request ='RFWI'
    if (request ==='RFWI' && this.getOption()===2)
      request ='Defects'

    if (requestOriginal!==request)
      this.setState({currentTab:request})

    if(request==='Defects' )
    {
      this.loadDefects();
    }
    else
    {
      this.loadRFWI();
    }
    BackHandler.addEventListener('hardwareBackPress', this.onBackPressed);
  }
  
  componentWillUnmount() {
      BackHandler.removeEventListener('hardwareBackPress', this.onBackPressed);
  }

  onBackPressed ():boolean{
    Alert.alert(
      'BuildQAS App',
      'Do you want to exit?',
      [
        {text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: 'Yes', onPress: () =>this.onExit() },
      ],
      { cancelable: false });
      return true;
  }
  onUpdateStatus(status:string)
  {
    BackHandler.exitApp();
  }
  onExit()
  {
    doLogOut(this.onUpdateStatus);
    
  }
  getOption()
  {
    let user = getUserInfo();
    if (user.groupId==='2' || user.groupId==='4' || user.groupId==='5')
      return 1 //Both
    else if (user.groupId==='7' )
      return 2 //Defects
    else if (user.groupId==='8'|| user.groupId==='9' || user.groupId==='10' || user.groupId==='11')
      return 3 //RFWI
    else 
      return 0 //No Tab

  }
  getSubTitle()
  {
    let user = getUserInfo();

    if (user.groupId==='2' || user.groupId==='4' || user.groupId==='5' || user.groupId==='7')
      return 'Defects'
    else if (user.groupId==='8'|| user.groupId==='9' || user.groupId==='10' || user.groupId==='11')
      return 'RFWI'
    else 
      return ''
  }
  onSegment(segment:string)
  {
    this.setState({currentTab:segment})
    if(segment==='Defects')
    {
      this.loadDefects();
    }
    else
    {
      this.loadRFWI();
    }
  }
  loadDefects()
  {
    getDefects(this.formatDefects);
  }
  loadRFWI()
  {
    getRFWI(this.formatRFWI);
  }
  formatDefects(defects:IDefectDetail[])
  {

    let summary:StatusDetail[] = [];

    let filtered = defects.filter((e)=>e.status==='New');
    if (filtered.length>0)
      summary.push({image:getDefectStatusImage('New'), status:'New',count:filtered.length});
    
    filtered = defects.filter((e)=>e.status==='Pending');
    if (filtered.length>0)
      summary.push({image:getDefectStatusImage('Pending'),status:'Pending',count:filtered.length});
        
    filtered = defects.filter((e)=>e.status==='Approved');
    if (filtered.length>0)
      summary.push({image:getDefectStatusImage('Approved'),status:'Approved',count:filtered.length});

    filtered = defects.filter((e)=>e.status==='ReDo');
    if (filtered.length>0)
      summary.push({image:getDefectStatusImage('Redo'),status:'ReDo',count:filtered.length});
    
    filtered = defects.filter((e)=>e.status==='Redo Done');
    if (filtered.length>0)
      summary.push({image:getDefectStatusImage('Redo Done'),status:'Redo Done',count:filtered.length});

    filtered = defects.filter((e)=>e.status==='Rectified');
    if (filtered.length>0)
      summary.push({image:getDefectStatusImage('Rectified'),status:'Rectified',count:filtered.length});

    filtered = defects.filter((e)=>e.status==='Rework');
    if (filtered.length>0)
      summary.push({image:getDefectStatusImage('Rework'),status:'Rework',count:filtered.length});

    filtered = defects.filter((e)=>e.status==='Rework Done');
    if (filtered.length>0)
      summary.push({image:getDefectStatusImage('Rework Done'),status:'Rework Done',count:filtered.length});

    filtered = defects.filter((e)=>e.status==='Completed');
    if (filtered.length>0)
      summary.push({image:getDefectStatusImage('Completed'),status:'Completed',count:filtered.length});

    this.setState({details:summary})
    
  }

  formatRFWI(defects:IRFWIDetail[])
  {

    console.log(defects)
    let summary:StatusDetail[] = [];

    let filtered = defects.filter((e)=>e.status==='New');
    if (filtered.length>0)
      summary.push({image:getRFWItatusImage('New'), status:'New',count:filtered.length});
    
    filtered = defects.filter((e)=>e.status==='Pending');
    if (filtered.length>0)
      summary.push({image:getRFWItatusImage('Pending'),status:'Pending',count:filtered.length});
        
    filtered = defects.filter((e)=>e.status==='Approved');
    if (filtered.length>0)
      summary.push({image:getRFWItatusImage('Approved'),status:'Approved',count:filtered.length});

    filtered = defects.filter((e)=>e.status==='Requested');
    if (filtered.length>0)
      summary.push({image:getRFWItatusImage('Requested'),status:'Requested',count:filtered.length});
    
    filtered = defects.filter((e)=>e.status==='Rejected');
    if (filtered.length>0)
      summary.push({image:getRFWItatusImage('Rejected'),status:'Rejected',count:filtered.length});

    filtered = defects.filter((e)=>e.status==='Completed');
    if (filtered.length>0)
      summary.push({image:getRFWItatusImage('Completed'),status:'Completed',count:filtered.length});

    this.setState({details:summary})
    
  }

  
  onShowProjectListing()
  {
    this.setState({navigated:true})
    this.props.navigation.push('ProjectListing',{type:this.state.currentTab});
  }
  onShowListing(currentStatus:string)
  {
    this.setState({navigated:true})
    if (this.state.currentTab==='Defects')
      this.props.navigation.push('QCListing',{status:currentStatus,project:''});
    else
      this.props.navigation.push('RFWIListing',{status:currentStatus,project:''});
  }
  onExitApp()
  {
    
    this.onBackPressed();
  }

  render() {
    return (
      <Container style={styles.container}>
        {this.state.showOption===1 ?
                <Header hasSegment> 
                <Body>
                  <Title>My Tasks</Title>
                </Body>
                <Right>
                  <Button transparent onPress={()=>this.onShowProjectListing()}>
                    <Icon name='business-outline' />
                  </Button>
                  <Button transparent onPress={()=>this.props.navigation.push('Welcome')}>
                    <Icon name='sync-circle-outline' />
                  </Button>
                  <Button transparent onPress={()=>this.modelProfile.current?.onShowModal()}>
                    <Icon name="person-outline" />
                  </Button>
                </Right>
              </Header>
        :

        <Header > 
        <Body>
          <Subtitle>My Tasks</Subtitle>
          <Title>{this.getSubTitle()}</Title>
        </Body>
        <Right>

          <Button transparent onPress={()=>this.onShowProjectListing()}>
            <Icon name='business-outline' />
          </Button>
          <Button transparent onPress={()=>this.props.navigation.push('Welcome')}>
            <Icon name='sync-circle-outline' />
          </Button>
          <Button transparent onPress={()=>this.modelProfile.current?.onShowModal()}>
            <Icon name="person-outline" />
          </Button>
        </Right>
      </Header>

        } 
        {this.state.showOption===1 && 
          <Segment>
              <Button first  active={this.state.currentTab==='Defects'} onPress={()=>this.onSegment('Defects')}>
                <Text>Defects</Text>
              </Button>
              <Button last active={this.state.currentTab==='RFWI'} onPress={()=>this.onSegment('RFWI')}>
                <Text>RFWI</Text>
              </Button>
            </Segment>
        }
        
          <Content padder>
            <List>
          { 
            this.state.details.map((detail:StatusDetail,index:number)=>
            
              <ListItem  itemDivider avatar key={index} onPress={()=>this.onShowListing(detail.status)} >
              <Left>
                <Thumbnail small source={detail.image} />
              </Left>
              <Body>
                <Text style={{fontWeight:"bold"}}>{detail.status}</Text>
                <Text note style={{fontWeight:"bold"}}>Cases: {detail.count}</Text>
              </Body>
              <Right>
                <Button transparent onPress={()=>this.onShowListing(detail.status)}>
                  <Icon active name="chevron-forward-outline" />
                </Button>
              </Right>
            </ListItem>
            )
          }
          </List>
        </Content>
        <ModelProfile ref={this.modelProfile} onExitApp={this.onExitApp} />
      </Container>
    );
  }
}


export default Tasks;
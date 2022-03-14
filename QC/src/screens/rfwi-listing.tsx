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
  Title,
  Subtitle,
  Left,
  Right,
  ActionSheet,
  Card,
  CardItem,
  
  Thumbnail,
  Row,
  Grid,
  Col
} from "native-base";
import {styles} from "../theme/appStyle";


import { AuthStackParamList } from '../navigation/auth-stack-param-list';
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { Alert, FlatList, Image, ListRenderItemInfo } from "react-native";
import { getProjectMaster,  getRFWI,  getRFWItatusImage,  IImages, IProject, IRFWIDetail, removeDefectsOrRFWI, updateRFWI } from "../utilities/project-functions";
import moment from "moment";
import { getUserInfo, IAppUser } from "../utilities/user-functions";
import { showSuccessToast } from "../utilities/master-functions";
import ModelTimeSlot from "./modal-time-slot";


type ScreenRouteProp = RouteProp<AuthStackParamList, 'RFWIListing'>;

type ScreenNavigationProp = StackNavigationProp< AuthStackParamList,'RFWIListing'>;

type Props = { 
  route: ScreenRouteProp;
  navigation: ScreenNavigationProp;
};

interface IState {
    user:IAppUser;
    sortBy:string;
    search:boolean;
    searchText:string;
    rfwiAll:IRFWIDetail[];
    rfwi:IRFWIDetail[];
    removed:boolean,
    removedId:number
         
  }

  
var BUTTONS = ["Project Name","Date", "Status", "Trade", "inspector","Clear", "Close"];
var DESTRUCTIVE_INDEX = 5;
var CANCEL_INDEX = 6;

  
class RFWIListing extends Component<Props,IState> {

  modelTimeSlot = React.createRef<ModelTimeSlot>();
  constructor(props:Props)
  {
    super(props)

    this.state ={
        user:getUserInfo(),
        sortBy:'Project Name',
        search:false,
        searchText:'',
        rfwiAll:[],
        rfwi:[],
        removed:false,
        removedId:0
      }
      this.formatRFWI=this.formatRFWI.bind(this)
      this.onRFWIRemoved = this.onRFWIRemoved.bind(this)
  
    }

    componentDidMount()
    {
        getRFWI(this.formatRFWI);
    } 
    formatRFWI(list:IRFWIDetail[])
    {
      if (Array.isArray(list))
      {
        let filtered:IRFWIDetail[]=[];
  
        list.sort((a,b) => moment(a.entryDate,'DD/MM/YYYY').isValid() && moment(b.entryDate,'DD/MM/YYYY') ?
                  moment(a.entryDate,'DD/MM/YYYY').isSameOrAfter(moment(b.entryDate,'DD/MM/YYYY'))?-1:1
                  :0)
  
        if (this.props.route.params.status==='All')
          filtered = JSON.parse(JSON.stringify(list))
        else
          filtered = list.filter((e)=>e.status===this.props.route.params.status);
            
        this.setState({rfwiAll:list,rfwi:filtered})
    
      }
    }
  
  
  onShowSorting()
  {
    let that=this;
    ActionSheet.show(
      {
        options: BUTTONS,
        cancelButtonIndex: CANCEL_INDEX,
        destructiveButtonIndex: DESTRUCTIVE_INDEX,
        title: "Select sortby"
      },
      buttonIndex => {

        this.onFilter(BUTTONS[buttonIndex]);
      }
    )
  }

  onFilter(selected:string)
  {
    if (selected!=='Close')
    {
      let row = this.state.rfwi;
      if (selected==='Clear')
      {
        row.sort((a,b) => a.project.name.localeCompare(b.project.name));
      }
      else
      {
        if(selected==='Project Name')
        {
            row.sort((a,b) => a.project.name.localeCompare(b.project.name));
        }
        else if (selected==='Date')
        {
            row.sort((a,b) => moment(a.entryDate,'DD/MM/YYYY').isValid() && moment(b.entryDate,'DD/MM/YYYY') ?
            moment(a.entryDate,'DD/MM/YYYY').isSameOrAfter(moment(b.entryDate,'DD/MM/YYYY'))?-1:1
            :0)
        }
        else if (selected==='Status')
        {
            row.sort((a,b) => a.status.localeCompare(b.status));
        }
        else if (selected==='Trade')
        {
            row.sort((a,b) => a.trade.name.localeCompare(b.trade.name));
        }
        else if (selected==='Inspector')
        {
            row.sort((a,b) => a.inspector.name.localeCompare(b.inspector.name))
        }

      }
      
      this.setState({ sortBy: selected,rfwi:row });
    }
    
  }
  onShowSearch()
  {
    let old=this.state.search;
    if (old)
    {
      this.setState({search:false,searchText:''});
      this.onDoSearch('')
    }
    else
      this.setState({search:true,searchText:''})
      
  }
  onDoSearch(searchText:string)
  {
    let row = this.state.rfwiAll;
    if(searchText==='')
    {
      this.setState({rfwi:row})
    }
    else 
    {
      this.setState({rfwi:row.filter((e)=>(e.project.name+e.status+e.no+e.inspector.name).toUpperCase().indexOf(searchText.toUpperCase())>=0)})
    }
  }
  
  onGoBack()
  {
    if(this.state.removed)
      this.props.navigation.push('Sync',{module:'RFWI'})
    else
      this.props.navigation.goBack()
  }

  onShowRFWI(detail:IRFWIDetail)
  {
    
    this.props.navigation.push('RFWIManage',{rfwi:detail});
  }

  onRemoveRFWI(detail:IRFWIDetail)
  {
    this.setState({removedId:detail.id})
    updateRFWI('REMOVE',detail,this.onRFWIRemoved);
    
  }

  onRFWIRemoved(removed:boolean)
  {
    if(removed)
    {
      removeDefectsOrRFWI(this.state.removedId,'buildqas-qc-rfwi-delete');
      let rfwiAllChanged:IRFWIDetail[]=[];
      let rfwiChanged:IRFWIDetail[]=[];
      let removed = this.state.removedId;

      this.state.rfwiAll.forEach((rfwi:IRFWIDetail)=>{
        if(rfwi.id!==removed)
            rfwiAllChanged.push(rfwi)
      })

      this.state.rfwi.forEach((rwfi:IRFWIDetail)=>{
        if(rwfi.id!==removed)
            rfwiChanged.push(rwfi)
      })

      this.setState({rfwiAll:rfwiAllChanged,rfwi:rfwiChanged,removed:true,removedId:0})
      showSuccessToast('RFWI removed');
    }
      
  }
  onSlotSelected(start:string,end:string,slotSelected:string){}

  getInspectionSlot(rfwiDetail:IRFWIDetail)
  {
    if (rfwiDetail.startTime && rfwiDetail.startTime.length>=5)
    rfwiDetail.startTime = rfwiDetail.startTime.substring(0,5);
    if (rfwiDetail.endTime && rfwiDetail.endTime.length>=5)
    rfwiDetail.endTime = rfwiDetail.endTime.substring(0,5);
    if (rfwiDetail.startTime && rfwiDetail.endTime&& rfwiDetail.startTime.length>=5&& rfwiDetail.endTime.length>=5)
    {
        let slot=this.modelTimeSlot.current?.getSlotLabel(rfwiDetail.startTime,rfwiDetail.endTime);
        return slot as string;
    }
    return '';
  }
  
  render() {
      
    return (
      <Container style={styles.container}>
                <Header>
          <Left>
              <Button transparent onPress={()=>this.onGoBack()}>
                <Icon active name="arrow-back-outline" />
              </Button>
          </Left>

          <Body style={{ flex: 2 }}>
            {
              this.props.route.params.project!=='' 
              ? <Subtitle>{this.props.route.params.project}</Subtitle>
              : <Subtitle>My Tasks</Subtitle>
            }
            
            <Title>{this.props.route.params.status} RFWI</Title>
          </Body>
          <Right>
              <Button transparent onPress={()=>this.onShowSorting()}>
                <Icon active name="swap-vertical-outline" />
              </Button>
          
              <Button transparent onPress={()=>this.onShowSearch()}>
                <Icon active name="search-outline" />
              </Button>
          </Right>

        </Header>

        <Content padder>
          {
            this.state.search && 
            <Item>
              <Icon active name='search-outline' />
              <Input placeholder='enter search detail' onChangeText={(e)=>this.onDoSearch(e)}/>
              <Icon active name='close-outline' onPress={()=>this.onShowSearch()}/>
            </Item>
          }
          {
            this.state.rfwi.map((rfwi:IRFWIDetail,index:number)=>
              <Card style={{flex: 0 }} key={index}>
                <CardItem bordered style={{backgroundColor:index % 2 === 0 ? '#b3e6ff' : '#d6f5f5' }} >
                  <Grid>
                    <Col style={{width:50}}><Button transparent onPress={()=>this.onShowRFWI(rfwi)}>
                      <Thumbnail small source={getRFWItatusImage(rfwi.status)} />
                      </Button>
                    </Col>
                    <Col><Text>{rfwi.no}</Text>
                      <Text>{rfwi.entryDate} - {rfwi.status}</Text>
                    </Col>
                    {
                      rfwi.status==='Pending' && rfwi.otherSigned!==true && this.state.user.groupId==='5' &&
                      <Col style={{width:50}}>
                      <Button transparent onPress={()=>this.onRemoveRFWI(rfwi)} >
                        <Icon name="trash-outline" style={{fontSize: 24, color: 'red'}} />
                      </Button>
                    </Col>

                    }
                    <Col style={{width:50}}>
                      <Button transparent onPress={()=>this.onShowRFWI(rfwi)}>
                        <Icon active fontSize={60} name="create-outline" style={{fontSize: 24, color: 'black'}} />
                      </Button>
                    </Col>
                  </Grid>
                </CardItem>
                <CardItem bordered>
                  <Grid>
                    <Row style={{marginBottom:4}}>
                      <Col style={{width:50}}><Icon active name="business-outline" /></Col>
                      <Col><Text>{rfwi.project.name}</Text></Col>
                    </Row>
                    {
                        rfwi.drawingReference.length>0 && 
                        <Row style={{marginBottom:4}}>
                            <Col style={{width:50}}><Icon active name="location-outline" /></Col>
                            <Col><Text>{rfwi.drawingReference[0].locations.name}</Text></Col>
                        </Row>
                    }
                    <Row>
                      <Col style={{width:50}}><Icon active name="person-outline" /></Col>
                      <Col><Text>{rfwi.inspector.name}</Text></Col>
                    </Row>
                    {
                        rfwi.inspectionDate && 
                        <Row>
                            <Col style={{width:50}}><Icon active name="calendar-outline" /></Col>
                            <Col><Text>{rfwi.inspectionDate} - {this.getInspectionSlot(rfwi)}</Text></Col>
                        </Row>
                    }
                    
                  </Grid>
                </CardItem> 
              </Card>

            )
          }
        </Content>
        <ModelTimeSlot ref={this.modelTimeSlot} onSlotSelected={this.onSlotSelected}/>
      </Container>
    );
  }
}


export default RFWIListing;
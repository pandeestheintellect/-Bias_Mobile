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
  Image,
  Thumbnail,
  H3,
  Grid,
  Col,
  Row
} from "native-base";
import {styles} from "../theme/appStyle";


import { AuthStackParamList } from '../navigation/auth-stack-param-list';
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { Alert, FlatList, ListRenderItemInfo } from "react-native";
import { getDefects, getDefectStatusImage, IDefectDetail, removeDefectsOrRFWI, updateDefects } from "../utilities/project-functions";
import { showSuccessToast } from "../utilities/master-functions";
import moment from "moment";
import { getUserInfo, IAppUser } from "../utilities/user-functions";


type ScreenRouteProp = RouteProp<AuthStackParamList, 'QCListing'>;

type ScreenNavigationProp = StackNavigationProp< AuthStackParamList,'QCListing'>;

type Props = {
  route: ScreenRouteProp;
  navigation: ScreenNavigationProp;
};

interface IState {
  user:IAppUser;
  sortBy:string;
  search:boolean;
  searchText:string;
  defectsAll:IDefectDetail[];
  defects:IDefectDetail[];
  removed:boolean,
  removedId:number
}

var BUTTONS = ["Project Name","Date", "Status", "Location", "Subcontractor","Clear", "Close"];
var DESTRUCTIVE_INDEX = 5;
var CANCEL_INDEX = 6;

class QCListing extends Component<Props,IState> {

  constructor(props:Props)
  {
    super(props)
    
    this.state ={
      user:getUserInfo(),
      sortBy:'Project Name',
      search:false,
      searchText:'',
      defectsAll:[],
      defects:[],
      removed:false,
      removedId:0
    }

    this.formatDefects=this.formatDefects.bind(this)
    this.onDefectRemoved = this.onDefectRemoved.bind(this)

  }
  componentDidMount()
  {
    getDefects(this.formatDefects);
  } 
  formatDefects(defectList:IDefectDetail[])
  {
    if (Array.isArray(defectList))
    {
      let filtered:IDefectDetail[]=[];

      defectList.sort((a,b) => moment(a.entryDate,'DD/MM/YYYY').isValid() && moment(b.entryDate,'DD/MM/YYYY') ?
                moment(a.entryDate,'DD/MM/YYYY').isSameOrAfter(moment(b.entryDate,'DD/MM/YYYY'))?-1:1
                :0)

      if (this.props.route.params.status==='All')
        filtered = JSON.parse(JSON.stringify(defectList))
      else
        filtered = defectList.filter((e)=>e.status===this.props.route.params.status);
  
      
      this.setState({defectsAll:defectList,defects:filtered})
  
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
      let row = this.state.defects;
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
        else if (selected==='Location')
        {
            row.sort((a,b) => a.location.name.localeCompare(b.location.name));
        }
        else if (selected==='Subcontractor')
        {
            row.sort((a,b) => a.subcontractor.name.localeCompare(b.subcontractor.name))
        }

      }
      
      this.setState({ sortBy: selected,defects:row });
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
    let row = this.state.defectsAll;
    if(searchText==='')
    {
      this.setState({defects:row})
    }
    else 
    {
      this.setState({defects:row.filter((e)=>(e.project.name+e.status+e.no+e.location.name).toUpperCase().indexOf(searchText.toUpperCase())>=0)})
    }
  }
  onRenderListItem(defect:ListRenderItemInfo<IDefectDetail>)
  {
    return <Card style={{flex: 0 }}>
    <CardItem bordered >
      <Left>
      <Button transparent onPress={()=>this.onShowQC(defect.item)}>
        <Thumbnail small source={getDefectStatusImage(defect.item.status)} />
        </Button>
      </Left>
        <Body style={{flex:2}}>
          <Text>{defect.item.no}</Text>
          <Text>{defect.item.entryDate} - {defect.item.status}</Text>
        </Body>
      
      <Right>
        <Button transparent onPress={()=>this.onShowQC(defect.item)}>
          <Icon active fontSize={60} name="chevron-forward-outline" />
        </Button>
      </Right>
    </CardItem>
    
    <CardItem bordered>
      <Left>
          <Icon active name="business-outline" />
      </Left>
      <Body style={{ flex: 5 }}>
        <Text>{defect.item.project.name}</Text>
      </Body>
    </CardItem>
    <CardItem bordered>
      <Left>
          <Icon active name="location-outline" />
      </Left>
      <Body style={{ flex: 5 }}>
        <Text>{defect.item.location.name}</Text>
      </Body>
    </CardItem>
    <CardItem bordered>
      <Left>
          <Icon active name="person-outline" />
      </Left>
      <Body style={{ flex: 5 }}>
        <Text>{defect.item.subcontractor.name}</Text>
      </Body>
    </CardItem>
  </Card>

  }
  onRemoveQC(defectDetail:IDefectDetail)
  {
    this.setState({removedId:defectDetail.id})
    updateDefects('REMOVE',defectDetail,this.onDefectRemoved);
    
    
  }
  onDefectRemoved(removed:boolean)
  {
    if(removed)
    {
      removeDefectsOrRFWI(this.state.removedId,'buildqas-qc-defect-delete');
      let defectsChanged:IDefectDetail[]=[];
      let defectsAllChanged:IDefectDetail[]=[];
      let removed = this.state.removedId;

      this.state.defectsAll.forEach((defect:IDefectDetail)=>{
        if(defect.id!==removed)
          defectsAllChanged.push(defect)
      })

      this.state.defects.forEach((defect:IDefectDetail)=>{
        if(defect.id!==removed)
          defectsChanged.push(defect)
      })

      this.setState({defectsAll:defectsAllChanged,defects:defectsChanged,removed:true,removedId:0})
      showSuccessToast('Defect removed');
    }
      
  }

  onShowQC(defectDetail:IDefectDetail)
  {
    console.log(defectDetail)
    this.props.navigation.push('QCManage',{defect:defectDetail});
  }
  onGoBack()
  {
    if(this.state.removed)
      this.props.navigation.push('Sync',{module:'Defects'})
    else
      this.props.navigation.goBack()
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
            
            <Title>{this.props.route.params.status} defects</Title>
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
            this.state.defects.map((defect:IDefectDetail,index:number)=>
              <Card style={{flex: 0 }} key={index}>
                <CardItem bordered style={{backgroundColor:index % 2 === 0 ? '#b3e6ff' : '#d6f5f5' }} >
                  <Grid>
                    <Col style={{width:50}}><Button transparent onPress={()=>this.onShowQC(defect)}>
                      <Thumbnail small source={getDefectStatusImage(defect.status)} />
                      </Button>
                    </Col>
                    <Col><Text>{defect.no}</Text>
                      <Text>{defect.entryDate} - {defect.status}</Text>
                    </Col>
                    {
                      defect.status==='Pending' && this.state.user.groupId==='5' &&
                      <Col style={{width:50}}>
                      <Button transparent onPress={()=>this.onRemoveQC(defect)} >
                        <Icon name="trash-outline" style={{fontSize: 24, color: 'red'}} />
                      </Button>
                    </Col>

                    }
                    <Col style={{width:50}}>
                      <Button transparent onPress={()=>this.onShowQC(defect)}>
                        <Icon active fontSize={60} name="create-outline" style={{fontSize: 24, color: 'black'}} />
                      </Button>
                    </Col>
                  </Grid>
                </CardItem>
                <CardItem bordered>
                  <Grid>
                    <Row style={{marginBottom:4}}>
                      <Col style={{width:50}}><Icon active name="business-outline" /></Col>
                      <Col><Text>{defect.project.name}</Text></Col>
                    </Row>
                    <Row style={{marginBottom:4}}>
                      <Col style={{width:50}}><Icon active name="location-outline" /></Col>
                      <Col><Text>{defect.location.name}</Text></Col>
                    </Row>
                    <Row>
                      <Col style={{width:50}}><Icon active name="person-outline" /></Col>
                      <Col><Text>{defect.subcontractor.name}</Text></Col>
                    </Row>

                  </Grid>
                </CardItem> 
              </Card>

            )
          }
        </Content>
      </Container>
    );
  }
}


export default QCListing;
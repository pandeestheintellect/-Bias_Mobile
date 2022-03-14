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
  Thumbnail
} from "native-base";
import {styles} from "../theme/appStyle";


import { AuthStackParamList } from '../navigation/auth-stack-param-list';
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { Alert } from "react-native";
import { getProjectMaster, IDefectDetail, IProject, IRFWIDetail } from "../utilities/project-functions";
import moment from "moment";
import { getUserInfo, IAppUser } from "../utilities/user-functions";


type ScreenRouteProp = RouteProp<AuthStackParamList, 'ProjectListing'>;

type ScreenNavigationProp = StackNavigationProp< AuthStackParamList,'ProjectListing'>;

type Props = {
  route: ScreenRouteProp;
  navigation: ScreenNavigationProp;
};

interface IState {
  search:boolean;
  searchText:string;
  projectsAll:IProject[];
  projects:IProject[];
  user:IAppUser

}

class ProjectListing extends Component<Props,IState> {

  constructor(props:Props)
  {
    super(props)
    
    this.state ={
      
      search:false,
      searchText:'',
      projectsAll:[],
      projects:[],
      user:getUserInfo()
    }

    this.formatProjectMaster = this.formatProjectMaster.bind(this)
  }
  
  componentDidMount()
  {
    getProjectMaster(this.formatProjectMaster)
  }
  formatProjectMaster(projectsList:IProject[]|string){

    if(Array.isArray(projectsList)){
      
      this.setState({projectsAll:projectsList,projects:projectsList})
  
    }
  }

  onShowSearch()
  {
    let old=this.state.search;
    if (old)
    {
      this.setState({search:false,searchText:''})
      this.onDoSearch('');
    }
    else
      this.setState({search:true,searchText:''})
  }
  onDoSearch(searchText:string)
  {
    let row = this.state.projectsAll;
    if(searchText==='')
    {
      this.setState({projects:row})
    }
    else 
    {
      this.setState({projects:row.filter((e)=>(e.name).toUpperCase().indexOf(searchText.toUpperCase())>=0)})
    }
  }


  onShowListing(currentProject:string)
  {
    
    if (this.props.route.params.type==='Defects')
      this.props.navigation.push('QCListing',{status:'All', project:currentProject});
    else
      this.props.navigation.push('RFWIListing',{status:'All', project:currentProject});
  }

  onShowLodge(currentProject:IProject)
  {
    if (this.props.route.params.type==='Defects')
    {
      let defect:IDefectDetail={
        id:Math.floor(100 + Math.random() * 900),no:'', entryDate: moment(new Date()).format('DD/MM/YYYY'),status:'New',
              project:{id: currentProject.id,name:currentProject.name},
              manager:{id: currentProject.manager[0].id ,name:currentProject.manager[0].name},
              location:{id: 0,name:''},defectRemarks:'',mobileStatus:0,
              subcontractor:{id: 0,name:''},trade:{id: 0,name:''},defect:{id: 0,name:''},defectImages:[],rectifyImages:[]
      }
      this.props.navigation.push('QCManage',{defect:defect});
    }
    else
    {
      let rfwiDetail:IRFWIDetail={
        id:Math.floor(100 + Math.random() * 900),no:'', entryDate: moment(new Date()).format('DD/MM/YYYY'),
        status:'New',requestFor:'Work Inspection',mobileStatus:1,inspectionNo:1,mobileNo:'',
        inspectionDate: moment(new Date()).format('DD/MM/YYYY'),startTime:'', endTime:'',
        project:{id: currentProject.id,name:currentProject.name},
        inspector:{id: 0,name:''}, trade:{id: 0,name:''}, 
        item:{id: 0,name:''}, generalChecklist:[], detailChecklist:[],drawingReference:[],
        proceedRequest:true,otherSigned:false
      }
      this.props.navigation.push('RFWIManage',{rfwi:rfwiDetail,project:currentProject});
    }
  }

  render() {
    return (
      <Container style={styles.container}>
        <Header>
          <Left>
              <Button transparent onPress={()=>this.props.navigation.goBack()}>
                <Icon active name="arrow-back-outline" />
              </Button>
          </Left>

          <Body style={{ flex: 2 }}>
            <Title>My {this.props.route.params.type} projetct</Title>
          </Body>
          <Right>
         
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
            this.state.projects.map((project:IProject,index:number)=>
              <Card style={{flex: 0}} key={index}>
              
              <CardItem>
                <Left>
                    <Icon active name="business-outline" />
                </Left>
                <Body style={{ flex: 5 }}>
                  <Text style={{fontWeight:"bold"}}>{project.name}</Text>
                </Body>
                {
                  this.state.user.groupId!=='5' && 
                  <Right>
                    <Button transparent onPress={()=>this.onShowListing(project.name)}>
                        <Icon name='chevron-forward-outline' />
                    </Button>
                  </Right>
                }
              </CardItem>
              {
                  this.state.user.groupId==='5' && 
                  <CardItem>
                

                  <Left>
  
                    <Button success onPress={()=>this.onShowLodge(project)}>
                        <Icon name='create-outline' /><Text style={{ marginLeft:-20 }}>{this.props.route.params.type==='Defects'?'Lodge Defect':'Create RFWI'}</Text>
                    </Button>
                  
                    <Button style={{ marginLeft:20 }} onPress={()=>this.onShowListing(project.name)}>
                        <Icon name='list-outline' /><Text style={{ marginLeft:-20 }}>View {this.props.route.params.type}</Text>
                    </Button>
                    </Left>
                  
                </CardItem>
                    
                }
            </Card>

            )
          }
        
        </Content>
      </Container>
    );
  }
}


export default ProjectListing;
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
  H3,
  Grid,
  Col
} from "native-base";
import {styles} from "../theme/appStyle";


import { AuthStackParamList } from '../navigation/auth-stack-param-list';
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { Alert, Dimensions, FlatList, Image, ListRenderItemInfo, ScrollView, StyleSheet, View } from "react-native";
import { downloadProjectRFWIDrawing, getProjectMaster, getProjectRFWIDrawing, IDefectDetail, IImages, IProject, IRFWIDrawingFile } from "../utilities/project-functions";
import moment from "moment";
import { checkOnline } from "../utilities/master-functions";
import Pdf from 'react-native-pdf';

type ScreenRouteProp = RouteProp<AuthStackParamList, 'DrawingViewer'>;

type ScreenNavigationProp = StackNavigationProp< AuthStackParamList,'DrawingViewer'>;

type Props = {
  route: ScreenRouteProp;
  navigation: ScreenNavigationProp;
};

interface IState  {
  fileName:string;
  file:string;
  fileType:string;
  remarks:string;
  width:number;
  height:number;
  local:undefined|IRFWIDrawingFile;
  localAvailable:boolean;
  server:undefined|IRFWIDrawingFile;

}

class DrawingViewer extends Component<Props,IState> {

  state:IState;
  constructor(props:Props)
  {
    super(props)

    this.state ={
      fileName:'PDF',
      file:'',
      fileType:'',
      remarks:'',
      width:0,
      height:0,
      local:undefined,
      localAvailable:false,
      server:undefined
    }
    
    this.onLocalFile =this.onLocalFile.bind(this)
    this.onServerFile = this.onServerFile.bind(this)
    this.isOnline =this.isOnline.bind(this)
  }
  
  componentDidMount()
  {
    getProjectRFWIDrawing(this.props.route.params.projectId, this.props.route.params.drawingId ,this.onLocalFile)
  }
  
    onLocalFile(file:undefined|IRFWIDrawingFile)
    {
        if(file!==undefined)
        {
          let type = 'PDF'
          if (file.rfwiDrawings.length>20 && file.rfwiDrawings.startsWith('data:image/'))
            type = 'IMAGE'
            
          Image.getSize(file.rfwiDrawings, (imageWidth, imageHeight) => { this.setState({width: imageWidth, height:imageHeight }) });
          this.setState({local:file,localAvailable:true,remarks:'Continue with available file downloaded on '+file.date,fileType:type})
          console.log(this.state.local?.rfwiDrawings)
        }
        else{
            this.setState({local:file,remarks:'Local file not available downloading...'})
            checkOnline(this.isOnline)
        }
    }
    isOnline(status:boolean)
    {
        console.log(status)
        if (!status)
        {
            this.setState({remarks:'No Internet connection. Continue with offline mode..'})
            return false;
        }
        else
            downloadProjectRFWIDrawing(this.props.route.params.projectId, this.props.route.params.drawingId ,this.onServerFile)
    }
    onServerFile(file:undefined|IRFWIDrawingFile)
    {
        if(file!==undefined)
        {
          let type = 'PDF'
          if (file.rfwiDrawings.length>20 && file.rfwiDrawings.startsWith('data:image/'))
            type = 'IMAGE'
          
          Image.getSize(file.rfwiDrawings, (imageWidth, imageHeight) => { this.setState({width: imageWidth, height:imageHeight }) });
          this.setState({file:file.rfwiDrawings,fileType:type})
        }
        else{
            this.setState({remarks:'Downloading failed..'})
        }
    }

    renderDrawing()
    {
      if(this.state.fileType==='PDF')
        return (
          <Pdf
          source={{uri:'data:application/pdf;base64,'+this.state.file}}
          
      onLoadComplete={(numberOfPages,filePath)=>{
          console.log(`number of pages: ${numberOfPages}`);
      }}
      onPageChanged={(page,numberOfPages)=>{
          console.log(`current page: ${page}`);
      }}
      onError={(error)=>{
          console.log(error);
      }}
      onPressLink={(uri)=>{
          console.log(`Link presse: ${uri}`)
      }}
      style={styles1.pdf}/>

        )
      else
        return (
          <ScrollView
            horizontal
            bounces={false}
        >
            <ScrollView
                nestedScrollEnabled
                bounces={false}
                contentContainerStyle={{ height: this.state.height }}
            >
                <View>
                <Image  source={{uri: this.state.file}}   style={{
                          height: this.state.height,
                          width: this.state.width
                      }}  
                      />
                </View>
            </ScrollView>
        </ScrollView>
        )
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
            <Title>{this.props.route.params.caption}</Title>
          </Body>
        </Header>
        <Content >
          {
            this.state.file.length >10 ?
 
            this.renderDrawing()

            :

            <Card style={{flex: 0}}>
            <CardItem bordered>
              <Left>
                <Thumbnail large  source={require('../images/upload.png')} />
                <Body>
                  <H3>Checking availability.</H3>
                  
                </Body>
              </Left>
            </CardItem>
            
            <CardItem bordered>
              <Grid>
                <Row>
                  <Col>
                    <Text>{this.state.remarks}</Text>
                  </Col>
                </Row>
                {
                  this.state.localAvailable && 
                  <Row style={{height:30,marginTop:20 }}>

                    <Col><Button rounded  small style={{flex:1,marginRight:10}} onPress={()=>this.setState({file:this.state.local?.rfwiDrawings as string})}>
                      <Text >Continue</Text></Button>
                    </Col>
                    <Col><Button rounded success small style={{flex:1,marginRight:10}} onPress={()=>checkOnline(this.isOnline)}>
                      <Text >Download</Text></Button>
                    </Col>

                  </Row>
                }
              </Grid>
              
            </CardItem>
            
          </Card>
          }
        


        </Content>
      </Container>
    );
  }
}

const styles1 = StyleSheet.create({
  container: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'center',
      marginTop: 25,
  },
  pdf: {
      flex:1,
      width:Dimensions.get('window').width,
      height:Dimensions.get('window').height,
  }
});

export default DrawingViewer;
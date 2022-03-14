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
  Row
} from "native-base";
import {styles} from "../theme/appStyle";


import { AuthStackParamList } from '../navigation/auth-stack-param-list';
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { Alert, Dimensions, FlatList, Image, ListRenderItemInfo, ScrollView, View } from "react-native";
import { getProjectMaster, IDefectDetail, IImages, IProject } from "../utilities/project-functions";
import moment from "moment";


type ScreenRouteProp = RouteProp<AuthStackParamList, 'ImageViewer'>;

type ScreenNavigationProp = StackNavigationProp< AuthStackParamList,'ImageViewer'>;

type Props = {
  route: ScreenRouteProp;
  navigation: ScreenNavigationProp;
};

interface IState  {
  width:number;
  height:number;
}

class ImageViewer extends Component<Props,IState> {

  state:IState;
  constructor(props:Props)
  {
    super(props)

    this.state ={
      width:0,
      height:0
    }
    
    Image.getSize(this.props.route.params.image, (imageWidth, imageHeight) => { this.setState({width: imageWidth, height:imageHeight }) });
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
                <Image  source={{uri: this.props.route.params.image}}   style={{
                          height: this.state.height,
                          width: this.state.width
                      }}  
                      />
                </View>
            </ScrollView>
        </ScrollView>

            
        </Content>
      </Container>
    );
  }
}


export default ImageViewer;
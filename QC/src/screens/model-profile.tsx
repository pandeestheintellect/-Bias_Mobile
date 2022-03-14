import { Body, Button, Card, CardItem, Col, Content, Grid, H3, Icon, Image, Left, Row, Spinner, Thumbnail } from "native-base";
import React, { Component } from "react";
import { Dimensions, Modal, PermissionsAndroid, StyleSheet, Text, View } from "react-native";
import { getProfileImage, getUserInfo, IAppUser, setProfileImage } from "../utilities/user-functions";
import {CameraOptions, launchCamera, launchImageLibrary} from 'react-native-image-picker';

import {styles} from "../theme/appStyle";
import { showErrorToast } from "../utilities/master-functions";

interface IProps {
    onExitApp: () =>void;
    
}
interface IState{
    showModel:boolean;
    user:IAppUser;
    userGroup:string;
    profileImage:string;
}


class ModelProfile extends Component<IProps,IState> {

    state:IState;
    constructor(props:IProps)
    {
        super(props)
        let userDetail = getUserInfo();
        let group ='Admin';
        if(userDetail.groupId==='4')
            group='Manager'
        else if(userDetail.groupId==='5')
            group='Supervisor'
        else if(userDetail.groupId==='6')
            group='Contractor'
        else if(userDetail.groupId==='8')
            group='Inspector'    
        else if(userDetail.groupId==='9')
            group='M & E Engineer'
        else if(userDetail.groupId==='10')
            group='Structural Engineer'
        else if(userDetail.groupId==='11')
            group='Other Engineer'
        else if(userDetail.groupId==='6')
            group='Supervisor'         

        this.state = {
            showModel:false,
            user : userDetail,
            userGroup:group,
            profileImage:''
        }
        this.onLoadImage = this.onLoadImage.bind(this)
    }
    componentDidMount()
    {
        getProfileImage(this.onLoadImage)
    }
    onLoadImage(imageString:string)
    {
        if(imageString.length>10)
        this.setState({profileImage:imageString})
    }
    onShowModal()
    {
        this.setState({showModel:true})
        
    }
    onExit()
    {
        this.setState({showModel:false});
        this.props.onExitApp()
    }

    async onShowGallery()
  {
    
    let options:CameraOptions = {
      mediaType: 'photo',
      maxWidth: 800,
      maxHeight: 600,
      quality: 0.6,
      videoQuality: 'high',
      saveToPhotos: true,
      includeBase64:true
    };

    launchImageLibrary(options, (response) => {

      if (response.didCancel) {
        showErrorToast('User cancelled camera picker');
        return;
      } else if (response.errorCode == 'camera_unavailable') {
        showErrorToast('Camera not available on device');
        return;
      } else if (response.errorCode == 'permission') {
        showErrorToast('Permission not satisfied');
        return;
      } else if (response.errorCode == 'others') {
        showErrorToast(response.errorMessage as string);
        return;
      }
      
      setProfileImage('data:'+response.assets[0].type+';base64,'+response.assets[0].base64)
      this.setState({profileImage:'data:'+response.assets[0].type+';base64,'+response.assets[0].base64})

    });
  }
  async onShowCamera()
  {

    try 
    {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "App Camera Permission",
          message:"App needs access to your camera ",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) 
      {
        showErrorToast("Camera permission granded");

        let options:CameraOptions = {
          mediaType: 'photo',
          maxWidth: 1024,
          maxHeight: 1024,
          quality: 0.5,
          videoQuality: 'high',
          saveToPhotos: true,
          includeBase64:true
        };
    
        launchCamera(options, (response) => {
    
          if (response.didCancel) {
            showErrorToast('User cancelled camera picker');
            return;
          } else if (response.errorCode == 'camera_unavailable') {
            showErrorToast('Camera not available on device');
            return;
          } else if (response.errorCode == 'permission') {
            showErrorToast('Permission not satisfied');
            return;
          } else if (response.errorCode == 'others') {
            showErrorToast(response.errorMessage as string);
            return;
          }
          setProfileImage('data:'+response.assets[0].type+';base64,'+response.assets[0].base64)
          this.setState({profileImage:'data:'+response.assets[0].type+';base64,'+response.assets[0].base64})
        });
      } 
      else 
      {
        showErrorToast("Camera permission denied");
      }
    } 
    catch (err) {
      showErrorToast("Camera permission denied: " + err);
    }
  
    
  }

    render() {
        return(
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.showModel}
          onRequestClose={() => {
            this.setState({showModel:false});
          }}
        >
          
          <View style={styles1.centeredView}> 
            <View style={styles1.modalView}>
            <Grid>
                <Row style={{height:30,marginBottom:10}}>
                    <Col style={{justifyContent:'center' }}><H3>Profile</H3></Col>
                    <Col style={{ width: 50,justifyContent:'center' }}><Button transparent onPress={()=>this.setState({showModel:false})}><Icon active name="close-outline" /></Button></Col>
                </Row>
                <Row style={{height:100,justifyContent:'center',alignItems:'center' }}>
                    {this.state.profileImage.length<10 && <Thumbnail large  source={require('../images/avatar.png')} />}
                    {this.state.profileImage.length>10 && <Thumbnail large  source={{uri: this.state.profileImage}} />}
                </Row>
                
                <Row style={{height:48 }}>
                    <Col style={{justifyContent:'center' }}><Text>Change picture</Text></Col>
                    <Col style={{width:80}}><Button transparent onPress={()=>this.onShowGallery()}><Text> Gallery</Text></Button></Col>
                    <Col style={{width:80}}><Button transparent onPress={()=>this.onShowCamera()}><Text> Photo</Text></Button></Col>
                </Row>
                <Row style={{height:30}}>
                    <Col style={{ width: 70,justifyContent:'center'  }}><Text style={styles.cardFieldCaption}>Name:</Text></Col>
                    <Col style={{justifyContent:'center' }}><Text>{this.state.user.userName}</Text></Col>
                </Row>
                <Row style={{height:30}}>
                    <Col style={{ width: 70,justifyContent:'center' }}><Text style={styles.cardFieldCaption}>Group:</Text></Col>
                    <Col style={{justifyContent:'center' }}><Text>{this.state.userGroup}</Text></Col>
                </Row>

                <Row style={{height:30, marginTop:20}}>
                    <Button danger rounded style={{flex:1}} onPress={()=>this.onExit()}>
                        <Text style={{color:'white'}}>Exit from App</Text>
                    </Button>
                    
                </Row>
                

            </Grid>
       
            </View>
        </View>

        </Modal>
        )
    }
}

const styles1 = StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: "center", 
      alignItems: "center",
      backgroundColor:'rgba(0,0,0,0.5)'
      
    },
    modalView: {
      margin: 10,
      backgroundColor: "white",
      borderRadius: 20,
      padding: 35,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      width:Dimensions.get('window').width*0.9,
      height:420,
    },
  });

export default ModelProfile;
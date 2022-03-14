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
  Spinner
} from "native-base";
import {styles} from "../theme/appStyle";
import { Alert, Dimensions, Image, ImageBackground, StyleSheet } from "react-native";

import { RootStackParamList } from '../navigation/root-stack-param-list';
import { StackNavigationProp } from "@react-navigation/stack";
import { MemDb } from "../utilities/mem-db";
import { doLogin, getUserInfo, onLoad } from "../utilities/user-functions";
import { checkOnline, showErrorToast } from "../utilities/master-functions";


type ScreenNavigationProp = StackNavigationProp< RootStackParamList,'Login'>;

type Props = {
  navigation: ScreenNavigationProp;
};

interface IState {
  userId:string;
  password:string;
  continueLogin:boolean;
  isOnline:boolean;
  doLogin:boolean;
  forceLogin:boolean;
}

class Login extends Component<Props,IState> {

  state:IState;
  passwordInput: any;

  constructor(props:Props)
  {
    super(props);

    this.state = { 
      userId : '',
      password:'',
      continueLogin:false,
      isOnline:true,
      doLogin:false,
      forceLogin:false
    }

    this.onAppInit = this.onAppInit.bind(this);
    this.onCompleteLogin = this.onCompleteLogin.bind(this);
    this.onLoginSuccess = this.onLoginSuccess.bind(this);
  }

  componentDidMount()
  {
    onLoad(this.onAppInit);
    
  }
  onAppInit()
  {
      if (getUserInfo().userName!=='Guest')
      {
          this.setState({continueLogin:true})
      }
          
  }
  onLogin(){
    if(this.state.userId.length===0)
    {
      showErrorToast('Please enter valid UserId')
      return;
    }
    if(this.state.password.length===0)
    {
      showErrorToast('Please enter valid Password')
      return;
    }
    
    checkOnline(this.onCompleteLogin);
    
  }
  onCompleteLogin(isConnected:boolean)
  {
    
    if(!isConnected)
    {
      let message ='Please login when you have internet connection';
      if(this.state.continueLogin)
        message = 'Please click to Continue and work in offline mode..'  
      Alert.alert(
        'Internet access not available',
        message,
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel"
          },
          { text: "OK", onPress: () => console.log("OK Pressed") }
        ]
      );
      this.setState({isOnline:false})
    }
    else
    {
      this.setState({doLogin:true})
      doLogin(this.state.userId.trim(),this.state.password.trim(),this.state.forceLogin,this.onLoginSuccess)
      
    }
  }
  onContinueLogin()
  {
      this.onLoginSuccess('OKAY');
  }
  onLoginSuccess(success:string)
  {
      this.setState({doLogin:false})
      if (success==='OKAY')
      {
        this.props.navigation.navigate('Auth');        
      }
      else if (success ==='FORCE-LOGIN')
      {
        this.setState({forceLogin:true})        
      }
      else
        showErrorToast(success)
  }
  renderLoginConfirmation()
  {
    return (
    <Form style={styles1.fromcontainer}>
                
        <Text style={{marginBottom:10,textAlign:'left',fontSize: 22}}>You are already logged in on another device.</Text>
        <Text style={{marginBottom:10,textAlign:'left',fontSize: 20}} >Do you want to close previous session?</Text>
       
        {
          this.state.doLogin?
            <Spinner color='red' style={{ alignSelf:'center',marginTop:20}}/>
          :
          <Item style={{ marginTop:20}}>
            <Button iconLeft onPress={()=>this.onLogin()} rounded>
                  <Icon name='log-in-outline' />
                  <Text>Login</Text>
              </Button>
              <Button iconLeft style={{ marginLeft:20,backgroundColor:'red'}} onPress={()=>this.onContinueLogin()} rounded>
                <Icon name='stop-circle-outline' />
                <Text>Cancel</Text>
              </Button>
          </Item>
          
        }
    </Form>
    )
  }
  renderLoginForm()
  {
    return (
      <Form style={styles1.fromcontainer}>
                
        <Item rounded>
            <Icon active name='person-outline' />
            <Input placeholder='Userid'autoCorrect={false}
              autoCapitalize='none'
              returnKeyType = 'next'
              value={this.state.userId}
              onChangeText={(e)=>this.setState({userId:e.trim()})}
              ref='username'
              onSubmitEditing={() => {
                this.passwordInput.wrappedInstance.focus();
              }}
              
            />
          </Item>

        <Item rounded style={{ marginTop:20}}>
          
            <Icon active name='lock-open-outline' />
            <Input placeholder='Password' autoCorrect={false}
              autoCapitalize='none' secureTextEntry={true}
              returnKeyType = 'next'
              ref={(input) => {
                this.passwordInput = input;
              }}
              
              value={this.state.password}
              onChangeText={(e)=>this.setState({password:e.trim()})}
            />
        </Item>
        {
          this.state.doLogin?
            <Spinner color='red' style={{ alignSelf:'center',marginTop:20}}/>
          :
          this.state.continueLogin
          ? <Item style={{ marginTop:20}}>
            <Button iconLeft onPress={()=>this.onLogin()} rounded>
                  <Icon name='log-in-outline' />
                  <Text>Login</Text>
              </Button>
              <Button iconLeft style={{ marginLeft:20,backgroundColor:'green'}} onPress={()=>this.onContinueLogin()} rounded>
                <Icon name='repeat-outline' />
                <Text>Continue</Text>
              </Button>
          </Item>
          :
            <Button iconLeft style={{ alignSelf:'center',marginTop:20}} onPress={()=>this.onLogin()} rounded>
                  <Icon name='log-in-outline' />
                  <Text>Login</Text>
              </Button>
        }
    </Form>
    )
  }
  renderForm()
  {
    if(this.state.forceLogin)
      return this.renderLoginConfirmation()
    else
      return this.renderLoginForm()
  }
  render() {
    return (
      <Container style={styles.container}>
        <ImageBackground
            source={require('../images/login-bg.jpg')}
            style={styles.fullScreenImage}
        />
        <Content padder>
            {
              this.renderForm()
            }
        </Content>
      </Container>
    );
  }
}


const styles1 = StyleSheet.create({
    picture: {
      flex: 1,
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
      resizeMode: 'cover',
    },
    fromcontainer: {
        
        width:Dimensions.get('window').width*0.9,
        borderRadius:30,
        alignSelf:'center',
        alignItems:'center',
        padding:10,
        maxWidth:300
      },
    
  });
export default Login;
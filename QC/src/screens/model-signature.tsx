import { Button, Col, Content, Grid, H3, Icon, Image, Row } from "native-base";
import React, { Component } from "react";
import { Dimensions, Modal, StyleSheet, Text, View } from "react-native";

import SignatureView, { SignatureViewRef } from 'react-native-signature-canvas';
interface Props{
    
    onSignatureDone: (imageString:string,signatureType?:string) =>void;
}

interface IState{
    showModel:boolean;
    signatureType?:string
}


class ModelSignature extends Component<Props,IState> {

    state:IState;
    signature = React.createRef<SignatureViewRef>();
    constructor(props:Props)
    {
        super(props)

        this.state = {
            showModel:false
        }
        this.onSignatureDone = this.onSignatureDone.bind(this)
    }
    onShowModal(signatureType?:string)
    {
      if(signatureType!==undefined)
        this.setState({showModel:true,signatureType:signatureType})
      else
        this.setState({showModel:true})
        
    }
    onSignatureDone(signature:string) {
      console.log(signature);
      this.props.onSignatureDone(signature,this.state.signatureType)
      this.setState({showModel:false});
    };
  

    onClear()
    {
      this.signature.current?.clearSignature();
    }
    onSave()
    {
      this.signature.current?.readSignature();
    }
    
    render() {
        return(
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.showModel}
          onRequestClose={() => {
            this.setState({showModel:false});
          }}
        >
          <View style={styles.centeredView}> 
            <View style={styles.modalView}>
              <Grid>
                <Row style={{height:30,marginBottom:10}}>
                    <Col style={{justifyContent:'center' }}><H3>Draw Signature</H3></Col>
                    <Col style={{ width: 50,justifyContent:'center' }}><Button transparent onPress={()=>this.setState({showModel:false})}><Icon active name="close-outline" /></Button></Col>
                </Row>
                <Row style={{height:350}}>
                  <Col>
                  <SignatureView
                        ref={this.signature}
                        penColor={'blue'}
                        trimWhitespace={true}
                        onOK={(e)=>this.onSignatureDone(e)} 
                        webStyle={`.m-signature-pad--footer {display: none; margin: 0px;}`}
                    />
                  </Col>
                </Row>
                <Row style={{height:30}}>
                <Col><Button rounded danger  style={{flex:1,marginRight:10}} onPress={()=>this.onClear()} >
                  <Text style={{color:'white',fontWeight:"800"}} >Clear</Text></Button>
                </Col>
                <Col><Button rounded success  style={{flex:1,marginRight:10}} onPress={()=>this.onSave()}>
                  <Text style={{color:'white',fontWeight:"800"}}>Save</Text></Button>
                </Col>
              </Row>
              </Grid>
                
                
            </View>
        </View>

        </Modal>
        )
    }
}

const styles = StyleSheet.create({
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
      padding: 10,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      width:Dimensions.get('window').width*0.9,
      height:450,
      
    },
  });
export default ModelSignature;
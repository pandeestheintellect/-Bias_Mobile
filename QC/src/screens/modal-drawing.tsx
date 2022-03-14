import { Button, Content, Image } from "native-base";
import React, { Component } from "react";
import { Dimensions, Modal, StyleSheet, Text } from "react-native";

import SignatureView, { SignatureViewRef } from 'react-native-signature-canvas';
interface Props{
    onEditImage: (option:string,imageString:string) =>void;
}

interface IState{
    showModel:boolean;
    imageString:string;
    penColor:string;

}


class ModelDrawing extends Component<Props,IState> {

    state:IState;
    signature = React.createRef<SignatureViewRef>();
    constructor(props:Props)
    {
        super(props)

        this.state = {
            showModel:false,
            imageString:'q',
            penColor:'blue'
        }

    }
    onShowModal(image:string)
    {
        this.setState({showModel:true,imageString:image})
        
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
          
            <Content style={styles.centeredView}>
                <Content style={styles.modalView}>
                {this.state.showModel && <Image source={{uri: this.state.imageString}} resizeMode="cover" style={{alignSelf:'center', height: 150, width: Dimensions.get('window').width*0.75}} />}
                    <Button onPress={()=>this.setState({showModel:false})}><Text >Close</Text></Button>
                </Content>
            </Content>
        </Modal>
        )
    }
}

const styles = StyleSheet.create({
    centeredView: {
      flex: 1,
      
      marginTop: 22
    },
    modalView: {
      margin: 20,
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
      elevation: 5
    },
    button: {
      borderRadius: 20,
      padding: 10,
      elevation: 2
    },
    buttonOpen: {
      backgroundColor: "#F194FF",
    },
    buttonClose: {
      backgroundColor: "#2196F3",
    },
    textStyle: {
      color: "white",
      fontWeight: "bold",
      textAlign: "center"
    },
    modalText: {
      marginBottom: 15,
      textAlign: "center"
    }
  });

export default ModelDrawing;
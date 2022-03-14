import { Button, Content, H3, Image, Spinner } from "native-base";
import React, { Component } from "react";
import { Dimensions, Modal, StyleSheet, Text, View } from "react-native";


interface IState{
    showModel:boolean;
}


class ModelLoader extends Component<{},IState> {

    state:IState;
    constructor(props:{})
    {
        super(props)

        this.state = {
            showModel:true
        }

    }
    onShowModal(show:boolean)
    {
        this.setState({showModel:show})
        
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
          
          <View style={styles.centeredView}> 
            <View style={styles.modalView}>
                <Spinner color='red' />
                <H3>Loading ...</H3>
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
  });

export default ModelLoader;
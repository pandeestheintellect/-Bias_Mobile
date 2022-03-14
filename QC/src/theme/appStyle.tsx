import { Dimensions, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        backgroundColor: "#FFF"
    },
    fullScreenImage: {
        flex: 1,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        resizeMode: 'cover',
    },
    cardHeaderCaption:{
        fontWeight:"700",width:'100%',borderBottomColor:'rgba(0, 0, 0, 0.2)', borderBottomWidth:1
    },
    cardFieldCaption:{
        fontSize:18
    },
    cardControl:{
        borderBottomColor:'rgba(0, 0, 0, 0.2)', borderBottomWidth:1
    },
  });
  
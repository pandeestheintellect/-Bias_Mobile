
import React from "react";
import { Root } from "native-base";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";


import Login from './screens/login'
import {Auth} from './navigation/auth-navigation'
import { MemDb } from "./utilities/mem-db";

const Stack = createStackNavigator();
  
export default class App extends React.Component {

    render() {
     return (
        <Root>
            <NavigationContainer>
                <Stack.Navigator initialRouteName="Login">
                    {/*  Login  */}
                    <Stack.Screen
                        name="Login"
                        component={Login}
                        options={{headerShown: false}}
                    />
                    {/*  Login  */}
                    <Stack.Screen
                        name="Auth"
                        component={Auth}
                        options={{headerShown: false}}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </Root>
     )
    }
}
  

import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import WelcomeScreen from '../screens/welcome';
import TaskScreen from '../screens/tasks';
import ProjectListingScreen from '../screens/project-listing'
import QCListingScreen from '../screens/qc-listing';
import QCManageScreen from '../screens/qc-manage';
import ImageViewerScreen from '../screens/image-viewer';
import DrawingViewerScreen from '../screens/drawing-viewer';
import SyncScreen from '../screens/sync';
import RFWIListingScreen from '../screens/rfwi-listing';
import RFWIManageScreen from '../screens/rfwi-manage';

const Stack = createStackNavigator();

export const Auth = () => {
    // Stack Navigator for Login and Sign up Screen
    return (
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Tasks"
          component={TaskScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ProjectListing"
          component={ProjectListingScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="QCListing"
          component={QCListingScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="QCManage"
          component={QCManageScreen}
          options={{headerShown: false}}
          
        />
        <Stack.Screen
          name="ImageViewer"
          component={ImageViewerScreen}
          options={{headerShown: false}}
          
        />
        <Stack.Screen
          name="Sync"
          component={SyncScreen}
          options={{headerShown: false}}
          
        />

        <Stack.Screen
          name="RFWIListing"
          component={RFWIListingScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="RFWIManage"
          component={RFWIManageScreen}
          options={{headerShown: false}}
          
        />
        <Stack.Screen
          name="DrawingViewer"
          component={DrawingViewerScreen}
          options={{headerShown: false}}
          
        />
      </Stack.Navigator>
    );
  };
  
  
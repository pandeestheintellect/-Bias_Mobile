import React, {Component, CSSProperties, lazy, Suspense } from "react";
import {  Route, withRouter } from "react-router-dom";
import { spring, AnimatedSwitch } from 'react-router-transition'

import { AuthRoute } from './services/auth-route'
import { AuthRoutes, NonAuthRoutes } from './models/routes';

import { library } from '@fortawesome/fontawesome-svg-core'
import { faSignInAlt, faRetweet,faSignOutAlt,faBars,faChalkboard,faWindowRestore,faAngleUp,faAngleDown,faLayerGroup, 
  faLocationArrow, faSearch, faBalanceScale, faAngleRight, faTimes, faAngleLeft, faSync, faPlus, faEllipsisV, faBan,
   faSignature, faTrashAlt, faCheck, faSquare, faNewspaper, faPaintRoller, faBrush, faHammer, faHardHat, faUmbrella,
    faBorderAll, faFileInvoice, faEraser, faCalendarAlt, faCropAlt, faBraille, faAlignJustify,faPaintBrush, faBroom, 
    faSave, faUndo, faTh, faEdit, faDraftingCompass, faCheckDouble, faUnlink, faWifi, faHome, faFilePdf } from '@fortawesome/free-solid-svg-icons'

const Login = lazy(() => import('./views/login'));
const NotFound = lazy(() => import('./views/not-found'));
const Dashboard = lazy(() => import('./views/dashboard'));
const Intro = lazy(() => import('./views/intro'));
const AssessmentListing = lazy(() => import('./views/assessment-listing'));
const AssessmentSummary = lazy(() => import('./views/assessment-summary'));
const AssessmentInternalFinishes = lazy(() => import('./views/assessment-internal-finishes'));
const AssessmentExternalWall = lazy(() => import('./views/assessment-external-wall'));
const AssessmentExternalWork = lazy(() => import('./views/assessment-external-work'));
const AssessmentRoofConsctruction = lazy(() => import('./views/assessment-roof-construction')); 
const AssessmentFieldWindow = lazy(() => import('./views/assessment-field-window')); 
const AssessmentWetArea = lazy(() => import('./views/assessment-wet-area')); 
const AssessmentSync = lazy(() => import('./views/assessment-sync')); 
const SyncMaster = lazy(() => import('./views/sync-masters')); 

const Masters = lazy(() => import('./views/masters'));

interface IState {
  isLoggedIn:boolean;
}
class App extends Component<any,IState> {

  constructor(props:any)
  {
    super(props)
    this.state={
      isLoggedIn:false
    }
  }

  componentDidMount()
  {
    library.add(faSignInAlt, faRetweet,faSignOutAlt,faBars,faChalkboard,faWindowRestore,faAngleUp,faAngleDown,
      faAngleRight,faAngleLeft,faLayerGroup,faLocationArrow,faSearch,faBalanceScale,faNewspaper,faTimes,faSync,
      faPlus,faEllipsisV,faBan,faSignature,faTrashAlt,faCheck,faSquare,faPaintRoller,faBrush,faHammer,faHardHat,
      faUmbrella,faBorderAll,faFileInvoice,faEraser,faCalendarAlt,faCropAlt,faBraille,faAlignJustify,faPaintBrush,
      faBroom,faSave,faUndo,faTh,faEdit,faDraftingCompass,faCheckDouble,faUnlink,faWifi,faHome,faFilePdf);
    this.onLogout();
  }


  onLogginSuccess=()=>{
    this.setState({isLoggedIn:true});
  }
  onLogout=()=>{
    this.setState({isLoggedIn:false});
  }
  
  
  render() {
    return (
    <>
      
      <Suspense fallback={<div>Loading...</div>}>
      <AnimatedSwitch
        atEnter={bounceTransition.atEnter}
        atLeave={bounceTransition.atLeave}
        atActive={bounceTransition.atActive}
        mapStyles={mapStyles}
        className="route-wrapper"
      >
        <Route exact path='/'><Login onLogginSuccess={this.onLogginSuccess} /></Route>
        <Route exact path={NonAuthRoutes.login}><Login onLogginSuccess={this.onLogginSuccess} /></Route>
        <AuthRoute path={AuthRoutes.intro} Component={Intro} />
        <AuthRoute path={AuthRoutes.dashboard} Component={Dashboard} />
        <AuthRoute path={AuthRoutes.assessmentListing} Component={AssessmentListing} />
        <AuthRoute path='/assessment-summary/:projectId/:fromListing' Component={AssessmentSummary} />
        <AuthRoute path='/assessment-summary/:projectId' Component={AssessmentSummary} />
        <AuthRoute path='/assessment-internal-finishes/:projectId' Component={AssessmentInternalFinishes} />
        <AuthRoute path='/assessment-external-wall/:projectId' Component={AssessmentExternalWall} />
        <AuthRoute path='/assessment-external-work/:projectId' Component={AssessmentExternalWork} />
        <AuthRoute path='/assessment-roof-construction/:projectId' Component={AssessmentRoofConsctruction} />
        <AuthRoute path='/assessment-field-window/:projectId' Component={AssessmentFieldWindow} />
        <AuthRoute path='/assessment-wet-area/:projectId' Component={AssessmentWetArea} />
        <AuthRoute path='/assessment-sync/:module/:projectId' Component={AssessmentSync} />
        <AuthRoute path='/sync-masters' Component={SyncMaster} />
        <AuthRoute exact path='/masters/:masterId' Component={withRouter(Masters)} />
        <Route component={NotFound} />
      </AnimatedSwitch>
    </Suspense>
    
    </>)
  };
}

function mapStyles(styles:CSSProperties) {
  return {
    opacity: styles.opacity,
    transform: `scale(${styles.scale})`,
  };
}

// wrap the `spring` helper to use a bouncy config
function bounce(val:number) {
  return spring(val, {
    stiffness: 330,
    damping: 22,
  });
}

// child matches will...
const bounceTransition = {
  // start in a transparent, upscaled state
  atEnter: {
    opacity: 0,
    scale: 1.2,
  },
  // leave in a transparent, downscaled state
  atLeave: {
    opacity: bounce(0),
    scale: bounce(0.8),
  },
  // and rest at an opaque, normally-scaled state
  atActive: {
    opacity: bounce(1),
    scale: bounce(1),
  },
};


export default App;
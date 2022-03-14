import React, { Component, Fragment } from "react";

import {  Picker } from "@react-native-picker/picker";

import {
  Container,
  Content,
  Button,
  Text,
  Icon,
  
  Body,
  Card,
  CardItem,
  Header,
  Left,
  Right,
  Title,
  Subtitle,
  H3,
  Tab,
  TabHeading,
  Tabs,
  Textarea,
  Toast,
  Switch
  
} from "native-base";
import {styles} from "../theme/appStyle";
import { Col, Row, Grid } from "react-native-easy-grid";
import {CameraOptions, launchCamera, launchImageLibrary} from 'react-native-image-picker';

import { AuthStackParamList } from '../navigation/auth-stack-param-list';
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { downloadDefectImages, getProjectMaster, IDefectDetail, IImages, IProject, updateDefects } from "../utilities/project-functions";
import { Alert, Dimensions, FlatList, Image, ListRenderItemInfo, Modal, PermissionsAndroid } from "react-native";
import { getUserInfo, IAppUser } from "../utilities/user-functions";
import { getDefectMaster, getSubcontractorMaster, getTradeMaster, INameId, ISubcontractor, showErrorToast, showSuccessToast } from "../utilities/master-functions";
import ModelDrawing from "./modal-drawing";
import moment from "moment";
import ModelLoader from "./modal-loader";
import ModelSignature from "./model-signature";



type ScreenRouteProp = RouteProp<AuthStackParamList, 'QCManage'>;

type ScreenNavigationProp = StackNavigationProp< AuthStackParamList,'QCManage'>;

type Props = {
  route: ScreenRouteProp;
  navigation: ScreenNavigationProp;
};

interface IState {
  search:boolean;
  searchText:string;
  user:IAppUser;

  byPass:boolean;
  defect:IDefectDetail;
  defectList:INameId[];
  tradeList:INameId[];
  subcontractorFullList:ISubcontractor[];
  subcontractorList:INameId[];
  locationList:INameId[];

  
}
class QCManage extends Component<Props,IState> {

  modelDrawing = React.createRef<ModelDrawing>();
  modelLoader = React.createRef<ModelLoader>();
  modelSignature = React.createRef<ModelSignature>();

  
  constructor(props:Props)
  {
    super(props)
    
    
    this.state ={
      
      search:false,
      searchText:'',
      user:getUserInfo(),
      byPass:false,
      defect:this.props.route.params.defect,

      defectList:[],
      tradeList:[],
      subcontractorFullList:[],
      subcontractorList:[],
      locationList:[],
    }
    this.onEditImage=this.onEditImage.bind(this)
    this.onDefectMasterDownloaded = this.onDefectMasterDownloaded.bind(this);
    this.onTradeMasterDownloaded = this.onTradeMasterDownloaded.bind(this);
    this.onSubcontractorMasterDownloaded = this.onSubcontractorMasterDownloaded.bind(this);
    this.onProjectMasterDownloaded = this.onProjectMasterDownloaded.bind(this);
    this.onCheckImages = this.onCheckImages.bind(this);
    this.onLoadImages = this.onLoadImages.bind(this);
    this.onSignatureDone = this.onSignatureDone.bind(this)
    this.onSync = this.onSync.bind(this)

    
  }
  
  componentDidMount()
  {
    let status =this.props.route.params.defect.status; 
    if (status==='New' || status==='Pending')
      getDefectMaster(this.onDefectMasterDownloaded); 
    else
      this.onCheckImages()
  }
  
  onDefectMasterDownloaded(moduls:INameId[]|string)
  {
      if(Array.isArray(moduls))
      {
          this.setState({defectList:moduls as INameId[]});
          getTradeMaster(this.onTradeMasterDownloaded);
      }
      else
        showErrorToast(moduls as string)
  }
  onTradeMasterDownloaded(moduls:INameId[]|string)
  {
      if(Array.isArray(moduls))
      {
          this.setState({tradeList:moduls as INameId[]})
          getSubcontractorMaster(this.onSubcontractorMasterDownloaded);
      }
      else
        showErrorToast(moduls as string)
  }
  onSubcontractorMasterDownloaded(moduls:ISubcontractor[]|string)
  {
      if(Array.isArray(moduls))
      {
        let list:INameId[]=[];
          

          if (this.state.defect.trade.id!==0)
          {
            (moduls as ISubcontractor[]).forEach((subcontractor:ISubcontractor)=>{
                subcontractor.trades.forEach((trade:INameId)=>{
                    if(trade.id===this.state.defect.trade.id)
                    {
                        list.push({id:subcontractor.id,name:subcontractor.name});
                    }
                })    
            })
          }
          this.setState({subcontractorFullList:moduls as ISubcontractor[],subcontractorList:list})
          getProjectMaster(this.onProjectMasterDownloaded);
      }
      else
        showErrorToast(moduls as string)
  }

  onProjectMasterDownloaded(moduls:IProject[]|string)
  {
      if(Array.isArray(moduls))
      {
        
          let projects:IProject[] = moduls.filter(module=>module.id===this.props.route.params.defect.project.id)
          
          let defectDetail = this.state.defect;
          
          if(projects.length>=1)
          {
            if(this.state.defect.location.id===0)
            {
              if(projects[0].locations.length>0)
                defectDetail.location = projects[0].locations[0];
            }
         
              this.setState({defect:defectDetail,
                  locationList:projects[0].locations
              });

          }
          if(defectDetail.status!=='New')
            this.onCheckImages();
          else
            this.modelLoader.current?.onShowModal(false);
      }
      else
        showErrorToast(moduls as string)
  }
  onCheckImages()
  {
    downloadDefectImages(this.state.defect.id, this.onLoadImages)
  }
  onLoadImages(defectimg:IImages[],rectifyimg:IImages[])
  {
    let defectDetail = this.state.defect;

    if(defectimg.length>0)
    {
      defectDetail.defectImages = defectimg;
    }
    if(rectifyimg.length>0)
    {
      defectDetail.rectifyImages = rectifyimg;
    }

    this.setState({defect:defectDetail})
    this.modelLoader.current?.onShowModal(false);
  }
  onInformationSelected(option:string, selected:number)
  {
    let defectDetail = this.state.defect;
    if (option==='Location')
    {
      let sectedlocation = this.state.locationList.filter((e:INameId)=>e.id===selected)
      if (sectedlocation.length>0)
        defectDetail.location={id:sectedlocation[0].id,name:sectedlocation[0].name};
    }
    else if (option==='Defect')
    {
      let sectedlocation = this.state.defectList.filter((e:INameId)=>e.id===selected)
      if (sectedlocation.length>0)
        defectDetail.defect={id:sectedlocation[0].id,name:sectedlocation[0].name};
    }
    else if(option==='Trade')
    {
        let list:INameId[]=[];
        let sectedlocation = this.state.tradeList.filter((e:INameId)=>e.id===selected)
        if (sectedlocation.length>0)
        {
          this.state.subcontractorFullList.forEach((subcontractor:ISubcontractor)=>{
              subcontractor.trades.forEach((trade:INameId)=>{
                  if(trade.id===sectedlocation[0].id)
                  {
                      list.push({id:subcontractor.id,name:subcontractor.name});
                  }
              })    
          })

          if(list.length>0)
            defectDetail.subcontractor = list[0];

          defectDetail.trade={id:sectedlocation[0].id,name:sectedlocation[0].name};
      }
      this.setState({subcontractorList:list});
    }
    else if (option==='Subcontractor')
    {
      let sectedlocation = this.state.subcontractorList.filter((e:INameId)=>e.id===selected)
      if (sectedlocation.length>0)
        defectDetail.subcontractor={id:sectedlocation[0].id,name:sectedlocation[0].name};
    }
    this.setState({defect:defectDetail})
  }
  onRemarkChange(option:string,value:string)
  {
      let defectDetail = this.state.defect;
      let user = this.state.user;
      if(option==='Defect')
        defectDetail.defectRemarks = value;
      else if(option==='ReDo')
      {
          if(!defectDetail.reDo)
            defectDetail.reDo={by:user.userId,date:moment(new Date()).format('DD/MM/YYYY'), remarks:value, signature:''}
          else 
            defectDetail.reDo.remarks =value;
      }
      else if(option==='ReDoDone')
      {
          if(!defectDetail.reDoDone)
            defectDetail.reDoDone={by:user.userId,date:moment(new Date()).format('DD/MM/YYYY'), remarks:value, signature:''}
          else 
            defectDetail.reDoDone.remarks =value;

      }
      else if(option==='Approve')
      {
          if(!defectDetail.approved)
          defectDetail.approved={by:user.userId,date:moment(new Date()).format('DD/MM/YYYY'), remarks:value, signature:''}
          else 
          defectDetail.approved.remarks =value;
      }
      else if(option==='Rework')
      {
          if(!defectDetail.rework)
          defectDetail.rework={by:user.userId,date:moment(new Date()).format('DD/MM/YYYY'), remarks:value, signature:''}
          else 
          defectDetail.rework.remarks =value;
      }  
      else if(option==='Rectify')
      {
          if(!defectDetail.rectify)
          defectDetail.rectify={by:user.userId,date:moment(new Date()).format('DD/MM/YYYY'), remarks:value, signature:''}
          else 
          defectDetail.rectify.remarks =value;
      } 
      else if(option==='Completed')
      {
          if(!defectDetail.complete)
          defectDetail.complete={by:user.userId,date:moment(new Date()).format('DD/MM/YYYY'), remarks:value, signature:''}
          else 
          defectDetail.complete.remarks =value;
      }
      this.setState({defect:defectDetail});
  }
  onShowSearch()
  {
    let old=this.state.search;
    if (old)
    {
      this.setState({search:false,searchText:''})
    }
    else
      this.setState({search:true,searchText:''})
  }
  onShowListing(currentProject:string)
  {
    this.props.navigation.push('QCListing',{status:'All', project:currentProject});
  }

  async onShowGallery(imageType:string)
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
      
      let defectdetail = this.state.defect;
      
      if(imageType==='Defect')
        defectdetail.defectImages.push({id:this.state.defect.defectImages.length+1,
          name:imageType+'-'+response.assets[0].fileName?.substring(25)  ,caption:imageType+(this.state.defect.defectImages.length+1),
          type:'Defect', file:'data:'+response.assets[0].type+';base64,'+response.assets[0].base64})
      else
        defectdetail.rectifyImages.push({id:this.state.defect.defectImages.length+1,
          name:imageType+'-'+response.assets[0].fileName?.substring(25)  ,caption:imageType+(this.state.defect.defectImages.length+1),
          type:'Rectify', file:'data:'+response.assets[0].type+';base64,'+response.assets[0].base64})


      this.setState({defect:defectdetail});
    });
  }
  async onShowCamera(imageType:string)
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
          let defectdetail = this.state.defect;

          if(imageType==='Defect')
            defectdetail.defectImages.push({id:this.state.defect.defectImages.length+1,
              name:imageType+'-'+response.assets[0].fileName?.substring(25)  ,caption:imageType+(this.state.defect.defectImages.length+1),
              type:'Defect', file:'data:'+response.assets[0].type+';base64,'+response.assets[0].base64})
          else
            defectdetail.rectifyImages.push({id:this.state.defect.defectImages.length+1,
              name:imageType+'-'+response.assets[0].fileName?.substring(25)  ,caption:imageType+(this.state.defect.defectImages.length+1),
              type:'Rectify', file:'data:'+response.assets[0].type+';base64,'+response.assets[0].base64})

          this.setState({defect:defectdetail});

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
  
  onRenderImageListItem(option:string, imageItem:ListRenderItemInfo<IImages>,status:boolean)
  {
      return <Card>
              <CardItem bordered>
                <Body>
                <Image source={{uri: imageItem.item.file}} style={{alignSelf:'center', height: 120, width: 200}} />
                </Body>
              </CardItem>
              <CardItem footer bordered style={{marginTop:-12}}>
                <Left>
                  <Button success transparent small onPress={()=>this.onViewImage(imageItem.item.caption, imageItem.item.file)}>
                      <Text>View</Text>
                  </Button>
                </Left>
                {!status &&  <Right>
                  <Button danger transparent small onPress={()=>this.onRemoveImage(option,imageItem.item.id)}>
                      <Text>Remove</Text>
                  </Button>
                </Right>
}
              </CardItem>
            </Card>
  }
  onViewImage(caption:string, image:string)
  {
    this.props.navigation.navigate('ImageViewer',{caption:caption,image:image})
  }
  onRemoveImage(option:string,imageId:number)
  {
    let defectdetail = this.state.defect;
    let imagelist:IImages[]=[];
    if(option==='Defect')
    {
      defectdetail.defectImages.forEach((item:IImages)=>
      {
        if(item.id!==imageId)
          imagelist.push(item);
        else
          showSuccessToast('Image removed');
      })
      defectdetail.defectImages = imagelist; 
    }
    else if(option==='Rectify')
    {
      defectdetail.rectifyImages.forEach((item:IImages)=>
      {
        if(item.id!==imageId)
          imagelist.push(item);
        else
          showSuccessToast('Image removed');
      })
      defectdetail.rectifyImages = imagelist;
    }
    this.setState({defect:defectdetail});

  }
  onEditImage (option:string,imageString:string){

  }

  onUpdateDefect(option:string)
  {
    let defect = this.state.defect;

    if (option==='Approve-ByPass' || option ==='Save')
    {
      if(defect.defect.id===0)
      {
          showErrorToast('Please select a defect to continue')
          return false;
      }
      if(defect.location.id===0)
      {
        showErrorToast('Please select a location to continue')
          return false;
      }
      if(defect.trade.id===0)
      {
        showErrorToast('Please select a trade to continue')
          return false;
      }
      if(defect.subcontractor.id===0)
      {
        showErrorToast('Please select a subcontractor to continue')
          return false;
      }

      if (defect.status==='Pending' ||defect.status==='Approved') 
        defect.mobileStatus=2;
      
      if (option==='Approve-ByPass')
      {
        if (defect.status==='New') 
          defect.mobileStatus=0;

          defect.status='Approved'

      
      }
    }
    else
    {

      if(option==='Completed')
      {
        if(defect.complete===undefined)
        {
            showErrorToast('Please draw your signature')
            return;
        }
        
        if(defect.complete!==undefined && defect.complete.signature===undefined)
        {
            showErrorToast('Please draw your signature')
            return;
        }

        if(defect.complete!==undefined && defect.complete.signature!==undefined && defect.complete.signature.length <10)
        {
            showErrorToast('Please draw your signature')
            return;
        }
      }
      
      defect.mobileStatus=2;
      defect.status=option; 

    }

    
    updateDefects('UPDATE',defect,this.onSync);
    
  }
  onSync(canSync:boolean)
  {
    if(canSync)
      this.props.navigation.push('Sync',{module:'Defects'})
  }
  onSignatureDone (imageString:string) {
    if(imageString.length>10)
    {
      let defectDetail = this.state.defect;
      if(!defectDetail.complete)
        defectDetail.complete={by:this.state.user.userId ,date:moment(new Date()).format('DD/MM/YYYY'), remarks:'', signature:imageString}
      else 
      {
        defectDetail.complete.by =this.state.user.userId;
        defectDetail.complete.date=moment(new Date()).format('DD/MM/YYYY');
        defectDetail.complete.signature =imageString;

      }
      
      this.setState({defect:defectDetail})
    }
  }
  renderInformationCard()
  {
    let isReadOnly=true;
    let selectedLocation=0;

    if (this.state.user.groupId==='5' && (this.state.defect.status==='New' || this.state.defect.status==='Pending'))
      isReadOnly=false;

    
    return (
      <Card transparent style={{marginTop:-12}}>
      <CardItem header>
        <H3 style={styles.cardHeaderCaption}>Information</H3>
      </CardItem>
      {
        isReadOnly?
        <CardItem>
        <Grid style={{marginTop:-16}}>
          <Row style={{height:30 }}>
            <Col style={{ width: 120 }}><Text style={styles.cardFieldCaption}>Location:</Text></Col>
            <Col><Text>{this.state.defect.location.name}</Text></Col>
          </Row>
          <Row style={{height:30}}>
            <Col style={{ width: 120}}><Text style={styles.cardFieldCaption}>Defect:</Text></Col>
            <Col><Text>{this.state.defect.defect.name}</Text></Col>
          </Row>
          <Row style={{height:30}}>
            <Col style={{ width: 120 }}><Text style={styles.cardFieldCaption}>Trade:</Text></Col>
            <Col><Text>{this.state.defect.trade.name}</Text></Col>
          </Row>
          <Row style={{height:30}}>
            <Col style={{ width: 120}}><Text style={styles.cardFieldCaption}>Assign To:</Text></Col>
            <Col><Text>{this.state.defect.subcontractor.name}</Text></Col>
          </Row>
          </Grid>
      </CardItem>
        :
      <CardItem>
        <Grid style={{marginTop:-16}}>
          <Row style={{height:50 ,marginBottom:10}}>
            <Col style={{ width: 120,justifyContent:'center' }}><Text style={styles.cardFieldCaption}>Location:</Text></Col>
            <Col style={styles.cardControl}>

              <Picker
                selectedValue={this.state.defect.location.id}
                style={{height: 20}}
                
                onValueChange={(itemValue) =>
                  this.onInformationSelected('Location',itemValue)
                }>
                {
                  this.state.locationList.map((detail:INameId,index:number)=>
                    <Picker.Item label={detail.name} value={detail.id} key={index} />
                  )
                }
              </Picker>
 
            </Col>

          </Row>

          <Row style={{height:50 ,marginBottom:10}}>
            <Col style={{ width: 120,justifyContent:'center' }}><Text style={styles.cardFieldCaption}>Defect:</Text></Col>
            <Col style={styles.cardControl}>

              <Picker
                selectedValue={this.state.defect.defect.id}
                style={{height: 20}}
                onValueChange={(itemValue, itemIndex) =>
                  this.onInformationSelected('Defect',itemValue)
                }>
                {
                  this.state.defectList.map((detail:INameId,index:number)=>
                    <Picker.Item label={detail.name} value={detail.id} key={index} />
                  )
                }
              </Picker>

            </Col>
          </Row>

          <Row style={{height:50 ,marginBottom:10}}>
            <Col style={{ width: 120,justifyContent:'center' }}><Text style={styles.cardFieldCaption}>Trade:</Text></Col>
            <Col style={styles.cardControl}>

              <Picker
                selectedValue={this.state.defect.trade.id}
                style={{height: 20}}
                onValueChange={(itemValue, itemIndex) =>
                  this.onInformationSelected('Trade',itemValue)
                }>
                {
                  this.state.tradeList.map((detail:INameId,index:number)=>
                    <Picker.Item label={detail.name} value={detail.id} key={index} />
                  )
                }
              </Picker>

            </Col>
          </Row>

          <Row style={{height:50 ,marginBottom:10}}>
            <Col style={{ width: 120,justifyContent:'center' }}><Text style={styles.cardFieldCaption}>Assign To:</Text></Col>
            <Col style={styles.cardControl}>

              <Picker
                selectedValue={this.state.defect.subcontractor.id}
                style={{height: 20}}
                onValueChange={(itemValue) =>
                  this.onInformationSelected('Subcontractor',itemValue)
                }>
                {
                  this.state.subcontractorList.map((detail:INameId,index:number)=>
                    <Picker.Item label={detail.name} value={detail.id} key={index} />
                  )
                }
              </Picker>

            </Col>
          </Row>
          </Grid>
      </CardItem>
   
      }
    </Card>
    )
  }

  renderDefectCard()
  {
    let isReadOnly=true;
    let user = this.state.user;

    let defectRemarks=this.state.defect.defectRemarks;
    let redoRemarks=this.state.defect.reDo?.remarks;

    if (user.groupId==='5' && (this.state.defect.status==='New' || this.state.defect.status==='Pending'|| this.state.defect.status==='ReDo'))
      isReadOnly=false;
    return(
    
      <Card transparent style={{marginTop:-12}}>
      <CardItem header>
        <H3 style={styles.cardHeaderCaption}>Defect</H3>
      </CardItem>
      {
        isReadOnly &&
          <CardItem style={{marginTop:-10}}>
            <Grid>
              <Row style={{height:30 }}><Text style={styles.cardFieldCaption}>Remarks:</Text></Row>
              <Row style={{marginBottom:4 }}><Text>{defectRemarks}</Text></Row>
              {this.state.defect.defectImages.length>0 && <Row style={{height:30 }}><Text style={styles.cardFieldCaption}>Images</Text></Row>}
              {this.state.defect.defectImages.length>0 && 
                <Row style={{marginBottom:4 }}>
                  <FlatList horizontal
                    data={this.state.defect.defectImages}
                    renderItem={(e)=>this.onRenderImageListItem('Defect',e,isReadOnly)}
                    keyExtractor={(item: IImages, index: number) => item.id.toString()}
                  />
                </Row>}
            </Grid>
          </CardItem>
      }
      {
        !isReadOnly &&
          <CardItem style={{marginTop:-10}}>
            <Grid>
              <Row style={{height:30 }}><Text style={styles.cardFieldCaption}>Remarks:</Text></Row>
              <Row style={{marginBottom:4 }}><Textarea rowSpan={3}  bordered placeholder="enter remarks if any" value={defectRemarks}
                style={{marginTop:4,flex:1}} onChangeText={(e)=>this.onRemarkChange('Defect',e)}/>
              </Row>
              <Row style={{height:48 }}>
                <Col style={{justifyContent:'center'}} ><Text style={[styles.cardFieldCaption,{marginVertical:10}]}>Add Images:</Text></Col>
                <Col style={{justifyContent:'center'}}><Button bordered small onPress={()=>this.onShowGallery('Defect')}><Text> Gallery</Text></Button></Col>
                <Col style={{justifyContent:'center'}}><Button bordered small onPress={()=>this.onShowCamera('Defect')}><Text> Photo</Text></Button></Col>
              </Row>
              {this.state.defect.defectImages.length>0 && 
                <Row style={{marginBottom:4 }}>
                  <FlatList horizontal
                    data={this.state.defect.defectImages}
                    renderItem={(e)=>this.onRenderImageListItem('Defect',e,isReadOnly)}
                    keyExtractor={(item: IImages, index: number) => item.id.toString()}
                  />
                </Row>}
              <Row style={{height:48 }}>
                <Col style={{width:30, justifyContent:'center',alignItems:'flex-end'}}><Switch value={this.state.byPass} onValueChange={()=>this.setState({byPass:!this.state.byPass})}/></Col>
                <Col style={{justifyContent:'center'}}><Button transparent small onPress={()=>this.setState({byPass:!this.state.byPass})}><Text> Bypass Approve</Text></Button></Col>
                 <Col style={{justifyContent:'center'}}><Button rounded success small style={{flex:1}} onPress={()=>this.onUpdateDefect('Save')} disabled={this.state.byPass}>
                  <Text >{this.state.defect.status==='New'?'Create':'Update'}</Text></Button>
                </Col>
                
              </Row>
            </Grid>
          </CardItem>
      }
      </Card>
    )
  }

  renderRedoDoneCard()
  {
    let displayStatus=0;
    let user = this.state.user;
    let reDoDoneRemarks=this.state.defect.reDoDone?.remarks;

    if (reDoDoneRemarks!==undefined)
      displayStatus=1

    if(user.groupId==='5' && this.state.defect.status==='ReDo')
      displayStatus=2;

    if (displayStatus===0)
      return (<Fragment></Fragment>)
    else
    return(
    
      <Card transparent style={{marginTop:-12}}>
      <CardItem header>
        <H3 style={styles.cardHeaderCaption}>Redo Done</H3>
      </CardItem>
      {
        displayStatus===1 &&
          <CardItem style={{marginTop:-10}}>
            <Grid>
              <Row style={{height:30 }}><Text style={styles.cardFieldCaption}>Remarks:</Text></Row>
              <Row style={{marginBottom:4 }}><Text>{reDoDoneRemarks}</Text></Row>
            </Grid>
          </CardItem>
      }
      {
        displayStatus===2 &&
          <CardItem style={{marginTop:-10}}>
            <Grid>
              <Row style={{height:30 }}><Text style={styles.cardFieldCaption}>Remarks:</Text></Row>
              <Row style={{marginBottom:4 }}><Textarea rowSpan={3}  bordered placeholder="enter remarks if any" value={reDoDoneRemarks}
                style={{marginTop:4,flex:1}} onChangeText={(e)=>this.onRemarkChange('ReDoDone',e)}/>
              </Row>
              <Row>
                <Col><Button rounded warning small style={{flex:1,marginRight:10}} onPress={()=>this.onUpdateDefect('Pending')}>
                  <Text >Redo Done</Text></Button>
                </Col>
              </Row>
            </Grid>
          </CardItem>
      }

      </Card>
    )
  }

  renderApprovalCard()
  {
    let displayStatus=0;
    let user = this.state.user;

    let aprovedRemarks=this.state.defect.approved?.remarks;

    if (aprovedRemarks!==undefined)
      displayStatus=1
    
    if( this.state.byPass || (user.groupId==='4' && (this.state.defect.status==='Pending'))  )
      displayStatus=2;

    if (displayStatus===0)
      return (<Fragment></Fragment>)
    else
    return(
      
      <Card transparent style={{marginTop:-12}}>
      <CardItem header>
        <H3 style={styles.cardHeaderCaption}>Approval</H3>
      </CardItem>
      {
        displayStatus===1 &&
          <CardItem style={{marginTop:-10}}>
            <Grid>
              <Row style={{height:30 }}><Text style={styles.cardFieldCaption}>Remarks:</Text></Row>
              <Row style={{marginBottom:4 }}><Text>{aprovedRemarks}</Text></Row>
            </Grid>
          </CardItem>
      } 
      
      {
        displayStatus===2 &&
          <CardItem style={{marginTop:-10}}>
            <Grid>
              <Row style={{height:30 }}><Text style={styles.cardFieldCaption}>Remarks:</Text></Row>
              <Row style={{marginBottom:8 }}><Textarea rowSpan={3}  bordered placeholder="enter remarks if any"  value={aprovedRemarks}
                style={{marginTop:4,flex:1}} onChangeText={(e)=>this.onRemarkChange('Approve',e)}/>
              </Row>
              <Row>
                <Col><Button rounded success small style={{flex:1,marginRight:10}} onPress={()=>this.onUpdateDefect(this.state.byPass?'Approve-ByPass':'Approved')}>
                  <Text >Approve</Text></Button>
                </Col>
              </Row>
            </Grid>
          </CardItem>
      }
      
      </Card>
    )
  }

  renderRedoCard()
  {
    let displayStatus=0;
    let user = this.state.user;

    let reDoRemarks=this.state.defect.reDo?.remarks;

    if (reDoRemarks!==undefined)
      displayStatus=1
    
    if(user.groupId==='4' && (this.state.defect.status==='Pending') )
      displayStatus=2;

    if (displayStatus===0)
      return (<Fragment></Fragment>)
    else
    return(
      
      <Card transparent style={{marginTop:-12}}>
      <CardItem header>
        <H3 style={styles.cardHeaderCaption}>Redo</H3>
      </CardItem>
      {
        displayStatus===1 &&
          <CardItem style={{marginTop:-10}}>
            <Grid>
              <Row style={{height:30 }}><Text style={styles.cardFieldCaption}>Remarks:</Text></Row>
              <Row style={{marginBottom:6 }}><Text>{reDoRemarks}</Text></Row>
              
            </Grid>
          </CardItem>
      }
      {
        displayStatus===2 &&
          <CardItem style={{marginTop:-10}}>
            <Grid>
              <Row style={{height:30 }}><Text style={styles.cardFieldCaption}>Remarks:</Text></Row>
              <Row style={{marginBottom:4 }}><Textarea rowSpan={3}  bordered placeholder="enter remarks if any" value={reDoRemarks}
                style={{marginTop:4,flex:1}} onChangeText={(e)=>this.onRemarkChange('ReDo',e)}/>
              </Row>
              <Row>
                <Col><Button rounded danger small style={{flex:1,marginRight:10}} onPress={()=>this.onUpdateDefect('ReDo')}>
                  <Text >Redo</Text></Button>
                </Col>
              </Row>
              
            </Grid>
          </CardItem>
      }
      
      </Card>
    )
  }

  renderRectificationCard()
  {
    let displayStatus=0;
    let user = this.state.user;

    if (this.state.defect.status==='Rectified' || this.state.defect.status==='Rework' || this.state.defect.status==='Completed')
      displayStatus=1

    if(user.groupId==='6' && (this.state.defect.status==='Approved' || this.state.defect.status==='Rework') )
      displayStatus=2;

    if (displayStatus===0)
      return (<Fragment></Fragment>)
    else
    return(
    
      <Card transparent style={{marginTop:-12}}>
      <CardItem header>
        <H3 style={styles.cardHeaderCaption}>Rectification</H3>
      </CardItem>
      {
        displayStatus===1 &&
          <CardItem style={{marginTop:-10}}>
            <Grid>
              <Row style={{height:30 }}><Text style={styles.cardFieldCaption}>Remarks:</Text></Row>
              <Row style={{marginBottom:4 }}><Text>{this.state.defect.rectify?.remarks}</Text></Row>
              {this.state.defect.rectifyImages.length>0 && <Row style={{height:30 }}><Text style={styles.cardFieldCaption}>Images</Text></Row>}
              {this.state.defect.rectifyImages.length>0 && 
                <Row style={{marginBottom:4 }}>
                  <FlatList horizontal
                    data={this.state.defect.rectifyImages}
                    renderItem={(e)=>this.onRenderImageListItem('Rectify',e,true)}
                    keyExtractor={(item: IImages, index: number) => item.id.toString()}
                  />
                </Row>}
            </Grid>
          </CardItem>
      }
      {
        displayStatus===2 &&
          <CardItem style={{marginTop:-10}}>
            <Grid>
              <Row style={{height:30 }}><Text style={styles.cardFieldCaption}>Remarks:</Text></Row>
              <Row style={{marginBottom:4 }}><Textarea rowSpan={3}  bordered placeholder="enter remarks if any" 
                value={this.state.defect.rectify?.remarks}
                style={{marginTop:4,flex:1}} onChangeText={(e)=>this.onRemarkChange('Rectify',e)}/>
              </Row>
              <Row style={{height:48 }}>
                <Col style={{justifyContent:'center'}}><Text style={[styles.cardFieldCaption,{marginVertical:10}]}>Add Images:</Text></Col>
                <Col style={{justifyContent:'center'}}><Button bordered small onPress={()=>this.onShowGallery('Rectify')}><Text>Gallery</Text></Button></Col>
                <Col style={{justifyContent:'center'}}><Button bordered small onPress={()=>this.onShowCamera('Rectify')}><Text>Photo</Text></Button></Col>
              </Row>
              {this.state.defect.rectifyImages.length>0 && 
                <Row style={{marginBottom:4 }}>
                  <FlatList horizontal
                    data={this.state.defect.rectifyImages}
                    renderItem={(e)=>this.onRenderImageListItem('Rectify',e,false)}
                    keyExtractor={(item: IImages, index: number) => item.id.toString()}
                  />
                </Row>}
              <Row>
                <Col><Button rounded success small style={{flex:1,marginRight:10}} onPress={()=>this.onUpdateDefect('Rectified')}>
                  <Text >Rectification Done</Text></Button>
                </Col>
              </Row>
            </Grid>
          </CardItem>
      }

      </Card>
    )
  }

  renderReworkCard()
  {
    let displayStatus=0;
    let user = this.state.user;
    let reworkRemarks=this.state.defect.rework?.remarks;

    if (reworkRemarks!==undefined && (this.state.defect.status==='Rework' || this.state.defect.status==='Completed'))
      displayStatus=1

    if(user.groupId==='5' && this.state.defect.status==='Rectified')
      displayStatus=2;

    if (displayStatus===0)
      return (<Fragment></Fragment>)
    else
    return(
    
      <Card transparent style={{marginTop:-12}}>
      <CardItem header>
        <H3 style={styles.cardHeaderCaption}>Rework</H3>
      </CardItem>
      {
        displayStatus===1 &&
          <CardItem style={{marginTop:-10}}>
            <Grid>
              <Row style={{height:30 }}><Text style={styles.cardFieldCaption}>Remarks:</Text></Row>
              <Row style={{marginBottom:4 }}><Text>{this.state.defect.rework?.remarks}</Text></Row>
            </Grid>
          </CardItem>
      }
      {
        displayStatus===2 &&
          <CardItem style={{marginTop:-10}}>
            <Grid>
              <Row style={{height:30 }}><Text style={styles.cardFieldCaption}>Remarks:</Text></Row>
              <Row style={{marginBottom:4 }}><Textarea rowSpan={3}  bordered placeholder="enter remarks if any" value={reworkRemarks}
                style={{marginTop:4,flex:1}} onChangeText={(e)=>this.onRemarkChange('Rework',e)}/>
              </Row>
              <Row>
                <Col><Button rounded warning small style={{flex:1,marginRight:10}} onPress={()=>this.onUpdateDefect('Rework')}>
                  <Text >Rework</Text></Button>
                </Col>
              </Row>
            </Grid>
          </CardItem>
      }

      </Card>
    )
  }

  renderCompleteCard()
  {
    let displayStatus=0;
    let user = this.state.user;
    let signature='';

    if (this.state.defect.complete?.signature)
      signature = this.state.defect.complete?.signature as string;

    if (this.state.defect.status==='Completed')
      displayStatus=1

    if(user.groupId==='5' && this.state.defect.status==='Rectified')
      displayStatus=2;

    if (displayStatus===0)
      return (<Fragment></Fragment>)
    else
    return(
    
      <Card transparent style={{marginTop:-12}}>
      <CardItem header>
        <H3 style={styles.cardHeaderCaption}>Completed</H3>
      </CardItem>
      {
        displayStatus===1 &&
          <CardItem style={{marginTop:-10}}>
          <Grid>
          <Row style={{height:30 }}><Text style={styles.cardFieldCaption}>Remarks:</Text></Row>
          <Row style={{marginBottom:4 }}><Text>{this.state.defect.complete?.remarks}</Text></Row>
          <Row style={{height:30 }}><Text style={styles.cardFieldCaption}>Signature:</Text></Row>
          {signature.length>10 &&<Row><Image source={{uri: signature}} resizeMode="contain" style={{alignSelf:'center', height: 60, width: Dimensions.get('window').width*0.75}} /></Row>}
          <Row style={{height:30 }}><Text style={styles.cardFieldCaption}>Date: {this.state.defect.complete?.date}</Text></Row>
          
        </Grid>
      </CardItem>
      }
      {
        displayStatus===2 &&
          <CardItem style={{marginTop:-10}}>
            <Grid>
              <Row style={{height:30 }}><Text style={styles.cardFieldCaption}>Remarks:</Text></Row>
              <Row style={{marginBottom:4 }}><Textarea rowSpan={3}  bordered placeholder="enter remarks if any" 
                style={{marginTop:4,flex:1}} onChangeText={(e)=>this.onRemarkChange('Completed',e)}/>
              </Row>
              {signature.length>10 &&<Row style={{height:30 }}><Text style={styles.cardFieldCaption}>Signature:</Text></Row>}
              {signature.length>10 &&<Row style={{height:80 }}><Image source={{uri: signature}} resizeMode="contain" style={{alignSelf:'center', height: 60, width: Dimensions.get('window').width*0.75}}  /></Row>}

              <Row>
                <Col><Button rounded  small style={{flex:1,marginRight:10}} onPress={()=>this.modelSignature.current?.onShowModal()}>
                  <Text >Signature</Text></Button>
                </Col>
                <Col><Button rounded success small style={{flex:1,marginRight:10}} onPress={()=>this.onUpdateDefect('Completed')}>
                  <Text >Completed</Text></Button>
                </Col>
              </Row>
            </Grid>
          </CardItem>
      }

      </Card>
    )
  }

  renderCompleteCard1()
  {
    let displayStatus=0;
    let signature='';

    if (this.state.defect.complete?.signature)
      signature = this.state.defect.complete?.signature as string;

    if (displayStatus===0)
      return (<Fragment></Fragment>)
    else
      return(
    
      <Card>
      <CardItem header>
        <H3 style={styles.cardHeaderCaption}>Completed</H3>
      </CardItem>
      {
        displayStatus===1 &&
          <CardItem style={{marginTop:-10}}>
          <Grid>
          <Row style={{height:30 }}><Text style={styles.cardHeaderCaption}>Remarks:</Text></Row>
          <Row style={{marginBottom:4 }}><Text>{this.state.defect.complete?.remarks}</Text></Row>
          <Row style={{height:30 }}><Text style={styles.cardHeaderCaption}>Signature:</Text></Row>
          {signature.length>10 &&<Row><Image source={{uri: signature}} resizeMode="cover" style={{alignSelf:'center', height: 150, width: Dimensions.get('window').width*0.75}} /></Row>}
          <Row style={{height:30 }}><Text style={styles.cardHeaderCaption}>Date: {this.state.defect.complete?.date}</Text></Row>
          
        </Grid>
      </CardItem>
      }
      {
        displayStatus===2 &&
        <CardItem style={{marginTop:-10}}>
            <Textarea rowSpan={5} bordered placeholder="remarks" style={{marginTop:4,flex:1}}/>
        </CardItem>
      }
      {
        displayStatus===2 &&
          <CardItem style={{marginTop:-10}}>
            <Left>
            <Button success full style={{flex:1}} >
                    <Text >Approve</Text>
                </Button>
              
                <Button full style={{ marginLeft:20,flex:1}}>
                    <Text>Redo</Text>
                </Button>
              </Left>
            
        </CardItem>
      }
      
      </Card>
    )
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
            <Subtitle> {this.state.defect.project.name} </Subtitle>
            <Title>{this.state.defect.no.length===0?'New':this.state.defect.no} </Title>
          </Body>

        </Header>
        <Content>

          <Card transparent>
            <CardItem header>
              <H3 style={styles.cardHeaderCaption}>Status</H3>
            </CardItem>
            <CardItem>
              <Grid style={{marginTop:-12}}>
                <Row style={{height:30 }}>
                  <Col style={{ width: 100 }}><Text style={styles.cardFieldCaption}>Current:</Text></Col>
                  <Col><Text>{this.state.defect.status}</Text></Col>
                </Row>
                <Row style={{height:30}}>
                  <Col style={{ width: 100}}><Text style={styles.cardFieldCaption}>Created on:</Text></Col>
                  <Col><Text>{this.state.defect.entryDate}</Text></Col>
                </Row>
                </Grid>
            </CardItem>
          </Card>

          {this.renderInformationCard()}
          {this.renderDefectCard()}
          {this.renderRedoCard()}
          {this.renderRedoDoneCard()}
          {this.renderApprovalCard()}  

          {this.renderRectificationCard()}
          {this.renderReworkCard()}
          {this.renderCompleteCard()}
          
        </Content>

        <ModelDrawing ref={this.modelDrawing} onEditImage={this.onEditImage} />
        <ModelLoader ref={this.modelLoader} /> 
        <ModelSignature ref={this.modelSignature} onSignatureDone={this.onSignatureDone} />
      </Container>
    );
  }
}


export default QCManage;
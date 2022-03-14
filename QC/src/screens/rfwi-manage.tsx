import React, { Component, Fragment } from "react";

import {
  Container,
  Content,
  Button,
  Text,
  Icon,
  Item,
  Input,
  Form,
  Body,
  Header,
  Title,
  Subtitle,
  Left,
  Right,
  ActionSheet,
  Card,
  CardItem,
  
  Thumbnail,
  Row,
  Col,
  Grid,
  H3,
  Picker,
  CheckBox,
  Switch,
  Textarea
} from "native-base";
import {styles} from "../theme/appStyle";


import { AuthStackParamList } from '../navigation/auth-stack-param-list';
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { Alert, Dimensions, FlatList, Image, ListRenderItemInfo } from "react-native";
import { getProjectMaster, IDefectDetail, IImages, IProject, IRFWIDetail, IRFWIDrawingReference, updateRFWI } from "../utilities/project-functions";
import moment from "moment";
import { getUserInfo, IAppUser } from "../utilities/user-functions";
import { getChecklistMaster, getInspectorMaster, getRFWITradeMaster, INameId, IRFWITrades, showErrorToast } from "../utilities/master-functions";
import ModelTimeSlot from "./modal-time-slot";

import DateTimePicker from '@react-native-community/datetimepicker';
import ModelLoader from "./modal-loader";
import ModelSignature from "./model-signature";

type ScreenRouteProp = RouteProp<AuthStackParamList, 'RFWIManage'>;

type ScreenNavigationProp = StackNavigationProp< AuthStackParamList,'RFWIManage'>;

type Props = {
  route: ScreenRouteProp;
  navigation: ScreenNavigationProp;
};

export interface ICheckList extends INameId {
    isChecked:boolean;
}
export interface IClearanceList extends ICheckList {
    isSigned:boolean;
}

interface IState {
    user:IAppUser;
    rfwi:IRFWIDetail;
    projectDetails?:IProject;
    tradeList:IRFWITrades[];
    itemList:INameId[];
    checkList:ICheckList[];
    clearance:IClearanceList[];
    inspectorList:INameId[];

    addLocation:boolean;
    selectedLocation:string;
    selectedDrawing:string;
    slot:string;
    showDate:boolean;

  }

  
class RFWIManage extends Component<Props,IState> {

  modelLoader = React.createRef<ModelLoader>();
  modelTimeSlot = React.createRef<ModelTimeSlot>();
  modelSignature = React.createRef<ModelSignature>();

  constructor(props:Props)
  {
    super(props)

    this.state ={
        user:getUserInfo(),
        
        rfwi:this.props.route.params.rfwi,
        projectDetails: this.props.route.params.project,
        tradeList:[],inspectorList:[],itemList:[],checkList:[],
        clearance:[{id: 0,name:'Structure',isChecked:false,isSigned:false},
                {id: 1,name:'M & E',isChecked:false,isSigned:false},{id: 2,name:'Others',isChecked:false,isSigned:false}],
        
        addLocation:false,
        selectedLocation:'0',
        selectedDrawing:'0',
        showDate:false,
        slot:'Book Slot'
      }
      this.OnShow = this.OnShow.bind(this)
      this.onPickerSelected = this.onPickerSelected.bind(this)
      this.onTradeMasterDownloaded = this.onTradeMasterDownloaded.bind(this)
      this.onInspectorMasterDownloaded = this.onInspectorMasterDownloaded.bind(this)
      this.onChecklistMasterDownloaded = this.onChecklistMasterDownloaded.bind(this)
      this.onSlotSelected = this.onSlotSelected.bind(this);
      this.onSlot = this.onSlot.bind(this);
      this.onSync = this.onSync.bind(this)
      this.onSignatureDone = this.onSignatureDone.bind(this);
      
  }
  
  componentDidMount()
  {
    let status =this.props.route.params.rfwi.status; 

    if (status==='New' || status==='Pending' || status==='Approved')
    {
        getRFWITradeMaster(this.onTradeMasterDownloaded);
    }
    else
      this.OnShow();
        
  }

  onTradeMasterDownloaded(moduls:IRFWITrades[]|string)
  {
      if(Array.isArray(moduls))
      {
          let list = moduls as IRFWITrades[];
          this.setState({tradeList:list})
          getInspectorMaster(this.onInspectorMasterDownloaded)
          
          if (list[0] && list[0].items.length>0)
            this.setState({itemList:list[0].items})
      }
      else
        showErrorToast(moduls as string)
  }
  onInspectorMasterDownloaded(moduls:INameId[]|string)
  {
      if(Array.isArray(moduls))
      {
          this.setState({inspectorList:moduls as INameId[]})
          getChecklistMaster(this.onChecklistMasterDownloaded);
      }
      else
        showErrorToast(moduls as string)
  }
  onChecklistMasterDownloaded(moduls:INameId[]|string)
  {
      if(Array.isArray(moduls))
      {
          let check:ICheckList[]=[];
          (moduls as INameId[]).forEach(e => {
              check.push({id:e.id,name:e.name,isChecked:false})
          });
          this.setState({checkList:check})
          
          this.OnShow();
        
      }
      else
        showErrorToast(moduls as string)

        

  }
  isSelected(id:number,list:INameId[])
  {
    let match=false;
    list.forEach(selected=>{
      if(selected.id === id)
      {
        match= true
      }
        
     })
     return match;
  }
  OnShow()
  {
    let rfwiDetail = this.state.rfwi;

    if(rfwiDetail.status==='Pending' || rfwiDetail.status==='Approved')
    {
      let check = this.state.checkList;
      let clearance = this.state.clearance;
      for (let i=0;i<check.length;i++)
      {
        check[i].isChecked = this.isSelected(check[i].id,rfwiDetail.generalChecklist) 
      }

      clearance[0].isChecked = rfwiDetail.clearanceStructure?.isSelected===true?true:false;
      clearance[1].isChecked = rfwiDetail.clearanceMandE?.isSelected===true?true:false;
      clearance[2].isChecked = rfwiDetail.clearanceOthers?.isSelected===true?true:false;
      
      this.setState({checkList:check,clearance:clearance})

    }

    if(rfwiDetail.status==='Approved')
    {
      rfwiDetail.proceedRequest=true;
      this.setState({rfwi:rfwiDetail})
    }
    
    if (rfwiDetail.startTime && rfwiDetail.startTime.length>=5)
    rfwiDetail.startTime = rfwiDetail.startTime.substring(0,5);
    if (rfwiDetail.endTime && rfwiDetail.endTime.length>=5)
    rfwiDetail.endTime = rfwiDetail.endTime.substring(0,5);
    if (rfwiDetail.startTime && rfwiDetail.endTime&& rfwiDetail.startTime.length>=5&& rfwiDetail.endTime.length>=5)
    {
        let slot=this.modelTimeSlot.current?.getSlotLabel(rfwiDetail.startTime,rfwiDetail.endTime);
        this.onSlotSelected(rfwiDetail.startTime,rfwiDetail.endTime, slot as string);
    }
    
    this.modelLoader.current?.onShowModal(false);
  }
  onPickerSelected(option:string, selected:number)
  {
    let detail = this.state.rfwi;
    if (option==='Trade')
    {
      let selectedItems = this.state.tradeList.filter((e:INameId)=>e.id===selected)
      if (selectedItems.length>0)
        detail.trade={id:selectedItems[0].id,name:selectedItems[0].name};
    }
    else if (option==='Items')
    {
        let selectedItems = this.state.itemList.filter((e:INameId)=>e.id===selected)
        if (selectedItems.length>0)
          detail.item={id:selectedItems[0].id,name:selectedItems[0].name};
    }
    else if(option==='Inspector')
    {
      let selectedItems = this.state.inspectorList.filter((e:INameId)=>e.id===selected)
        if (selectedItems.length>0)
          detail.inspector={id:selectedItems[0].id,name:selectedItems[0].name};
    }
    else if(option==='Location')
    {
      let locations = this.state.projectDetails?.locations;
      if(locations!==undefined)
      {
        let selectedItems = locations.filter((e:INameId)=>e.id===selected)
        if (selectedItems.length>0)
          this.setState({selectedLocation:selectedItems[0].id.toString()})
      }
    }
    else if(option==='Drawing')
    {

      let drawings = this.state.projectDetails?.rfwiDrawings;
      if(drawings!==undefined)
      {
        let selectedItems = drawings.filter((e:IImages)=>e.id===selected)
        if (selectedItems.length>0)
          this.setState({selectedDrawing:selectedItems[0].id.toString()})
      }
    }
    this.setState({rfwi:detail})
  }
  
  onCheckChange(control:string, index:number)
  {
      if(control==='General')
      {
          let check = this.state.checkList;
          check[index].isChecked = !check[index].isChecked;
          this.setState({checkList:check}) 
      }
      else if(control==='Clearance')
      {
          let clearance = this.state.clearance;
          let rfwi = this.state.rfwi;
          
          clearance[index].isChecked = !clearance[index].isChecked;
          if(clearance[index].isChecked===true)
          {
              if (index===0)
              {
                  rfwi.clearanceStructure = {isSelected:true}
              }
              else if (index===1)
              {
                  rfwi.clearanceMandE = {isSelected:true}
              }    
              else if (index===2)
              {
                  rfwi.clearanceOthers = {isSelected:true}
              }
          }
          else
          {
              if (index===0)
              {
                  rfwi.clearanceStructure = {isSelected:false}
              }
              else if (index===1)
              {
                  rfwi.clearanceMandE = {isSelected:false}
              }    
              else if (index===2)
              {
                  rfwi.clearanceOthers = {isSelected:false}
              }
          }

          let proceedRequest=true;
          clearance.forEach(e=>{
              if(e.isChecked===true)
                  proceedRequest=false;
          })
          rfwi.proceedRequest=proceedRequest;
          this.setState({clearance:clearance,rfwi:rfwi}) 
          
      }

  }
  onAddLocation()
  {
    let locations = this.state.projectDetails?.locations;
    let drawings = this.state.projectDetails?.rfwiDrawings;

    if(locations!==undefined && locations.length>0 &&  drawings!==undefined && drawings.length>0)
    {
      let location=locations[0]
      let drawing = drawings[0]
  
      let rfwi=this.state.rfwi;
      if(parseInt(this.state.selectedLocation)!==0)
      {
        let selectedItems = locations.filter((e:INameId)=>e.id===parseInt(this.state.selectedLocation))
        if (selectedItems.length>0)
          location = selectedItems[0];
      }

      if(parseInt(this.state.selectedDrawing)!==0)
      {
        let selectedItems = drawings.filter((e:IImages)=>e.id===parseInt(this.state.selectedDrawing))
        if (selectedItems.length>0)
          drawing = selectedItems[0];
      }
      
      rfwi.drawingReference.forEach(e=>{
        if(e.locations.id===location.id)
          location.id=-1
      })

      if (location.id>=0)
      {
        rfwi.drawingReference.push({locations:location,rfwiDrawings:drawing})
        this.setState({rfwi:rfwi})
  
      }
    }
    else
      showErrorToast('Location and Drawing both required to be selected. Please select.')
    
  }
  onDateChange (date:Date|undefined)
  {
    
    if(date!==undefined)
    {
      let rfwiDetail = this.state.rfwi;
      rfwiDetail.inspectionDate = moment(date).format('DD/MM/YYYY') ;
      this.setState({rfwi:rfwiDetail,showDate:false})
      this.onSlotSelected('','','Book Slot');

    }
    else
      this.setState({showDate:false})
  }
  onSlot()
  {
    let rfwi = this.state.rfwi;

    if (rfwi.inspector.id===0)
    {
        showErrorToast('Please select a Inspector to allot a time slot');
        return
    }
    
    this.modelTimeSlot.current?.onShowModal(rfwi.inspectionDate,rfwi.inspector.id, rfwi.startTime,rfwi.endTime)
  }
  
  onSlotSelected(start:string,end:string,slotSelected:string)
  {
    let rfwiDetail = this.state.rfwi;
    rfwiDetail.startTime=start;
    rfwiDetail.endTime=end;
    
    this.setState({rfwi:rfwiDetail, slot:slotSelected})
/*
    if(this.state.editStatus>1 && this.state.editStatus!==4 && slotSelected==='Book slot' )
        slotSelected='No slot selected';

    this.setState({rfwi:rfwi,slot:slotSelected})
*/
  }

  onSignatureDone (imageString:string,signatureType?:string) {

    let signatureFor =signatureType!==undefined?signatureType:'';

    if (signatureFor.length>0 && imageString.length>10)
    {
      let rfwiDetail = this.state.rfwi;
      
      if (signatureFor==='Request')
      {
        if(!rfwiDetail.request)
          rfwiDetail.request={by:this.state.user.userId ,date:moment(new Date()).format('DD/MM/YYYY'), signature:imageString}
        else 
        {
          rfwiDetail.request.by =this.state.user.userId;
          rfwiDetail.request.date=moment(new Date()).format('DD/MM/YYYY');
          rfwiDetail.request.signature =imageString;
        }

      }
      else if (signatureFor==='Structure' && rfwiDetail.clearanceStructure)
      {
        
          rfwiDetail.clearanceStructure.signature =imageString;
      }
      else if (signatureFor==='MandE' && rfwiDetail.clearanceMandE)
      {
        
          rfwiDetail.clearanceMandE.signature =imageString;
      }
      else if (signatureFor==='Others' && rfwiDetail.clearanceOthers)
      {
        
          rfwiDetail.clearanceOthers.signature =imageString;
      }
      else if (signatureFor==='Completed' && rfwiDetail.completed)
      {
        
          rfwiDetail.completed.signature =imageString;
      }    
      this.setState({rfwi:rfwiDetail})
    }
  }
  onRemarkChange(option:string,value:string)
  {
      let rfwiDetail = this.state.rfwi;
      
      if(option==='Completed')
      {
        if(rfwiDetail.completed)
          rfwiDetail.completed.remarks =value;
      }
      this.setState({rfwi:rfwiDetail});
  }

  onUpdateRFWI(option:string)
  {
    let rfwiDetail=this.state.rfwi
    let user = this.state.user;
    let allOtherSigned=false;
    
    if(option==='Save')
    {
      
      let check = this.state.checkList;
      let generalCheck:INameId[]=[];
      check.forEach(e=>{
          if(e.isChecked===true)
              generalCheck.push(e)
      })
      
      if(generalCheck.length===0)
      {
        showErrorToast('Please choose General checklist...')
          return ;
      }
      rfwiDetail.generalChecklist = generalCheck;

      if (rfwiDetail.drawingReference.length===0)
      {
        showErrorToast('Please choose Location and Drawing...')
          return ;
      }
     

      if(this.state.tradeList.length>0)
      {
          let detailCheck = this.state.tradeList.filter(e=>e.id===rfwiDetail.trade.id)
          if(detailCheck.length>0)
          {
            rfwiDetail.detailChecklist = detailCheck[0].detailedChecklist;
          }
      }

      if( getUserInfo().groupId==='5' && rfwiDetail.proceedRequest===true)
      {

        if (rfwiDetail.startTime==='')
          {
              showErrorToast('Please select a Time slot to continue.')  
                  return false; 
          }

          if(rfwiDetail.request ===undefined)
          {
            showErrorToast('Please do signature to continue.')  
            return ; 
          }
          if(rfwiDetail.request !==undefined && rfwiDetail.request.signature===undefined)
          {
            showErrorToast('Please do signature to continue.')  
            return ; 
          }

          if(rfwiDetail.request !==undefined && rfwiDetail.request.signature!==undefined && rfwiDetail.request.signature.length<10)
          {
            showErrorToast('Please do signature to continue.')  
            return ; 
          }
      }

      if(rfwiDetail.status==='New' && rfwiDetail.proceedRequest!==true)
      {
        rfwiDetail.status='Pending'
        rfwiDetail.mobileStatus=-1;
      }
      else if(rfwiDetail.status==='New' && rfwiDetail.proceedRequest===true)
      {
        rfwiDetail.status='Requested'
        rfwiDetail.mobileStatus=-1;
      }
      else if((rfwiDetail.status==='Pending'||rfwiDetail.status==='Approved') && rfwiDetail.proceedRequest===true)
      {
        rfwiDetail.status='Requested'
        rfwiDetail.mobileStatus=2;
      }
      else
        rfwiDetail.mobileStatus=2;

    }
    else
    {
      if(option==='Completed' || option==='Rejected')
      {
        if(rfwiDetail.completed ===undefined)
          {
            showErrorToast('Please do signature to continue.')  
            return ; 
          }
          if(rfwiDetail.completed !==undefined && rfwiDetail.completed.signature===undefined)
          {
            showErrorToast('Please do signature to continue.')  
            return ; 
          }

          if(rfwiDetail.completed !==undefined && rfwiDetail.completed.signature!==undefined && rfwiDetail.completed.signature.length<10)
          {
            showErrorToast('Please do signature to continue.')  
            return ; 
          }
      }
      if(option==='Reinspection')
      {

        let no = rfwiDetail.mobileNo.split('-');
        if (no.length>3)
            no[3]=(parseInt(no[3])+1)+'';
        else
            no.push('1')

        
        rfwiDetail.no = no.join('-');
        rfwiDetail.mobileStatus = -1;
        rfwiDetail.inspectionNo=parseInt(no[3])+1
        
        let others=this.state.clearance;
        for(let checkCount=0;checkCount<others.length;checkCount++)
        {
            if(checkCount===0 && rfwiDetail.clearanceStructure?.isSelected)
            {
              rfwiDetail.clearanceStructure = {isSelected:true}
            }
            
            if(checkCount===1 && rfwiDetail.clearanceMandE?.isSelected)
            {
              rfwiDetail.clearanceMandE = {isSelected:true}
            }
            if(checkCount===2 && rfwiDetail.clearanceOthers?.isSelected)
            {
              rfwiDetail.clearanceOthers = {isSelected:true}
            }
        }

        rfwiDetail.request= undefined;
        rfwiDetail.completed = undefined;
        
      }
      if(option==='SignOff')
      {
        let others=this.state.clearance;
        

        if (rfwiDetail.clearanceMandE?.isSelected===true)
        {
          if (rfwiDetail.clearanceMandE.signature && rfwiDetail.clearanceMandE.signature.length>10)
          {
              others[1].isSigned=true;
          }
          else
          {
            if(user.groupId==='9')
            {
              showErrorToast('Please do signature to continue.')
              return ;
            }
              
          }

        }
        if (rfwiDetail.clearanceStructure?.isSelected===true)
        {
            if (rfwiDetail.clearanceStructure.signature && rfwiDetail.clearanceStructure.signature.length>10)
            {
                others[0].isSigned=true;
            }
            else
            {
              if(user.groupId==='10')
              {
                showErrorToast('Please do signature to continue.')
                return ;
              }
                
            }

        }
        if (rfwiDetail.clearanceOthers?.isSelected===true)
        {
          if (rfwiDetail.clearanceOthers.signature && rfwiDetail.clearanceOthers.signature.length>10)
          {
              others[2].isSigned=true;
          }
          else
          {
            if(user.groupId==='11')
            {
              showErrorToast('Please do signature to continue.')
              return ;
            }
              
          }

        }
        
        for(let checkCount=0;checkCount<others.length;checkCount++)
        {
            
            if(others[checkCount].isChecked)
            {
                if(others[checkCount].isSigned)
                    allOtherSigned=true;
                else
                {
                    allOtherSigned=false;
                    break;
                }
            } 
                
        }

        

      }
      if(option==='Reinspection')
      {
        rfwiDetail.mobileStatus=-1;
        option='Pending'
      }
      else if(option==='SignOff')
      {
        rfwiDetail.mobileStatus=2;
        if(allOtherSigned)
          option='Approved'
        else
          option='Pending'
      }
      else
        rfwiDetail.mobileStatus=2;

      rfwiDetail.status=option

      
    }
    

    updateRFWI('UPDATE',rfwiDetail,this.onSync);
    
  }
  onSync(canSync:boolean)
  {
    if(canSync)
      this.props.navigation.push('Sync',{module:'RFWI'})
  }

  onRenderLocation(locationItem:ListRenderItemInfo<IRFWIDrawingReference>,isReadOnly:boolean)
  {
    let id=this.state.rfwi.project.id;
    
      return <Card style={{marginTop:-16,width:250}} key={locationItem.index}>
              <CardItem bordered>
                <Grid >
                  <Row style={{marginTop:10,marginBottom:6}}>
                      <Col style={{width:35}}><Icon active name="location-outline" /></Col>
                      <Col><Text>{locationItem.item.locations.name}</Text></Col>
                  </Row>
                  <Row >
                      <Col style={{width:35}}><Icon active name="images-outline" /></Col>
                      <Col><Text>{locationItem.item.rfwiDrawings.caption}</Text></Col>
                  </Row>
                 </Grid>
              </CardItem>
              <CardItem footer bordered style={{marginTop:-12}}>
                <Left>
                  <Button success transparent small onPress={()=>this.props.navigation.push('DrawingViewer',{projectId:id,drawingId:locationItem.item.rfwiDrawings.id, caption:locationItem.item.rfwiDrawings.caption})}>
                      <Text>View</Text>
                  </Button>
                </Left>
                {
                  !isReadOnly &&                 
                  <Right>
                    <Button danger transparent small onPress={()=>this.onRemoveLocationAndDrawing(locationItem.item.locations.id)}>
                        <Text>Remove</Text>
                    </Button>
                  </Right>
                }
              </CardItem>
            </Card>
  }

  onRemoveLocationAndDrawing(locationId:number)
  {
    let rfwiDetail = this.state.rfwi;
    let drawings:IRFWIDrawingReference[]=[];
    rfwiDetail.drawingReference.forEach(e=>{
      if (e.locations.id!==locationId)
      drawings.push(e)
    })
    rfwiDetail.drawingReference = drawings;

    this.setState({rfwi:rfwiDetail})
  }
  

  renderInformationCard()
  {
    let isReadOnly=true;
    let rfwi = this.state.rfwi;

    if (this.state.user.groupId==='5' && (rfwi.status==='New' || 
      (rfwi.status==='Pending' && rfwi.proceedRequest!==true && rfwi.otherSigned!==true)))
      {
        isReadOnly=false;
      }
      
    
    return (
      <Card transparent style={{marginTop:-12}}>
      <CardItem header>
        <H3 style={styles.cardHeaderCaption}>Information</H3>
      </CardItem>
      {
        isReadOnly?
        <CardItem>
        <Grid style={{marginTop:-16}}>
          <Row style={{height:30}}>
            <Col style={{ width: 70,justifyContent:'center'  }}><Text style={styles.cardFieldCaption}>Trade:</Text></Col>
            <Col style={{justifyContent:'center' }}><Text>{rfwi.trade.name}</Text></Col>
          </Row>
          <Row style={{height:30}}>
            <Col style={{ width: 70,justifyContent:'center' }}><Text style={styles.cardFieldCaption}>Item:</Text></Col>
            <Col style={{justifyContent:'center' }}><Text>{rfwi.item.name}</Text></Col>
          </Row>
          </Grid>
      </CardItem>
        :
      <CardItem>
        <Grid style={{marginTop:-16}}>
            <Row style={{height:50}}>
            <Col style={{ width: 70,justifyContent:'center'  }}><Text style={styles.cardFieldCaption}>Trade:</Text></Col>
            <Col style={styles.cardControl}>
            <Picker
                selectedValue={rfwi.trade.id.toString()}
                
                onValueChange={(itemValue, itemIndex) =>
                  this.onPickerSelected('Trade',parseInt(itemValue) )
                }>
                {
                  this.state.tradeList.map((detail:INameId,index:number)=>
                    <Picker.Item label={detail.name} value={detail.id.toString()} key={index} />
                  )
                }
              </Picker>
            </Col>
          </Row>
          <Row style={{height:50}}>
            <Col style={{ width: 70,justifyContent:'center' }}><Text style={styles.cardFieldCaption}>Item:</Text></Col>
            <Col style={styles.cardControl}>
            <Picker
                selectedValue={rfwi.item.id.toString()}
                
                onValueChange={(itemValue, itemIndex) =>
                  this.onPickerSelected('Items',parseInt(itemValue))
                }>
                {
                  this.state.itemList.map((detail:INameId,index:number)=>
                    <Picker.Item label={detail.name} value={detail.id.toString()} key={index} />
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

  renderChecklistCard()
  {
    let isReadOnly=true;
    let rfwi = this.state.rfwi;

    if (this.state.user.groupId==='5' && (rfwi.status==='New' || 
      (rfwi.status==='Pending' && rfwi.proceedRequest!==true && rfwi.otherSigned!==true)))
      {
        isReadOnly=false;
      }
    
    return (
      <Card transparent style={{marginTop:-12}}>
      <CardItem header>
        <H3 style={styles.cardHeaderCaption}>General Checklist</H3>
      </CardItem>
      {
        isReadOnly?
        <CardItem>
        <Grid style={{marginTop:-16}}>
          {
              rfwi.generalChecklist.map((list:INameId,index:number)=>
                <Row key={index} style={{height:40}}><Text>{index+1}. {list.name}</Text>
                </Row>
              )
          }
          </Grid>
      </CardItem>
        :
      <CardItem>
        <Grid style={{marginTop:-16}}>
        {
              this.state.checkList.map((list:ICheckList,index:number)=>
                <Row key={index} style={{height:30}}> 
                    <Col style={{justifyContent:'center'}}><Text style={styles.cardFieldCaption}>{list.name}</Text></Col>
                    <Col style={{width:40, justifyContent:'center',alignItems:'flex-start'}}><Switch value={list.isChecked} onValueChange={()=>this.onCheckChange('General',index)}/></Col>
              </Row>
              )
          }
          </Grid>
      </CardItem>
   
      }
    </Card>
    )
  }

  renderClearanceRequiredCard()
  {
    let displayStatus=0;
    
    let rfwi = this.state.rfwi;
    
    
    if (rfwi.status==='Pending' && rfwi.proceedRequest!==true && rfwi.otherSigned===true)
      displayStatus=1;

    if (this.state.user.groupId==='5' && (rfwi.status==='New' || 
      (rfwi.status==='Pending' && rfwi.proceedRequest!==true && rfwi.otherSigned!==true)))
      {
        displayStatus=2;
      }
    
    if (displayStatus===0)
      return (<Fragment></Fragment>)
    else

    return (
      <Card transparent style={{marginTop:-12}}>
      <CardItem header>
        <H3 style={styles.cardHeaderCaption}>Other Trade Clearance (If any) By</H3>
      </CardItem>
      {
        displayStatus===1 ?
        <CardItem>
        <Grid style={{marginTop:-16}}>
          {
              this.state.clearance.filter(e=>e.isChecked).map((list:IClearanceList,index:number)=>
                <Row key={index} style={{height:40}}><Text>{index+1}. {list.name}</Text>
                </Row>
              )
          }
          </Grid>
      </CardItem>
        :
      <CardItem>
        <Grid style={{marginTop:-16}}>
        {
              this.state.clearance.map((list:IClearanceList,index:number)=>
                <Row key={index} style={{height:30}}> 
                    <Col style={{justifyContent:'center'}}><Text style={styles.cardFieldCaption}>{list.name}</Text></Col>
                    <Col style={{width:40, justifyContent:'center',alignItems:'flex-start'}}><Switch value={list.isChecked} onValueChange={()=>this.onCheckChange('Clearance',index)}/></Col>
              </Row>
              )
          }
          </Grid>
      </CardItem>
   
      }
    </Card>
    )
  }


  renderLocationCard()
  {
    let isReadOnly=true;
    
    let rfwi = this.state.rfwi;

    if (this.state.user.groupId==='5' && (rfwi.status==='New' || 
      (rfwi.status==='Pending' && rfwi.proceedRequest!==true && rfwi.otherSigned!==true)))
      {
        isReadOnly=false;
      }
    
    
    return (
      <Card transparent style={{marginTop:-12}}>
      <CardItem header>
        <Grid style={{marginTop:-6}}>
            <Row style={{height:30}}>
                
                <Col><H3 style={styles.cardHeaderCaption}>Location and Drawing</H3></Col>
                {!isReadOnly &&                 
                  <Col style={{width:55,justifyContent:'center'}}><Button transparent onPress={()=>this.setState({addLocation:true})} >
                    <Icon   name="add-circle-outline" /></Button>
                  </Col>
                }
            </Row>
            
          </Grid>
        
      </CardItem>
      {this.state.addLocation &&
        <CardItem style={{marginTop:-16}}>

          <Grid >
            <Row style={{height:50}}>
            <Col style={{ width: 90,justifyContent:'center'  }}><Text style={styles.cardFieldCaption}>Location:</Text></Col>
            <Col style={styles.cardControl}>
            <Picker
                selectedValue={this.state.selectedLocation}
                
                onValueChange={(itemValue, itemIndex) =>
                  this.onPickerSelected('Location',parseInt(itemValue))
                }>
                {
                  this.state.projectDetails?.locations.map((detail:INameId,index:number)=>
                    <Picker.Item label={detail.name} value={detail.id.toString()} key={index} />
                  )
                }
              </Picker>
            </Col>
          </Row>
          <Row style={{height:50}}>
            <Col style={{ width: 90,justifyContent:'center' }}><Text style={styles.cardFieldCaption}>Drawing:</Text></Col>
            <Col style={styles.cardControl}>
            <Picker
                selectedValue={this.state.selectedDrawing}
                style={{height: 20}}
                onValueChange={(itemValue, itemIndex) =>
                  this.onPickerSelected('Drawing',parseInt(itemValue))
                }>
                {
                  this.state.projectDetails?.rfwiDrawings.map((detail:IImages,index:number)=>
                    <Picker.Item label={detail.caption} value={detail.id.toString()} key={index} />
                  )
                }
              </Picker>
            </Col>
          </Row>
          <Row style={{marginTop:8}}>
            <Col><Button rounded danger small style={{flex:1,marginRight:10}} onPress={()=>this.setState({addLocation:false})}>
                  <Text >Close</Text></Button></Col>
            <Col><Button rounded success small style={{flex:1,marginLeft:10}} onPress={()=>this.onAddLocation()}>
                  <Text >Add</Text></Button></Col>
          </Row>
          </Grid>
        </CardItem>
      }
      <CardItem style={{marginTop:-10}}>
        <Grid>
        <Row>
          {this.state.rfwi.drawingReference.length>0 &&
            
              <FlatList horizontal
                data={this.state.rfwi.drawingReference}
                renderItem={(e)=>this.onRenderLocation(e,isReadOnly)}
                keyExtractor={(item: IRFWIDrawingReference, index: number) => item.locations.id.toString()}
              />
            }
            {this.state.rfwi.drawingReference.length===0 && !this.state.addLocation && <Text note>Please add location and drawing references</Text>
            }
            </Row>
            {(this.state.user.groupId==='5' && !this.state.rfwi.proceedRequest && rfwi.otherSigned!==true) && 
              <Row style={{marginTop:20}}>
                <Col><Button rounded success small style={{flex:1}} onPress={()=>this.onUpdateRFWI('Save')}>
                      <Text >{this.state.rfwi.status==='New'?'Create':'Update'}</Text></Button></Col>
              </Row>
            }

        </Grid>
      </CardItem>
    </Card>
    )
  }

  
  renderInspectionCard()
  {
    let displayStatus=0;

    if (this.state.rfwi.status==='Requested' || this.state.rfwi.status==='Approved' || this.state.rfwi.status==='Completed'  ) 
      displayStatus=1;

    if (this.state.user.groupId==='5' && (this.state.rfwi.status==='New' || this.state.rfwi.status==='Pending' || this.state.rfwi.status==='Approved'  ) 
        && this.state.rfwi.proceedRequest)
      displayStatus=2;
    if (displayStatus===0)
      return(<Fragment></Fragment>)
    else
    return (
      <Card transparent style={{marginTop:-12}}>
      <CardItem header>
        <H3 style={styles.cardHeaderCaption}>Inspection Details</H3>
      </CardItem>
      {
        displayStatus===1?
        <CardItem>
        <Grid style={{marginTop:-16}}>
          <Row style={{height:30}}>
            <Col style={{ width: 100,justifyContent:'center'  }}><Text style={styles.cardFieldCaption}>Inspector:</Text></Col>
            <Col style={{justifyContent:'center' }}><Text>{this.state.rfwi.inspector.name}</Text></Col>
          </Row>
          <Row style={{height:30}}>
            <Col style={{ width: 100,justifyContent:'center' }}><Text style={styles.cardFieldCaption}>Date:</Text></Col>
            <Col style={{justifyContent:'center' }}><Text>{this.state.rfwi.inspectionDate}</Text></Col>
          </Row>
          <Row style={{height:30}}>
            <Col style={{ width: 100,justifyContent:'center' }}><Text style={styles.cardFieldCaption}>Time:</Text></Col>
            <Col style={{justifyContent:'center' }}><Text>{this.state.slot}</Text></Col>
          </Row>
          </Grid>
      </CardItem>
        :
      <CardItem>
        <Grid style={{marginTop:-16}}>
        <Row style={{height:50}}>
            <Col style={{ width: 90,justifyContent:'center' }}><Text style={styles.cardFieldCaption}>Inspector:</Text></Col>
            <Col style={styles.cardControl}>
            <Picker
                selectedValue={this.state.rfwi.inspector.id.toString()}
                style={{height: 20}}
                onValueChange={(itemValue, itemIndex) =>
                  this.onPickerSelected('Inspector',parseInt(itemValue))
                }>
                {
                  this.state.inspectorList.map((detail:INameId,index:number)=>
                    <Picker.Item label={detail.name} value={detail.id.toString()} key={index} />
                  )
                }
              </Picker>
            </Col>
          </Row>
          <Row style={{height:30,marginBottom:6}}>
            <Col style={{ width: 100,justifyContent:'center' }}><Text style={styles.cardFieldCaption}>Date:</Text></Col>
            <Col style={{justifyContent:'center' }}>
              {
                this.state.showDate &&  
                 
                <DateTimePicker
                  testID="dateTimePicker"
                  value={moment(this.state.rfwi.inspectionDate, 'DD/MM/YYYY').toDate()}
                  mode={'date'}
                  is24Hour={true}
                  display="default"
                  onChange={(e: any,d: Date | undefined)=>this.onDateChange(d)}
                />          
          
              }
              
              <Button transparent  small style={{flex:1}} onPress={()=>this.setState({showDate:true})}><Text>{this.state.rfwi.inspectionDate}</Text></Button>
            
            </Col>
          </Row>
          <Row style={{height:30}}>
            <Col style={{ width: 100,justifyContent:'center' }}><Text style={styles.cardFieldCaption}>Time:</Text></Col>
            <Col style={{justifyContent:'center' }}><Button transparent  small style={{flex:1}} onPress={()=>this.onSlot()}><Text>{this.state.slot}</Text></Button></Col>
          </Row>          
          </Grid>
      </CardItem>
   
      }
    </Card>
    )
  }

  
  renderStructureClearanceCard()
  {
    let displayStatus=0;
    let user = this.state.user;
    let signature='';
    
    let rfwiDetail = this.state.rfwi; 

    if (rfwiDetail.clearanceStructure?.isSelected)
      signature = rfwiDetail.clearanceStructure?.signature as string;
    if (signature===null)
      signature=''

    if (signature!==undefined && signature.length>0)
      displayStatus=1

    if(user.groupId==='10' && rfwiDetail.status==='Pending')
    {
      displayStatus=2;
      if (rfwiDetail.clearanceStructure)
      {
        rfwiDetail.clearanceStructure.by=user.userId;
        rfwiDetail.clearanceStructure.name=user.userName;
        rfwiDetail.clearanceStructure.date=moment(new Date()).format('DD/MM/YYYY');
      }
      
    }
      

    if (displayStatus===0)
      return (<Fragment></Fragment>)
    else
    return(
    
      <Card transparent style={{marginTop:-12}}>
      <CardItem header>
        <H3 style={styles.cardHeaderCaption}>{this.state.clearance[0].name} Clearance</H3>
      </CardItem>
      {
        displayStatus===1 &&
          <CardItem style={{marginTop:-10}}>
          <Grid>
            <Row style={{height:30 }}>
              <Text style={styles.cardFieldCaption}>Name: {rfwiDetail.clearanceStructure?.name}</Text>
            </Row>
          {signature.length>10 &&<Row><Image source={{uri: signature}} resizeMode="contain" style={{alignSelf:'center', height: 60, width: Dimensions.get('window').width*0.75}} /></Row>}
          <Row style={{height:30 }}><Text style={styles.cardFieldCaption}>Date: {rfwiDetail.clearanceStructure?.date}</Text></Row>
          
        </Grid>
      </CardItem>
      }
      {
        displayStatus===2 &&
          <CardItem style={{marginTop:-10}}>
            <Grid>
            <Row style={{height:30 }}>
              <Text style={styles.cardFieldCaption}>Name: {rfwiDetail.clearanceStructure?.name}</Text>
            </Row>
            {signature.length>10 &&<Row><Image source={{uri: signature}} resizeMode="contain" style={{alignSelf:'center', height: 60, width: Dimensions.get('window').width*0.75}} /></Row>}
            {signature.length<10 &&<Row style={{height:30 }}><Text note>Please draw signature</Text></Row>}
            <Row style={{height:30 }}><Text style={styles.cardFieldCaption}>Date: {rfwiDetail.clearanceStructure?.date}</Text></Row>
            
              <Row style={{height:30 }}>

              <Col><Button rounded  small style={{flex:1,marginRight:10}} onPress={()=>this.modelSignature.current?.onShowModal('Structure')}>
                  <Text >Signature</Text></Button>
                </Col>
                <Col><Button rounded success small style={{flex:1,marginRight:10}} onPress={()=>this.onUpdateRFWI('SignOff')}>
                  <Text >Update</Text></Button>
                </Col>

              </Row>
            </Grid>
          </CardItem>
      }

      </Card>
    )
  }

  renderMandEClearanceCard()
  {
    let displayStatus=0;
    let user = this.state.user;
    let signature='';
    
    let rfwiDetail = this.state.rfwi; 

    if (rfwiDetail.clearanceMandE?.isSelected)
      signature = rfwiDetail.clearanceMandE?.signature as string;
    if (signature===null)
      signature=''

    if (signature!==undefined && signature.length>0)
      displayStatus=1

    if(user.groupId==='9' && rfwiDetail.status==='Pending')
    {
      displayStatus=2;
      if (rfwiDetail.clearanceMandE)
      {
        rfwiDetail.clearanceMandE.by=user.userId;
        rfwiDetail.clearanceMandE.name=user.userName;
        rfwiDetail.clearanceMandE.date=moment(new Date()).format('DD/MM/YYYY');
      }
      
    }
      

    if (displayStatus===0)
      return (<Fragment></Fragment>)
    else
    return(
    
      <Card transparent style={{marginTop:-12}}>
      <CardItem header>
        <H3 style={styles.cardHeaderCaption}>{this.state.clearance[1].name} Clearance</H3>
      </CardItem>
      {
        displayStatus===1 &&
          <CardItem style={{marginTop:-10}}>
          <Grid>
            <Row style={{height:30 }}>
              <Text style={styles.cardFieldCaption}>Name: {rfwiDetail.clearanceMandE?.name}</Text>
            </Row>
          {signature.length>10 &&<Row><Image source={{uri: signature}} resizeMode="contain" style={{alignSelf:'center', height: 60, width: Dimensions.get('window').width*0.75}} /></Row>}
          <Row style={{height:30 }}><Text style={styles.cardFieldCaption}>Date: {rfwiDetail.clearanceMandE?.date}</Text></Row>
          
        </Grid>
      </CardItem>
      }
      {
        displayStatus===2 &&
          <CardItem style={{marginTop:-10}}>
            <Grid>
            <Row style={{height:30 }}>
              <Text style={styles.cardFieldCaption}>Name: {rfwiDetail.clearanceMandE?.name}</Text>
            </Row>
            {signature.length>10 &&<Row><Image source={{uri: signature}} resizeMode="contain" style={{alignSelf:'center', height: 60, width: Dimensions.get('window').width*0.75}} /></Row>}
            {signature.length<10 &&<Row style={{height:30 }}><Text note>Please draw signature</Text></Row>}
            <Row style={{height:30 }}><Text style={styles.cardFieldCaption}>Date: {rfwiDetail.clearanceMandE?.date}</Text></Row>
            
              <Row style={{height:30 }}>

              <Col><Button rounded  small style={{flex:1,marginRight:10}} onPress={()=>this.modelSignature.current?.onShowModal('MandE')}>
                  <Text >Signature</Text></Button>
                </Col>
                <Col><Button rounded success small style={{flex:1,marginRight:10}} onPress={()=>this.onUpdateRFWI('SignOff')}>
                  <Text >Update</Text></Button>
                </Col>

              </Row>
            </Grid>
          </CardItem>
      }

      </Card>
    )
  }

  renderOthersClearanceCard()
  {
    let displayStatus=0;
    let user = this.state.user;
    let signature='';
    
    let rfwiDetail = this.state.rfwi; 

    if (rfwiDetail.clearanceOthers?.isSelected)
      signature = rfwiDetail.clearanceOthers?.signature as string;
    if (signature===null)
      signature=''

    if (signature!==undefined && signature.length>0)
      displayStatus=1

    if(user.groupId==='11' && rfwiDetail.status==='Pending')
    {
      displayStatus=2;
      if (rfwiDetail.clearanceOthers)
      {
        rfwiDetail.clearanceOthers.by=user.userId;
        rfwiDetail.clearanceOthers.name=user.userName;
        rfwiDetail.clearanceOthers.date=moment(new Date()).format('DD/MM/YYYY');
      }
      
    }
      

    if (displayStatus===0)
      return (<Fragment></Fragment>)
    else
    return(
    
      <Card transparent style={{marginTop:-12}}>
      <CardItem header>
        <H3 style={styles.cardHeaderCaption}>{this.state.clearance[2].name} Clearance</H3>
      </CardItem>
      {
        displayStatus===1 &&
          <CardItem style={{marginTop:-10}}>
          <Grid>
            <Row style={{height:30 }}>
              <Text style={styles.cardFieldCaption}>Name: {rfwiDetail.clearanceOthers?.name}</Text>
            </Row>
          {signature.length>10 &&<Row><Image source={{uri: signature}} resizeMode="contain" style={{alignSelf:'center', height: 60, width: Dimensions.get('window').width*0.75}} /></Row>}
          <Row style={{height:30 }}><Text style={styles.cardFieldCaption}>Date: {rfwiDetail.clearanceOthers?.date}</Text></Row>
          
        </Grid>
      </CardItem>
      }
      {
        displayStatus===2 &&
          <CardItem style={{marginTop:-10}}>
            <Grid>
            <Row style={{height:30 }}>
              <Text style={styles.cardFieldCaption}>Name: {rfwiDetail.clearanceOthers?.name}</Text>
            </Row>
            {signature.length>10 &&<Row><Image source={{uri: signature}} resizeMode="contain" style={{alignSelf:'center', height: 60, width: Dimensions.get('window').width*0.75}} /></Row>}
            {signature.length<10 &&<Row style={{height:30 }}><Text note>Please draw signature</Text></Row>}
            <Row style={{height:30 }}><Text style={styles.cardFieldCaption}>Date: {rfwiDetail.clearanceOthers?.date}</Text></Row>
            
              <Row style={{height:30 }}>

              <Col><Button rounded  small style={{flex:1,marginRight:10}} onPress={()=>this.modelSignature.current?.onShowModal('Others')}>
                  <Text >Signature</Text></Button>
                </Col>
                <Col><Button rounded success small style={{flex:1,marginRight:10}} onPress={()=>this.onUpdateRFWI('SignOff')}>
                  <Text >Update</Text></Button>
                </Col>

              </Row>
            </Grid>
          </CardItem>
      }

      </Card>
    )
  }

  renderRequestCard()
  {
    let displayStatus=0;
    let user = this.state.user;
    let rfwiDetail = this.state.rfwi; 
    let signature='';

    if (rfwiDetail.request!==undefined)
      signature = rfwiDetail.request?.signature!==undefined?rfwiDetail.request?.signature:'';

    if (signature===null)
      signature=''

    if (signature.length>0)
      displayStatus=1

    if(user.groupId==='5' && (rfwiDetail.status==='New' || rfwiDetail.status==='Pending' || rfwiDetail.status==='Approved') && rfwiDetail.proceedRequest)
    {
      displayStatus=2;
      if (rfwiDetail.request)
      {
        rfwiDetail.request.by=user.userId;
        rfwiDetail.request.name=user.userName;
        rfwiDetail.request.date=moment(new Date()).format('DD/MM/YYYY');
      }
      else
      {
        rfwiDetail.request = {by:user.userId,name:user.userName,date:moment(new Date()).format('DD/MM/YYYY'),signature:''}
      }
    }
      

    if (displayStatus===0)
      return (<Fragment></Fragment>)
    else
    return(
    
      <Card transparent style={{marginTop:-12}}>
      <CardItem header>
        <H3 style={styles.cardHeaderCaption}>Request Detail</H3>
      </CardItem>
      {
        displayStatus===1 &&
          <CardItem style={{marginTop:-10}}>
          <Grid>
          <Row style={{height:30 }}>
              <Text style={styles.cardFieldCaption}>Name: {rfwiDetail.request?.name}</Text>
            </Row>
          {signature.length>10 &&<Row><Image source={{uri: signature}} resizeMode="contain" style={{alignSelf:'center', height: 60, width: Dimensions.get('window').width*0.75}} /></Row>}
          <Row style={{height:30 }}><Text style={styles.cardFieldCaption}>Date: {this.state.rfwi.request?.date}</Text></Row>
          
        </Grid>
      </CardItem>
      }
      {
        displayStatus===2 &&
          <CardItem style={{marginTop:-10}}>
            <Grid>
            <Row style={{height:30 }}>
              <Text style={styles.cardFieldCaption}>Name: {rfwiDetail.request?.name}</Text>
            </Row>
              <Row style={{height:30 }}>{signature.length>10 ? 
                <Text style={styles.cardFieldCaption}>Signature:</Text>
                :<Text note>draw signature</Text>}
              </Row>
              
              {signature.length>10 &&<Row style={{height:80 }}><Image source={{uri: signature}} resizeMode="contain" style={{alignSelf:'center', height: 60, width: Dimensions.get('window').width*0.75}}  /></Row>}
              {signature.length>10 &&<Row style={{height:30 }}><Text style={styles.cardFieldCaption}>Date: {this.state.rfwi.request?.date}</Text></Row>}

              <Row style={{height:30 }}>

              <Col><Button rounded  small style={{flex:1,marginRight:10}} onPress={()=>this.modelSignature.current?.onShowModal('Request')}>
                  <Text >Signature</Text></Button>
                </Col>
                <Col><Button rounded success small style={{flex:1,marginRight:10}} onPress={()=>this.onUpdateRFWI('Save')}>
                  <Text >{this.state.rfwi.status==='New'?'Create':this.state.rfwi.status==='Pending'?'Update':'Request'}</Text></Button>
                </Col>

              </Row>
            </Grid>
          </CardItem>
      }

      </Card>
    )
  }

  renderReInspectionCard()
  {
    let displayStatus=0;
    let signature='';
    let user = this.state.user;
    let rfwiDetail = this.state.rfwi;

    if(user.groupId==='8' && rfwiDetail.status==='Requested')
      displayStatus=0
    else if (rfwiDetail.status!=='Completed' )
    {
      
    
      if (rfwiDetail.completed)
        signature = rfwiDetail.completed?.signature as string;
  
      if (signature===null)
        signature=''
  
      if (signature!==undefined && signature.length>0)
        displayStatus=1
  
      if(user.groupId==='5' && rfwiDetail.status==='Rejected')
      {
        displayStatus=2;
       
      }
        
        
    }


    if (displayStatus===0)
      return (<Fragment></Fragment>)
    else
    return(
    
      <Card transparent style={{marginTop:-12}}>
      <CardItem header>
        <H3 style={styles.cardHeaderCaption}>Rejection Detail</H3>
      </CardItem>
      
          <CardItem style={{marginTop:-10}}>
          <Grid>
            <Row style={{height:30 }}>
              <Text style={styles.cardFieldCaption}>Name: {rfwiDetail.completed?.name}</Text>
            </Row>
            <Row style={{height:30 }}><Text style={styles.cardFieldCaption}>Remarks:</Text></Row>
          <Row style={{marginBottom:4 }}><Text>{rfwiDetail.completed?.remarks}</Text></Row>
          {signature.length>10 &&<Row><Image source={{uri: signature}} resizeMode="contain" style={{alignSelf:'center', height: 60, width: Dimensions.get('window').width*0.75}} /></Row>}
          <Row style={{height:30 }}><Text style={styles.cardFieldCaption}>Date: {rfwiDetail.completed?.date}</Text></Row>
          
        </Grid>
      </CardItem>
      
      {
        displayStatus===2 &&
          <CardItem style={{marginTop:-10}}>
            <Grid>
              <Row style={{height:30 }}>

                <Col><Button rounded success small style={{flex:1,marginRight:10}} onPress={()=>this.onUpdateRFWI('Reinspection')}>
                  <Text >Reinspection</Text></Button>
                </Col>
              </Row>
            </Grid>
          </CardItem>
      }

      </Card>
    )
  }

  renderCompletedCard()
  {
    let displayStatus=0;
    let rfwiDetail = this.state.rfwi; 
    let signature='';


    if(rfwiDetail.status!=='Rejected')
    {
      let user = this.state.user;
      
  
      if (rfwiDetail.completed)
      signature = rfwiDetail.completed?.signature as string;

      if (signature===null)
        signature=''

      if (signature!==undefined && signature.length>0)
        displayStatus=1

      if(user.groupId==='8' && rfwiDetail.status==='Requested')
      {
        displayStatus=2;
        if (rfwiDetail.completed)
        {
          rfwiDetail.completed.by=user.userId;
          rfwiDetail.completed.name=user.userName;
          rfwiDetail.completed.date=moment(new Date()).format('DD/MM/YYYY');
          rfwiDetail.completed.signature=signature
        }
        else
        {
          rfwiDetail.completed = {by:user.userId,name:user.userName,date:moment(new Date()).format('DD/MM/YYYY'),remarks:'',signature:''}
        }
        
      }
        
    }
      

    if (displayStatus===0)
      return (<Fragment></Fragment>)
    else
    return(
    
      <Card transparent style={{marginTop:-12}}>
      <CardItem header>
        <H3 style={styles.cardHeaderCaption}>Completion Detail</H3>
      </CardItem>
      {
        displayStatus===1 &&
          <CardItem style={{marginTop:-10}}>
          <Grid>
            <Row style={{height:30 }}>
              <Text style={styles.cardFieldCaption}>Name: {rfwiDetail.completed?.name}</Text>
            </Row>
            <Row style={{height:30 }}><Text style={styles.cardFieldCaption}>Remarks:</Text></Row>
          <Row style={{marginBottom:4 }}><Text>{rfwiDetail.completed?.remarks}</Text></Row>
          {signature.length>10 &&<Row><Image source={{uri: signature}} resizeMode="contain" style={{alignSelf:'center', height: 60, width: Dimensions.get('window').width*0.75}} /></Row>}
          <Row style={{height:30 }}><Text style={styles.cardFieldCaption}>Date: {rfwiDetail.completed?.date}</Text></Row>
          
        </Grid>
      </CardItem>
      }
      {
        displayStatus===2 &&
          <CardItem style={{marginTop:-10}}>
            <Grid>
            <Row style={{height:30 }}>
              <Text style={styles.cardFieldCaption}>Name: {rfwiDetail.completed?.name}</Text>
            </Row>
            <Row style={{height:30 }}><Text style={styles.cardFieldCaption}>Remarks:</Text></Row>
              <Row style={{marginBottom:4 }}><Textarea rowSpan={3}  bordered placeholder="enter remarks if any" 
                style={{marginTop:4,flex:1}} onChangeText={(e)=>this.onRemarkChange('Completed',e)}/>
              </Row>
            {signature.length>10 &&<Row><Image source={{uri: signature}} resizeMode="contain" style={{alignSelf:'center', height: 60, width: Dimensions.get('window').width*0.75}} /></Row>}
            {signature.length<10 &&
            <Row style={{height:30 }}><Text note>Please draw signature</Text>
            
            </Row>}
            <Row style={{height:30 }}><Text style={styles.cardFieldCaption}>Date: {rfwiDetail.completed?.date}</Text></Row>
            
              <Row style={{height:30 }}>

              <Col><Button rounded  small style={{flex:1,marginRight:10}} onPress={()=>this.modelSignature.current?.onShowModal('Completed')}>
                  <Text >Signature</Text></Button>
                </Col>
                <Col><Button rounded danger small style={{flex:1,marginRight:10}} onPress={()=>this.onUpdateRFWI('Rejected')}>
                  <Text >Reject</Text></Button>
                </Col>
                <Col><Button rounded success small style={{flex:1,marginRight:10}} onPress={()=>this.onUpdateRFWI('Completed')}>
                  <Text >Complete</Text></Button>
                </Col>
              </Row>
            </Grid>
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
            <Title>{this.props.route.params.rfwi.project.name}</Title>
            <Title>{this.state.rfwi.no.length===0?'New':this.state.rfwi.no +' - ' + moment.localeData().ordinal(this.state.rfwi.inspectionNo) +' Inspection '} </Title>
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
                    <Col><Text>{this.state.rfwi.status}</Text></Col>
                    </Row>
                    <Row style={{height:30}}>
                    <Col style={{ width: 100}}><Text style={styles.cardFieldCaption}>Created on:</Text></Col>
                    <Col><Text>{this.state.rfwi.entryDate}</Text></Col>
                    </Row>
                    </Grid>
                </CardItem>
            </Card>
            {this.renderInformationCard()}
            {this.renderChecklistCard()}
            {this.state.rfwi.status !=='Completed' && this.renderClearanceRequiredCard()}
            {this.renderLocationCard()}
            {this.renderInspectionCard()}
            
            {this.renderStructureClearanceCard()}
            {this.renderMandEClearanceCard()}
            {this.renderOthersClearanceCard()}
            {this.renderRequestCard()}
            {this.renderReInspectionCard()}
            {this.renderCompletedCard()}

        </Content>
        <ModelTimeSlot ref={this.modelTimeSlot} onSlotSelected={this.onSlotSelected}/>
        <ModelLoader ref={this.modelLoader} /> 
        <ModelSignature ref={this.modelSignature} onSignatureDone={this.onSignatureDone} />
      </Container>
    );
  }
}


export default RFWIManage;
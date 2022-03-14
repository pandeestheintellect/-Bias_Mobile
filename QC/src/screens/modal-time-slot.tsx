import moment from "moment";
import { Button, Card, CardItem, Col, Content, Grid, H3, Icon, Row } from "native-base";
import React, { Component } from "react";
import { Dimensions } from "react-native";
import { Modal, StyleSheet, Text, View } from "react-native";

import {styles} from "../theme/appStyle";
import { downloadTimeSlot, ITimeSlotAvailable } from "../utilities/project-functions";

interface ITimeSlot {
    start:string;
    end:string;
    display:string;
    style:string;
    status:number;
    index:number;
    notes?:string;
}

interface Props{
    onSlotSelected:(start:string,end:string,slot:string)=>void;
}

interface IState{
    showModel:boolean;
    slots:ITimeSlot[];
    slotArray:number[];
    startId:number;
    endId:number;
    startTime:string;
    endTime:string;
    selected:string;
    caption:string;

}


class ModelTimeSlot extends Component<Props,IState> {

    state:IState;
    
    constructor(props:Props)
    {
        super(props)

        let slot=[0,2,4,6,8,10,12,14,16,18,20,22];
        
        this.state = {
            showModel:false,
            slots:timeSlots,
            slotArray:slot,
            startId:-1,endId:-1,startTime:'',endTime:'',
            selected:'',caption:'OKAY'    
        }

        this.getSlotLabel = this.getSlotLabel.bind(this)
        this.onBook=this.onBook.bind(this)
        this.onTimeSlot = this.onTimeSlot.bind(this)
        this.onMarkSlot = this.onMarkSlot.bind(this)

    }
    onShowModal(inspectionDate:string, inspectorId:number,start:string,end:string)
    {
        downloadTimeSlot(inspectionDate, inspectorId,this.onTimeSlot);

        let slot = this.state.slots;
        for(let i=0;i<24;i++)
        {
            slot[i].status=1;
            slot[i].style='available-slot';   
        }
        
        this.setState({showModel:true,slots:slot,startTime:start,endTime:end,caption:'OKAY'});
        
    }

    onTimeSlot(status:ITimeSlotAvailable[]|string)
    {
        let start='';
        let end=''
        if(Array.isArray(status))
        {
            status.forEach(timeSlot=>
            {
                if (timeSlot.start && timeSlot.start.length>=5)
                {
                    start = moment(timeSlot.start,'hh:mm:ss').format('hh:mm a').substring(0,5);
                }
                    
                if (timeSlot.end && timeSlot.end.length>=5)
                {
                    end = moment(timeSlot.end,'hh:mm:ss').format('hh:mm a').substring(0,5);
                }

                if (start.length>3 && end.length>3)
                    this.onMarkSlot(start,end,3,'Booked: '+ timeSlot.no);
            })
        }

        this.onMarkSlot(this.state.startTime,this.state.endTime,2);
    }

    onMarkSlot(startTime:string,endTime:string,status:number,notes?:string)
    {

        let slot = this.state.slots;
        let start = 0;
        let end = slot.length;

        let startSelected=-1;
        let endSelected=-1;

        if(startTime.length>=5)
            startSelected = slot.filter(sl=>sl.start===startTime)[0].index;

        if(endTime.length>=5)
            endSelected = slot.filter(sl=>sl.end===endTime)[0].index;
        

        for(let i=start;i<end;i++)
        {
            if(startSelected>=0 && i>=startSelected && endSelected>=0 && i<=endSelected)
            {
                if(status===2)
                    slot[i].style='current-booked-slot';   
                else
                {
                    slot[i].style='not-available-slot';   
                    if(notes)
                        slot[i].notes=notes;
                }
                    
                slot[i].status=status;
            }
               
        }
        this.setState({startId:startSelected,endId:endSelected,slots:slot});
    }
    
    onBook(slotNo:number)
    {
        let slot = this.state.slots;
        console.log(slotNo)
        if(slot[slotNo].status!==3)
        {
            let sel='';
            if(slot[slotNo].status===1)
            {
                slot[slotNo].status=2;
                slot[slotNo].style='current-booked-slot'; 
            }
            else
            {
                slot[slotNo].status=1;
                slot[slotNo].style='available-slot';   
            }
            this.setState({slots:slot,selected:sel})
        }
        else
        {
            if (slot[slotNo].notes)
                this.setState({selected:slot[slotNo].notes as string})
        }

        this.setState({caption:'OKAY'})
 
    }
    onSlotSelected=()=>
    {
        if(this.state.caption==='CONFIRM')
        {
            let start = '';
            let end = '';
            
            if(this.state.startId>=0)
                start= timeSlots[this.state.startId].start;
            if(this.state.endId>=0)
                end =timeSlots[this.state.endId].end;
    
            this.props.onSlotSelected(start,end,this.state.selected);
            this.setState({showModel:false})
        }
        else
        {
            let slot = this.state.slots;
            let slotSelected = slot.filter(sl=> sl.status===2);
            console.log(slotSelected.length)
            if (slotSelected.length===0)
            {
                this.setState({showModel:false})
                return ;
            }
            let sel=''
            let sId=slotSelected[0].index;
            let eId=slotSelected[slotSelected.length-1].index;
            let firstEnd=-1;
            if (slotSelected.length===0)
            {
                sel='No slot selected'
            }
            else
            {
                for(let i=sId;i<=eId;i++)
                {
                    if(slot[i].status===3)
                    {
                        firstEnd=slot[i].index;
                        break;
                    }
                    else
                        slot[i].style='current-booked-slot';   
                }
                if (firstEnd>=0 &&eId!==firstEnd)
                {
                    for(let i=firstEnd;i<=eId;i++)
                    {
                        if(slot[i].status!==3)
                        {
                            slot[i].style='available-slot';   
                            slot[i].status=1;   
                        }
                    }
                    eId = firstEnd;
                }
                if(sId>=0)
                    sel='From: '+ slot[sId].start;
                if(eId>=0)
                    sel +=', Till: '+ slot[eId].end + ' ' + slot[eId].display;
            }

            this.setState({slots:slot,selected:sel,caption:'CONFIRM',startId:sId,endId:eId})
        }
    }

    getSlotLabel = (startTime:string,endTime:string):string => {

        let label='';
        let timeSlot:ITimeSlot;
        if(startTime.length===0 && endTime.length===0)
            label ='Book slot'
        else if (startTime.length>=5 && endTime.length>=5 && startTime===endTime)
        {
            timeSlot = timeSlots.filter(sl=>sl.start===startTime)[0];
            label='At: '+  timeSlot.start + '-' + timeSlot.end + ' ' + timeSlot.display;
        }
        else
        {
            if(startTime.length>=5)
                label = 'From: '+ timeSlots.filter(sl=>sl.start===startTime)[0].start;

            if(endTime.length>=5)
            {
                timeSlot = timeSlots.filter(sl=>sl.end===endTime)[0];
                label +=', Till: '+ timeSlot.end + ' ' + timeSlot.display;
            }
                

        }
        return label;
    }
	
    
    getSlotStyle(slot:string)
    {
        if (slot==='available-slot')
            return styles1.availableSlot;
        else if (slot==='current-booked-slot')
            return styles1.currntBookedSlot;
        else
            return styles1.bookedSlot;
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
        
            <View style={styles1.centeredView}> 
            <View style={styles1.modalView}>
                
            <Card transparent >
                        
                        <CardItem>
                            <Grid style={styles1.grid}>
                                <Row>
                                    <Col style={{justifyContent:'center' }}><H3 style={styles.cardHeaderCaption}>Choose inspection slot</H3></Col>
                                    <Col style={{ width: 50,justifyContent:'center' }}><Button transparent onPress={()=>this.setState({showModel:false})}><Icon active name="close-outline" /></Button></Col>
                                </Row>
                                {
                                    this.state.slotArray.map((e:number,index:number)=>
                                        <Row key={index} style={{marginBottom:2}}>
                                            <Col>
                                                <Button style={this.getSlotStyle(this.state.slots[e].style)} full small onPress={()=>this.onBook(e)} >
                                                    <Text>{this.state.slots[e].start + '-'+ this.state.slots[e].end + ' ' +  this.state.slots[e].display}</Text></Button>
                                                </Col>
                                            <Col>
                                                <Button style={this.getSlotStyle(this.state.slots[e+1].style)} full small onPress={()=>this.onBook(e+1)}>
                                                    <Text>{this.state.slots[e+1].start + '-'+ this.state.slots[e+1].end + ' ' +  this.state.slots[e+1].display}</Text></Button></Col>
                                        </Row>
                                    )
                                }
                                <Row style={{height:50,marginTop:10}}>
                                    <Col style={{justifyContent:'center' }}><Text>{this.state.selected}</Text></Col>
                                    <Col style={{ width: 100,justifyContent:'center' }}>
                                        <Button full onPress={()=>this.onSlotSelected()}><Text style={{color:'white'}}>{this.state.caption}</Text></Button>
                                    </Col>
                                </Row>
                            </Grid>
                        </CardItem>
                    </Card>
       
                
            </View>
        </View>

        </Modal>
        )
    }
}

const styles1 = StyleSheet.create({
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
      padding: 2,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      width:Dimensions.get('window').width*0.9,
      height:600,
    },

    grid: {
        width:Dimensions.get('window').width*0.9,
        height:550,
      },

	    availableSlot: {
        margin:5,
        color: 'white',
        backgroundColor: 'rgb(113, 219, 113)',
    },
    currntBookedSlot: {
        margin:5,
        color: 'white',
        backgroundColor: 'green',
    },
    bookedSlot: {
        margin:5,
        color: 'white',
        backgroundColor: 'gray',
    }

  });

  const timeSlots:ITimeSlot[]=[
    {start:'08:00',end:'08:30',display:'AM',style:'available-slot',status:1,index:0},
    {start:'08:30',end:'09:00',display:'AM',style:'available-slot',status:1,index:1},
    {start:'09:00',end:'09:30',display:'AM',style:'available-slot',status:1,index:2},
    {start:'09:30',end:'10:00',display:'AM',style:'available-slot',status:1,index:3},
    {start:'10:00',end:'10:30',display:'AM',style:'available-slot',status:1,index:4},
    {start:'10:30',end:'11:00',display:'AM',style:'available-slot',status:1,index:5},
    {start:'11:00',end:'11:30',display:'AM',style:'available-slot',status:1,index:6},
    {start:'11:30',end:'12:00',display:'PM',style:'available-slot',status:1,index:7},
    {start:'12:00',end:'12:30',display:'PM',style:'available-slot',status:1,index:8},
    {start:'12:30',end:'01:00',display:'PM',style:'available-slot',status:1,index:9},
    {start:'01:00',end:'01:30',display:'PM',style:'available-slot',status:1,index:10},
    {start:'01:30',end:'02:00',display:'PM',style:'available-slot',status:1,index:11},
    {start:'02:00',end:'02:30',display:'PM',style:'available-slot',status:1,index:12},
    {start:'02:30',end:'03:00',display:'PM',style:'available-slot',status:1,index:13},
    {start:'03:00',end:'03:30',display:'PM',style:'available-slot',status:1,index:14},
    {start:'03:30',end:'04:00',display:'PM',style:'available-slot',status:1,index:15},
    {start:'04:00',end:'04:30',display:'PM',style:'available-slot',status:1,index:16},
    {start:'04:30',end:'05:00',display:'PM',style:'available-slot',status:1,index:17},
    {start:'05:00',end:'05:30',display:'PM',style:'available-slot',status:1,index:17},
    {start:'05:30',end:'06:00',display:'PM',style:'available-slot',status:1,index:19},
    {start:'06:00',end:'06:30',display:'PM',style:'available-slot',status:1,index:20},
    {start:'06:30',end:'07:00',display:'PM',style:'available-slot',status:1,index:21},
    {start:'07:00',end:'07:30',display:'PM',style:'available-slot',status:1,index:22},
    {start:'07:30',end:'08:00',display:'PM',style:'available-slot',status:1,index:23},


]

export default ModelTimeSlot;
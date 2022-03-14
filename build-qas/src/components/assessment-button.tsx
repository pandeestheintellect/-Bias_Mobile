import React from 'react';

import Button from '@material-ui/core/Button'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface  IProps{
    cardIndex: number;
    rowIndex: number;
    colIndex: number;
    id: number;
    processId: number;
    result:number;
    backgroud?:string;
    noTick?:boolean;
    disabled?:boolean;
    onProcessChange: (cardIndex: number,id: number,processId: number,rowIndex: number,colIndex: number,oldStatus:number, currentStatus:number) => void;
}
interface IState {
    count: number;
}

export default class AssessmentButton extends React.Component<IProps, IState> 
{
    private oldStatus:number=0; 
    private currentStatus:number=0;

    constructor(props:IProps)
    {
        super(props);
        this.onInit();
        this.state ={count: this.currentStatus};
    }
    onInit()
    {
        if (this.props.result===-1)
        {
            this.currentStatus=0;
        }
        else
            this.currentStatus=this.props.result;
        
    }
    componentDidUpdate (prevProps:IProps) {
        if(prevProps.result !==this.props.result)
        {
            this.onInit();
        }
     }

    private onButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (this.props.result===-1)
            return;
        this.oldStatus = this.currentStatus;
        this.currentStatus = this.currentStatus+ 1;
        if(this.props.noTick && this.currentStatus===1)
        {
            this.currentStatus = this.currentStatus+ 1;
        }
        if (this.currentStatus>2) 
            this.currentStatus=0;
        this.setState({count:this.currentStatus})  ;

        this.props.onProcessChange(this.props.cardIndex,this.props.id, this.props.processId,this.props.rowIndex,this.props.colIndex, this.oldStatus,this.currentStatus);
    };
    
    private getBackground (){
        switch(this.currentStatus)
        {
            case 1:
                return "auc-tool-tick";
            case 2:
                return "auc-tool-cross";
            case 0:
                if (this.props.backgroud)
                    return "auc-tool-null " + this.props.backgroud;
                else
                    return "auc-tool-null";
        }
        return "auc-tool-null";
    }

    private getIcon (){
        //return this.props.id;
        
        switch(this.currentStatus)
        {
            case 1:
                return (<FontAwesomeIcon icon="check"  style={{fontSize:'14px'}}/>);
            case 2:
                return (<FontAwesomeIcon icon="times"  style={{fontSize:'14px'}}/>);
            case 0:
                return (<FontAwesomeIcon icon="square"  style={{fontSize:'20px'}}/>);
        }
        return (<FontAwesomeIcon icon="square"  style={{fontSize:'20px'}}/>);
        
    }

    render() {
      return <Button style={{borderRadius:0,minWidth:'26px',maxWidth:'26px'}} 
            className={this.getBackground()} disabled={this.props.disabled}
            onClick={this.onButtonClick}>{this.getIcon()}</Button>;
    }
}
  




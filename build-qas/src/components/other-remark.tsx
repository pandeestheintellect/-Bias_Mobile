import React from 'react';

import { TextField } from '@material-ui/core';

interface  IProps{
    cardIndex: number;
    otherRemark:string;
    canEdit:boolean;
    onOtherRemarks: (cardIndex: number,remark:string) => void;
}

interface  IState{
    otherRemark:string;
}


export default class OtherRemark extends React.Component<IProps,IState> 
{

    constructor(props:IProps)
    {
        super(props);
        this.state={otherRemark:this.props.otherRemark}
    }
    
    onRemarkChange(e:React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>)
    {
        this.setState({otherRemark:e.target.value});
        this.props.onOtherRemarks(this.props.cardIndex,e.target.value)
    }

    render() {
      return (
          <div style={{width:'100%',marginTop:'2px',marginLeft:'4px'}}>
              <TextField style={{width:'96%'}}
                    id={'other-remark'+this.props.cardIndex} 
                    value={this.state.otherRemark}
                    onChange={(e)=>this.onRemarkChange(e)}
                    label="6) Others please specify"
                    multiline
                    disabled={this.props.canEdit===true?false:true}
                    rows={2}
                />
          </div>
      );
    }
}
  




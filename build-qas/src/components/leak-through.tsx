import React from 'react';

import { MenuItem, Select } from '@material-ui/core';
import { ILeak } from '../models/assessement';

interface  IProps{
    cardIndex: number;
    leaks:ILeak[];
    leakId:number;
    allowEdit:boolean;
    onLeakThru: (cardIndex: number,leakId:number) => void;
}

interface  IState{
    leakId:number;
    
}


export default class LeakThrough extends React.Component<IProps,IState> 
{

    constructor(props:IProps)
    {
        super(props);   
        this.state={leakId:this.props.allowEdit?1:this.props.leakId}
    }
    
    onLeakThru(value:unknown)
    {
        this.setState({leakId:parseInt(value as string) });
        this.props.onLeakThru(this.props.cardIndex,parseInt(value as string))
    }



    render() {
      return (
          <div style={{width:'100%'}}>
              <Select style={{width:'300px'}}
                    labelId="field-window-leak-outlined-label"
                    id="field-window-leak"
                    value={this.state.leakId}
                    onChange={(e)=>this.onLeakThru(e.target.value)}
                    disabled={this.props.allowEdit}
                    label="Leak"
                    >
                    {
                        this.props.leaks.map((leak:ILeak,index:number)=>
                            <MenuItem key={index} value={leak.id}>{leak.name} </MenuItem>
                        )
                    }
                </Select>
          </div>
      );
    }
}
  




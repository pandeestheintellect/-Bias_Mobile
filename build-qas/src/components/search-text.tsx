import React, { Component } from 'react';

import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface IProps {
    onSearch:(keyword:string)=>void
}


interface IState {
    keyword:string,
}

class SearchInput extends Component<IProps,IState> {

    state:IState;
    constructor(props:IProps)
    {
        super(props)
        this.state={
            keyword:''
        }
        this.onKey = this.onKey.bind(this)
    }  
    onSearch=()=>
    {
        this.props.onSearch(this.state.keyword);
    }
    onKey(e: React.ChangeEvent<HTMLInputElement>)
    {
        this.setState({keyword:e.target.value})
        this.props.onSearch(e.target.value);
    }
    render() {
        return (
            <Paper component="form" style={{padding: '2px 4px',display: 'flex', alignItems: 'center', width: 240, marginRight:'6px' }}>
                
                <IconButton style={{padding: 4}} aria-label="search">
                  <FontAwesomeIcon icon="search" style={{fontSize:'18px'}}/>
                </IconButton>
               
              <InputBase style={{marginLeft: '6px',flex: 1 }}
                value={this.state.keyword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>)=>this.onKey(e)}
                placeholder='Search ...'
                inputProps={{ 'aria-label': 'Search ' }}
              />
              {this.state.keyword.length>0 &&
              <Tooltip title="click to clear search"  arrow>
              <IconButton style={{padding: 4}} aria-label="clear" onClick={(e)=>this.setState({keyword:''},this.onSearch)}>
              <FontAwesomeIcon icon="times" style={{fontSize:'18px'}}/>
              </IconButton>
              </Tooltip>
              }

              
            </Paper>
          );
        
    }
}

export default SearchInput ;
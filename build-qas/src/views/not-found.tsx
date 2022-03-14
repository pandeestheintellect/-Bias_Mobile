import React, { Component } from 'react';

class NotFound extends Component {
 
    render() {
        return (
            <div style={{position: 'absolute',left:'50%',top:'50%',transform:'translate(-50%, -50%)'}}>
                <h1>Sorry, this page isn't available.</h1>
            </div>
        );
    }
}
export default NotFound;
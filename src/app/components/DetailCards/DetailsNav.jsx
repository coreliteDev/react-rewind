import React, { useState } from 'react';

var Link = require('react-router-dom').Link;
var NavLink = require('react-router-dom').NavLink;
//styled component imports
import { Buttons, Button, DetailsNavWrapper, Ul } from '../../styles/Nav.jsx';


export default function RightNav(props) {
  return (
    <>
      <DetailsNavWrapper>
        <Buttons>
          <NavLink activeClassName='active' to='/'>
            <Button>actions</Button>
          </NavLink>
          <NavLink activeClassName='active' to='/effects'>
            <Button>effects</Button>
          </NavLink>
          <NavLink activeClassName='active' to='/state'>
            <Button>state</Button>
          </NavLink>
        </Buttons>
      </DetailsNavWrapper>
    </>
  );
}

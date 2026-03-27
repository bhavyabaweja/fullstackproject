import React from 'react';
import { Navbar, NavbarBrand, Nav, NavItem, NavLink } from 'reactstrap';

const AppNavbar = () => (
  <Navbar color="dark" dark expand="md">
    <NavbarBrand href="/">Nexus</NavbarBrand>
    <Nav className="ms-auto" navbar>
      <NavItem>
        <NavLink href="/dashboard">Dashboard</NavLink>
      </NavItem>
      <NavItem>
        <NavLink href="/projects">Projects</NavLink>
      </NavItem>
    </Nav>
  </Navbar>
);

export default AppNavbar;
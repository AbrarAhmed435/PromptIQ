import React from 'react';
import { confirmAlert } from 'react-confirm-alert'; 
import 'react-confirm-alert/src/react-confirm-alert.css'; 

function LogoutButton() {
  const handleLogout = () => {
    confirmAlert({
      title: 'Confirm to logout',
      message: 'Are you sure to logout?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            // Perform logout here
          }
        },
        {
          label: 'No',
          onClick: () => {
            // Do nothing
          }
        }
      ]
    });
  };

  return <button onClick={handleLogout}>Logout</button>;
}

export default LogoutButton;

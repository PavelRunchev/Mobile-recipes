import React from 'react';

function UserTableModel({ user, index }) {
    const isRole = user.roles.includes('Owner') 
        ? 'Owner' 
        :  user.roles.includes('Admin') 
            ? 'Admin'
            : 'User';

    return (
        <tr>
            <td className="label-cell">{index + 1}</td>
            <td className="numeric-cell text-align-left underline-none">{user.username}</td>
            <td className="numeric-cell text-align-left">{isRole}</td>
            <td className="numeric-cell text-align-left">{user.email}</td>
            <td className="numeric-cell text-align-left">{user.gender}</td>
        </tr>
    )
}

export default UserTableModel;
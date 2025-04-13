import React from 'react';
import '../css/admin-settings.css';
import { Page, Navbar, LoginScreenTitle, useStore } from 'framework7-react';

function AdminSettingsPage() {
    const feedbackArr = useStore('getFeedback');

    return (
        <Page name='admin-settings' className='admin-color'>
            <Navbar title='Admin Settings' backLink='Back' className='admin-color admin-navbar'/>

            <div className='block margin-top mb-5'></div>
            <LoginScreenTitle className='admin-color margin-top mb-5'>Admin Settings</LoginScreenTitle>
          

        </Page>
    )
}

export default AdminSettingsPage;
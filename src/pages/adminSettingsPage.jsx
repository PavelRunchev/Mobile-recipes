import React, { useState, useEffect} from 'react';
import '../css/admin-settings.css';
import { Page, Navbar, LoginScreenTitle, useStore, BlockTitle, List, Block, Row, ListItem } from 'framework7-react';

import { getAllAuthUsers } from '../services/userServices';

import UserTableModel from '../components/userTableModel';
import RecipeTableModel from '../components/recipeTableModel';
import FeedbackModel from '../components/feedbackModel';

function AdminSettingsPage() {
    const [allUsers, setAllUsers] = useState([]);
    const feedbackArr = useStore('getFeedback');
    const allRecipes = useStore('getAllRecipes');
    

    useEffect(async () => {
        const getUsers = await getAllAuthUsers();
        setAllUsers(getUsers);
    }, []);

    return (
        <Page name='admin-settings' >
            <Navbar title='Admin Settings' backLink='Back' className='admin-color admin-navbar'/>

            <div className='block margin-top mb-5'></div>
            <LoginScreenTitle className='admin-color margin-top mb-5'>Admin Settings</LoginScreenTitle>


            <List dividersIos simpleList strong outline className='mb-0'>
                <ListItem className='global-bold'>User Stats</ListItem>
            </List>
            <div className="data-table background-color-yellow">
                <table>
                    <thead>
                        <tr>
                            <th className="label-cell">N</th>
                            <th className="numeric-cell text-align-left">Username</th>
                            <th className="numeric-cell text-align-left">Role</th>
                            <th className="numeric-cell text-align-left">Email</th>
                            <th className="numeric-cell text-align-left">Gender</th>
                        </tr>
                    </thead>
                    
                    <tbody>
                        {allUsers != null && allUsers.map((u, i) => <UserTableModel key={u.id} user={u} index={i}/> )}
                    </tbody>
                </table>

                <Block>Registered Users: {allUsers.length}</Block>
            </div>


            <List dividersIos simpleList strong outline className='mb-0'>
                <ListItem className='global-bold'>User Feedback</ListItem>
            </List>
            <List strong outlineIos dividersIos insetMd accordionList accordionOpposite className='ul mt-0'>
               {feedbackArr.map(f => <FeedbackModel key={f.id} content={f}/> )}
            </List>


            <List dividersIos simpleList strong outline className='mb-0'>
                <ListItem className='global-bold'>Recipe Stats</ListItem>
            </List>
            <div className="data-table background-color-yellow">
                <table>
                    <thead>
                        <tr>
                            <th className="label-cell">N</th>
                            <th className="numeric-cell text-align-left">Name</th>
                            <th className="numeric-cell text-align-left">Category</th>
                            <th className="numeric-cell text-align-left">Creator</th>
                            <th className="numeric-cell text-align-left">Public</th>
                            <th className="numeric-cell text-align-left">Rating</th>
                            <th className="numeric-cell text-align-left">Date</th>
                        </tr>
                    </thead>
                    
                    <tbody>
                        {allUsers != null && allRecipes != null && allRecipes.map((r, i) => <RecipeTableModel key={r.id} recipe={r} index={i} allUsers={allUsers}/> )}
                    </tbody>
                </table>

                <Block>Registered Recipes: {allRecipes.length}</Block>
            </div>
        </Page>
    )
}

export default AdminSettingsPage;
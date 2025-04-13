import React, { useState } from 'react';
import { Navbar, Page, Button, List, ListInput } from 'framework7-react';

import { saveImageUrl } from '../services/recipeService';

function AboutPage() {
  const [url, setUrl] = useState('');

  async function submitUrl(e) {
    if(url == '') return;

    await saveImageUrl({ imageUrl: url});
  }

  return (
    <Page>
      <Navbar title="Cards Expandable" />

    
      <div className='form-column-container'>
          <div className='text-center'>Requires valid url!</div>
              <List strongIos dividersIos insetIos className='form-list'>
                  <ListInput 
                      onChange={(e) => setUrl(e.target.value)}
                      label='URL' 
                      name='url' 
                      type='url' 
                      placeholder='User Avatar' 
                      color='teal'           
                      info='Enter valid url!'
                      value={url}
                      className='input-field no-margin'
                      clearButton
                  >
                  </ListInput>
                  <Button onClick={submitUrl} on fill raised color='black' className='color-white'>add url</Button>
              </List>
      </div>
    

    </Page>
  )
};

export default AboutPage;

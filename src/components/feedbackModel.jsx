import React from 'react';

import { ListItem, AccordionContent, Block } from 'framework7-react';


function FeedbackModel({ content }) {
    return (
        <ListItem accordionItem title={content.sender} className="background-color-yellow" after={content.date}>
            <AccordionContent>
                <Block>
                    <p>{content.content}</p>
                </Block>
            </AccordionContent>
        </ListItem>
    )
}

export default FeedbackModel;
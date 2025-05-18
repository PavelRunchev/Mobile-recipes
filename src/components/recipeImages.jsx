import React, { useRef, useEffect, useState } from 'react';
import { PhotoBrowser, Block, Button, Col, Row, BlockTitle, useStore } from 'framework7-react';
import { FaRegImage } from "react-icons/fa6";

function RecipeImagesPage({ data }) {
    const [photos, setPhotos] = useState([]);
    const [thumbs, setThumbs] = useState([]);
    const popup = useRef(null);

    const isDarkMode = useStore('themeIsDark');


    useEffect(() => {
        setPhotos(data);
        setThumbs(data);
    }, [photos, thumbs]);

    
    return (
        <Block strongIos outlineIos color='teal'>
            <div className="grid grid-cols-6 grid-gap">
                <div>
                    <PhotoBrowser exposition={true} photos={photos} thumbs={thumbs} type="standalone" ref={popup} iconsColor='blue' theme={isDarkMode ? 'dark' : 'light'}/>
                </div>
            </div>
            <BlockTitle className='text-align-center global-color'> Мore photos of the recipe.</BlockTitle>
            <Row className='flex-center-container'>
                <Col width='100'>
                    <Button  large fill raised onClick={() => popup.current.open()} color='blue'>
                        <FaRegImage size={18} className='color-white'/> &nbsp; <span className='color-white'>Show more images</span>
                    </Button>
                </Col>
            </Row>

        </Block>
    );
};

export default RecipeImagesPage;
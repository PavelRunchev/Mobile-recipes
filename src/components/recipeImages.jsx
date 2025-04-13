import React, { useRef, useEffect, useState } from 'react';
import { PhotoBrowser, Block, Button, Col, Row, BlockTitle } from 'framework7-react';
import { FaRegImage } from "react-icons/fa6";

function RecipeImagesPage({ data }) {
    const [photos, setPhotos] = useState([]);
    const [thumbs, setThumbs] = useState([]);
    const popup = useRef(null);

    useEffect(() => {
        setPhotos(data);
        setThumbs(data);
    }, [photos, thumbs]);
    
    return (
        <Block strongIos outlineIos color='teal'>
            <div className="grid grid-cols-6 grid-gap">
                <div>
                    <PhotoBrowser exposition={true} photos={photos} thumbs={thumbs} type="popup" ref={popup} iconsColor='teal' colorTheme='teal'/>
                </div>
            </div>
            <BlockTitle className='text-align-center global-color'><FaRegImage size={18} color='teal'/> Мore photos of the recipe.</BlockTitle>
            <Row className='flex-center-container'>
                <Col width='100'>
                    <Button  large raised onClick={() => popup.current.open()} className='background-color-white' textColor='black'>Show more images</Button>
                </Col>
            </Row>

        </Block>
    );
};

export default RecipeImagesPage;
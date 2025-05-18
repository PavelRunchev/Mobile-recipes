import React from 'react';
import '../css/left-panel.css';

import { View, Page, Navbar, Link, BlockTitle, List,ListItem, Panel, useStore, Block, Col, Row } from 'framework7-react';
import freeRecipeLogo from '../public/best-recipes-logo.png';


import { FaScaleBalanced } from "react-icons/fa6";
import { FaRegCopyright } from "react-icons/fa";
import { FaEgg } from "react-icons/fa";
import { GiChickenOven } from "react-icons/gi";
import { LuDessert } from "react-icons/lu";
import { GiOctopus } from "react-icons/gi";
import { LuSalad } from "react-icons/lu";
import { GiFruitBowl } from "react-icons/gi";
import { FaBurger } from "react-icons/fa6";
import { GiCow } from "react-icons/gi";
import { GiSheep } from "react-icons/gi";
import { GiPig } from "react-icons/gi";
import { FaFish } from "react-icons/fa";
import { GiRabbit } from "react-icons/gi";
import { GiMushroom } from "react-icons/gi";
import { IoFastFood } from "react-icons/io5";

import { SiFramework7 } from "react-icons/si";
import { FaReact } from "react-icons/fa6";
import { RiFirebaseFill } from "react-icons/ri";
import { FaGithub } from "react-icons/fa6";

import { MdClose } from "react-icons/md";
import { FaUtensils } from "react-icons/fa6";
import { SiApachecordova } from "react-icons/si";

import Loading from './preloader';
import loading from '../public/loading.gif';

function LeftPanel({ getRecipesByCategory }) {
    let user = useStore('authUser');
    let categories = useStore('categories');
    let sortedCategories;
    if(categories != undefined)
        sortedCategories = categories.sort((a, b) => a.name.localeCompare(b.name));

    function setIconOnCurrentCategoryName(name) {
        if(name == 'Breakfast')
           return <><FaBurger size={24} className='margin-right global-color'/>{name}</>
        else if(name == 'Beef')
            return <><GiCow size={24} className='margin-right global-color'/>{name}</>
        else if(name == 'Chicken')
            return <><GiChickenOven size={24} className='margin-right global-color'/>{name}</>
        else if(name == 'Desserts')
            return <><LuDessert size={24} className='margin-right global-color'/>{name}</>
        else if(name == 'Eggs')
            return <><FaEgg size={24} className='margin-right global-color'/>{name}</>
        else if(name == 'Fish')
            return <><FaFish size={24} className='margin-right global-color'/>{name}</>
        else if(name == 'Lamb')
            return <><GiSheep size={24} className='margin-right global-color'/>{name}</>
        else if(name == 'Pigg')
            return <><GiPig size={24} className='margin-right global-color'/>{name}</>
        else if(name == 'Salad')
            return <><LuSalad size={24} className='margin-right global-color'/>{name}</>
        else if(name == 'Sea food')
            return <><GiOctopus size={24} className='margin-right global-color'/>{name}</>
        else if(name == 'Vegetarian')
            return <><GiFruitBowl size={24} className='margin-right global-color'/>{name}</>
        else if(name == 'Mushroom')
            return <><GiMushroom size={24} className='margin-right global-color'/>{name}</>
        else if(name == 'Rabbit')
            return <><GiRabbit size={24} className='margin-right global-color'/>{name}</>
        else
        return <><IoFastFood size={24} className='margin-right global-color'/>{name}</>
    }

    return (
        <Panel left cover themeGray>
            <View>
                <Page>
                    <Navbar className='global-color' title='Categories' subtitle='The Best Recipes'>
                        <div className='right'>
                            <Link panelClose className='link-without-underline' color='gray'><MdClose /></Link>
                        </div>
                    </Navbar>

                    <Block className='my-0'>
                        <Row className='flex-center-container '>
                            <img  data-src={freeRecipeLogo} placeholder={loading} className='lazy lazy-fade-in left-panel-image-logo'/>
                        </Row>
                    </Block>

                    <BlockTitle medium className='categories-names-container mt-2'>
                        <FaUtensils size={24} className='categories-recipe-icon global-color'/> 
                        &nbsp; <span className='left-panel-title'>All Categories</span>
                    </BlockTitle>

                    <List className='list-cateogry-left-panel'>
                        {sortedCategories ? sortedCategories.map(c => {
                            return <ListItem 
                                        key={c.id} 
                                        onClick={(e) => getRecipesByCategory(e, c.name)}  
                                        title={setIconOnCurrentCategoryName(c.name)} 
                                        link='#'  
                                        className='panel-close'
                                    />
                        }) : <Loading />}
                    </List>

                    <div className='left-panel-info-container'>
                        <div>
                            <Col className='left-panel-icon-framework-container'> 
                                <SiFramework7 size={24} style={{ color: 'rgb(237, 55, 33)'}}/> 
                                <FaReact size={24} style={{ color: 'rgb(24, 216, 252)'}}/> 
                                <SiApachecordova size={24}/>
                                <RiFirebaseFill size={24} style={{ color: 'rgb(254, 145, 45)'}}/> 
                                <FaGithub size={24}/> 
                            </Col>
                            <p className='margin-top padding-left mb-0' style={{ fontSize: '14px' }}>
                                Created by<span className='global-color'> Pavel Runchev</span>.
                            </p>
                        </div>

                        <div>
                            <p className='padding-left mb-0'>
                                <FaRegCopyright className='global-color'/> 2025 RAIDERS 
                                <span className='global-color'> Studio</span>
                            </p>
                         
                            <p className='padding-left'>
                                <FaScaleBalanced className='global-color' /> All rights reserved.
                            </p>
                            <hr className='global-color hr-tag'/>
                        </div>

                    </div>
                </Page>
            </View>
        </Panel>
    )
}

export default LeftPanel;